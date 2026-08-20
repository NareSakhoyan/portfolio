import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { addUsage, askModel, emptyUsage, estimateCostUsd, type Usage } from "./models";
import { ASK_SYSTEM_PROMPT } from "./prompt";
import type { Retriever } from "./retriever";
import { ASK_TOOLS, executeTool } from "./tools";

export const MAX_TURNS_PER_SESSION = 20;
export const MAX_MESSAGE_CHARS = 2000;
export const MAX_OUTPUT_TOKENS = 700;
const MAX_TOOL_ROUNDS = 4;
const TOOL_BUDGET_EXHAUSTED_TEXT =
  "I couldn't finish looking that up within my search budget. Please try a narrower question, or email Nare directly.";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(MAX_MESSAGE_CHARS),
});

export const askRequestSchema = z
  .object({ messages: z.array(chatMessageSchema).min(1).max(MAX_TURNS_PER_SESSION * 2) })
  .refine((v) => v.messages[v.messages.length - 1].role === "user", {
    message: "Last message must be from the user.",
  })
  .refine((v) => v.messages.filter((m) => m.role === "user").length <= MAX_TURNS_PER_SESSION, {
    message: `Session limit of ${MAX_TURNS_PER_SESSION} questions reached.`,
  });

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export type AskEvent =
  | { type: "text"; text: string }
  | { type: "tool"; name: string; input: unknown };

export interface AskResult {
  text: string;
  usage: Usage;
  costUsd: number;
  latencyMs: number;
  model: string;
  sources: string[];
  toolCalls: { name: string; input: unknown }[];
  stopReason: string | null;
}

export interface RunAskOptions {
  messages: ChatMessage[];
  retriever: Retriever;
  client?: Anthropic;
  model?: string;
  maxOutputTokens?: number;
  onEvent?: (event: AskEvent) => void;
  signal?: AbortSignal;
}

/**
 * Streaming manual tool loop: stream → collect final message → execute tools →
 * repeat until the model stops calling tools. Text deltas are forwarded through
 * `onEvent` as they arrive.
 */
export async function runAsk(options: RunAskOptions): Promise<AskResult> {
  const startedAt = Date.now();
  const client = options.client ?? new Anthropic();
  const model = options.model ?? askModel();
  const maxTokens = options.maxOutputTokens ?? MAX_OUTPUT_TOKENS;

  const history: Anthropic.MessageParam[] = options.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  let usage = emptyUsage();
  let text = "";
  const sources = new Set<string>();
  const toolCalls: AskResult["toolCalls"] = [];
  let stopReason: string | null = null;

  for (let round = 0; ; round++) {
    const stream = client.messages.stream(
      {
        model,
        max_tokens: maxTokens,
        system: ASK_SYSTEM_PROMPT,
        tools: ASK_TOOLS,
        messages: history,
      },
      { signal: options.signal },
    );
    stream.on("text", (delta) => {
      text += delta;
      options.onEvent?.({ type: "text", text: delta });
    });
    const message = await stream.finalMessage();
    usage = addUsage(usage, {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      cacheReadTokens: message.usage.cache_read_input_tokens ?? 0,
      cacheWriteTokens: message.usage.cache_creation_input_tokens ?? 0,
    });
    stopReason = message.stop_reason;

    const toolUses = message.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );
    if (message.stop_reason !== "tool_use" || toolUses.length === 0) break;
    if (round >= MAX_TOOL_ROUNDS) {
      // Out of tool budget: don't execute further tools; give the user a clear answer.
      text += TOOL_BUDGET_EXHAUSTED_TEXT;
      options.onEvent?.({ type: "text", text: TOOL_BUDGET_EXHAUSTED_TEXT });
      break;
    }

    history.push({ role: "assistant", content: message.content });
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const use of toolUses) {
      options.onEvent?.({ type: "tool", name: use.name, input: use.input });
      toolCalls.push({ name: use.name, input: use.input });
      const executed = await executeTool(use.name, use.input, options.retriever);
      executed.sources.forEach((s) => sources.add(s));
      results.push({
        type: "tool_result",
        tool_use_id: use.id,
        content: executed.content,
        is_error: executed.isError,
      });
    }
    history.push({ role: "user", content: results });
  }

  return {
    text,
    usage,
    costUsd: estimateCostUsd(model, usage),
    latencyMs: Date.now() - startedAt,
    model,
    sources: [...sources],
    toolCalls,
    stopReason,
  };
}

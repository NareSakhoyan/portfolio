import { z } from "zod";
import type { Usage } from "./models";

/** NDJSON events sent from /api/ask to the widget. */
export type AskStreamEvent =
  | { type: "text"; text: string }
  | { type: "tool"; name: string }
  | {
      type: "done";
      latencyMs: number;
      costUsd: number;
      usage: Usage;
      model: string;
      sources: string[];
    }
  | { type: "error"; message: string };

const usageSchema = z.object({
  inputTokens: z.number(),
  outputTokens: z.number(),
  cacheReadTokens: z.number(),
  cacheWriteTokens: z.number(),
});

const eventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({ type: z.literal("tool"), name: z.string() }),
  z.object({
    type: z.literal("done"),
    latencyMs: z.number(),
    costUsd: z.number(),
    usage: usageSchema,
    model: z.string(),
    sources: z.array(z.string()),
  }),
  z.object({ type: z.literal("error"), message: z.string() }),
]);

export function encodeEvent(event: AskStreamEvent): string {
  return `${JSON.stringify(event)}\n`;
}

/** Incrementally parse NDJSON; returns complete events and the leftover buffer. */
export function parseEvents(buffer: string): { events: AskStreamEvent[]; rest: string } {
  const lines = buffer.split("\n");
  const rest = lines.pop() ?? "";
  const events: AskStreamEvent[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const parsed = eventSchema.safeParse(JSON.parse(line));
      if (parsed.success) events.push(parsed.data);
    } catch {
      // Skip malformed lines rather than killing the stream.
    }
  }
  return { events, rest };
}

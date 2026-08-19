"use client";

import { useCallback, useRef, useState } from "react";
import { parseEvents, type AskStreamEvent } from "@/lib/ask/stream-protocol";

export const MAX_TURNS = 20;

export interface AnswerMeta {
  latencyMs: number;
  costUsd: number;
  model: string;
  sources: string[];
}

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: AnswerMeta;
  status?: "searching" | "streaming" | "done" | "error";
}

interface AskState {
  turns: ChatTurn[];
  error: string | null;
  isBusy: boolean;
}

const GENERIC_ERROR = "Something went wrong. Please try again.";

export function useAskChat() {
  const [state, setState] = useState<AskState>({ turns: [], error: null, isBusy: false });
  const abortRef = useRef<AbortController | null>(null);

  const userTurns = state.turns.filter((t) => t.role === "user").length;
  const remaining = Math.max(0, MAX_TURNS - userTurns);

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || state.isBusy || remaining === 0) return;

      const userTurn: ChatTurn = { id: crypto.randomUUID(), role: "user", content: trimmed };
      const assistantId = crypto.randomUUID();
      const history = [...state.turns, userTurn];
      setState({
        turns: [...history, { id: assistantId, role: "assistant", content: "", status: "searching" }],
        error: null,
        isBusy: true,
      });

      const controller = new AbortController();
      abortRef.current = controller;

      const patchAssistant = (patch: Partial<ChatTurn> | ((t: ChatTurn) => Partial<ChatTurn>)) =>
        setState((prev) => ({
          ...prev,
          turns: prev.turns.map((t) =>
            t.id === assistantId ? { ...t, ...(typeof patch === "function" ? patch(t) : patch) } : t,
          ),
        }));

      try {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: history.filter((t) => t.content).map((t) => ({ role: t.role, content: t.content })),
          }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? GENERIC_ERROR);
        }
        await consumeStream(response.body, (event) => {
          if (event.type === "text") {
            patchAssistant((t) => ({ content: t.content + event.text, status: "streaming" }));
          } else if (event.type === "tool") {
            patchAssistant({ status: "searching" });
          } else if (event.type === "done") {
            patchAssistant({
              status: "done",
              meta: { latencyMs: event.latencyMs, costUsd: event.costUsd, model: event.model, sources: event.sources },
            });
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        });
        setState((prev) => ({ ...prev, isBusy: false }));
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : GENERIC_ERROR;
        setState((prev) => ({
          turns: prev.turns.map((t) => (t.id === assistantId ? { ...t, status: "error" } : t)),
          error: message,
          isBusy: false,
        }));
      }
    },
    [state.isBusy, state.turns, remaining],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ turns: [], error: null, isBusy: false });
  }, []);

  return { ...state, ask, reset, remaining };
}

async function consumeStream(body: ReadableStream<Uint8Array>, onEvent: (e: AskStreamEvent) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parsed = parseEvents(buffer);
    buffer = parsed.rest;
    parsed.events.forEach(onEvent);
  }
  const tail = parseEvents(`${buffer}\n`);
  tail.events.forEach(onEvent);
}

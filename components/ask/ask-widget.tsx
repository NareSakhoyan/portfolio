"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { AskMessage } from "./ask-message";
import { MAX_TURNS, useAskChat } from "./use-ask-chat";

const SUGGESTIONS = [
  "What did Nare build at Prostrive?",
  "Is Nare available for a contract role?",
  "What's the stack of the job-search agent?",
];

export function AskWidget() {
  const { turns, error, isBusy, ask, reset, remaining } = useAskChat();
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const logRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!draft.trim()) return;
    void ask(draft);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <section id="ask" aria-labelledby="ask-title" className="mx-auto w-full max-w-5xl scroll-mt-24 px-5 pb-6 sm:px-8">
      <div className="rounded-2xl border border-border bg-bg-elevated p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="ask-title" className="font-serif text-2xl tracking-tight text-fg">
            Ask Nare
          </h2>
          <p className="text-xs text-fg-subtle">
            Answers only from my published profile · cites sources · {remaining}/{MAX_TURNS} questions left
          </p>
        </div>

        {turns.length === 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Suggested questions">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => void ask(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ol
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label="Conversation"
            className="mt-5 max-h-[26rem] space-y-4 overflow-y-auto pr-1"
          >
            {turns.map((turn) => (
              <AskMessage key={turn.id} turn={turn} />
            ))}
          </ol>
        )}

        {error ? (
          <p role="alert" className="mt-3 rounded-lg border border-border bg-accent-soft px-3 py-2 text-sm text-fg">
            {error}
          </p>
        ) : null}

        <form onSubmit={submit} className="mt-5 flex items-end gap-2">
          <label htmlFor={inputId} className="sr-only">
            Ask a question about Nare
          </label>
          <textarea
            id={inputId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={2000}
            placeholder={remaining === 0 ? "Session limit reached — refresh to start over" : "Ask about experience, projects, availability…"}
            disabled={isBusy || remaining === 0}
            className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-border bg-bg px-3.5 py-2.5 text-[0.95rem] text-fg placeholder:text-fg-subtle disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isBusy || remaining === 0 || !draft.trim()}
            className="h-[2.75rem] rounded-xl bg-fg px-4 text-sm font-medium text-bg transition-opacity disabled:opacity-40"
          >
            {isBusy ? "Thinking…" : "Ask"}
          </button>
          {turns.length ? (
            <button type="button" onClick={reset} className="h-[2.75rem] rounded-xl border border-border px-3 text-sm text-fg-muted hover:text-fg">
              Reset
            </button>
          ) : null}
        </form>
        <p className="mt-2 text-xs text-fg-subtle">
          Powered by Claude. Won’t discuss salary, won’t invent facts; if it doesn’t know, it says so.{" "}
          <a href="/evals" className="underline underline-offset-2 hover:text-fg">See the eval scorecard →</a>
        </p>
      </div>
    </section>
  );
}

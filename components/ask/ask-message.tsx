import type { ChatTurn } from "./use-ask-chat";

export function formatCost(usd: number): string {
  if (usd < 0.0001) return "<$0.0001";
  return `$${usd.toFixed(4)}`;
}

export function AskMessage({ turn }: { turn: ChatTurn }) {
  const isUser = turn.role === "user";
  return (
    <li className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl rounded-br-sm bg-fg px-4 py-2.5 text-[0.95rem] text-bg"
            : "max-w-[92%] text-[0.95rem] text-fg"
        }
      >
        {isUser ? (
          <p>{turn.content}</p>
        ) : (
          <>
            {turn.status === "searching" && !turn.content ? (
              <p className="text-fg-subtle" aria-live="polite">Searching Nare’s profile…</p>
            ) : null}
            {turn.content.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="whitespace-pre-wrap [&+&]:mt-2">
                {para}
              </p>
            ))}
            {turn.status === "error" && !turn.content ? (
              <p className="text-fg-subtle">No answer.</p>
            ) : null}
            {turn.meta ? (
              <p className="mt-2 text-xs text-fg-subtle">
                {(turn.meta.latencyMs / 1000).toFixed(1)}s · ≈{formatCost(turn.meta.costUsd)} · {turn.meta.model}
                {turn.meta.sources.length ? (
                  <>
                    {" "}
                    · sources: {[...new Set(turn.meta.sources.map((s) => s.split(" › ")[0]))].join(", ")}
                  </>
                ) : null}
              </p>
            ) : null}
          </>
        )}
      </div>
    </li>
  );
}

import type { Metadata } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { evalCaseSchema, type EvalCase, type Scorecard } from "@/lib/eval/types";

export const metadata: Metadata = {
  title: "Ask Nare eval scorecard",
  description: "How the Ask Nare assistant scores on deterministic checks and an LLM judge.",
  alternates: { canonical: "/evals" },
};

type StoredScorecard = Partial<Scorecard> & { note?: string; passRate: number | null };

async function loadScorecard(): Promise<StoredScorecard> {
  const raw = await fs.readFile(path.join(process.cwd(), "content", "evals", "scorecard.json"), "utf8");
  return JSON.parse(raw) as StoredScorecard;
}

async function loadCases(): Promise<EvalCase[]> {
  const raw = await fs.readFile(path.join(process.cwd(), "content", "evals", "ask-nare.jsonl"), "utf8");
  return raw
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => evalCaseSchema.parse(JSON.parse(l)));
}

export default async function EvalsPage() {
  const [card, cases] = await Promise.all([loadScorecard(), loadCases()]);
  const hasResults = typeof card.passRate === "number" && Array.isArray(card.cases) && card.cases.length > 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <Link href="/#ask" className="text-sm text-fg-muted hover:text-fg">← Ask Nare</Link>
      <h1 className="mt-6 font-serif text-4xl tracking-tight text-fg">Ask Nare — eval scorecard</h1>
      <p className="mt-3 max-w-[68ch] text-fg-muted">
        Every case runs through the real assistant, then through deterministic checks (required phrases, forbidden phrases, refusal expectation) and an LLM judge scoring against a rubric. Trap questions test salary, degree speculation, and off-topic requests. Regenerate with <code className="rounded bg-code-bg px-1 text-sm">npm run eval:ask -- --write</code>.
      </p>

      {hasResults ? (
        <>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Pass rate" value={`${Math.round((card.passRate ?? 0) * 100)}%`} />
            <Stat label="Threshold" value={`${Math.round((card.threshold ?? 0.8) * 100)}%`} />
            <Stat label="Model" value={card.model ?? "—"} />
            <Stat label="Total cost" value={`$${(card.totalCostUsd ?? 0).toFixed(4)}`} />
          </dl>
          <p className="mt-2 text-xs text-fg-subtle">Generated {card.generatedAt}</p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-fg-muted">
                  <th className="py-2 pr-4">Case</th>
                  <th className="py-2 pr-4">Result</th>
                  <th className="py-2 pr-4">Deterministic</th>
                  <th className="py-2 pr-4">Judge</th>
                  <th className="py-2 pr-4">Latency</th>
                  <th className="py-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {card.cases?.map((c) => (
                  <tr key={c.id} className="border-b border-border align-top">
                    <td className="py-2 pr-4">
                      <p className="font-medium text-fg">{c.id}</p>
                      <p className="text-fg-muted">{c.question}</p>
                    </td>
                    <td className="py-2 pr-4">{c.pass ? "✓ pass" : "✗ fail"}</td>
                    <td className="py-2 pr-4 text-fg-muted">{c.deterministic.pass ? "✓" : c.deterministic.failures.join("; ")}</td>
                    <td className="py-2 pr-4 text-fg-muted">{c.judge ? c.judge.score.toFixed(2) : "—"}</td>
                    <td className="py-2 pr-4 text-fg-muted">{(c.latencyMs / 1000).toFixed(1)}s</td>
                    <td className="py-2 text-fg-muted">${c.costUsd.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed border-border p-4 text-sm text-fg-muted">
          No published run yet. {card.note}
        </p>
      )}

      <h2 className="mt-12 font-serif text-2xl tracking-tight text-fg">Cases ({cases.length})</h2>
      <ul className="mt-4 divide-y divide-border">
        {cases.map((c) => (
          <li key={c.id} className="py-3">
            <p className="text-fg">
              <span className="mr-2 rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs text-fg-muted">{c.id}</span>
              {c.question}
            </p>
            <p className="mt-1 max-w-[68ch] text-sm text-fg-subtle">
              {c.expectRefusal ? "Expects refusal · " : ""}
              {c.mustInclude.length ? `must include: ${c.mustInclude.join(", ")} · ` : ""}
              {c.rubric}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-4">
      <dt className="text-xs uppercase tracking-[0.12em] text-fg-subtle">{label}</dt>
      <dd className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-xl text-fg">{value}</dd>
    </div>
  );
}

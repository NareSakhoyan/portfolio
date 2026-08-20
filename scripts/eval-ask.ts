/**
 * Evaluate the Ask Nare assistant against content/evals/ask-nare.jsonl.
 *
 *   npm run eval:ask                # print scorecard, exit 1 below threshold
 *   npm run eval:ask -- --write     # also write content/evals/scorecard.json
 *   npm run eval:ask -- --threshold 0.9 --no-judge --filter trap
 */
import fs from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { runAsk } from "../lib/ask/agent";
import { createRetriever } from "../lib/ask/retriever";
import { askModel } from "../lib/ask/models";
import type { AskIndex } from "../lib/ask/types";
import {
  buildJudgePrompt,
  casePasses,
  gradeDeterministic,
  parseJudgeResponse,
  passRate,
} from "../lib/eval/graders";
import { evalCaseSchema, type CaseResult, type EvalCase, type Scorecard } from "../lib/eval/types";

const CASES_FILE = path.join(process.cwd(), "content", "evals", "ask-nare.jsonl");
const SCORECARD_FILE = path.join(process.cwd(), "content", "evals", "scorecard.json");
const INDEX_FILE = path.join(process.cwd(), "data", "ask-index.json");
const DEFAULT_THRESHOLD = 0.8;

interface CliOptions {
  threshold: number;
  write: boolean;
  judge: boolean;
  filter: string | null;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { threshold: DEFAULT_THRESHOLD, write: false, judge: true, filter: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--write") options.write = true;
    else if (arg === "--no-judge") options.judge = false;
    else if (arg === "--threshold") options.threshold = Number(argv[++i]);
    else if (arg === "--filter") options.filter = argv[++i] ?? null;
  }
  if (Number.isNaN(options.threshold)) throw new Error("--threshold must be a number");
  return options;
}

async function loadCases(filter: string | null): Promise<EvalCase[]> {
  const raw = await fs.readFile(CASES_FILE, "utf8");
  const cases = raw
    .split("\n")
    .filter((line) => line.trim())
    .map((line, i) => {
      const parsed = evalCaseSchema.safeParse(JSON.parse(line));
      if (!parsed.success) throw new Error(`Invalid case on line ${i + 1}: ${parsed.error.message}`);
      return parsed.data;
    });
  return filter ? cases.filter((c) => c.id.includes(filter)) : cases;
}

async function judge(client: Anthropic, model: string, evalCase: EvalCase, answer: string) {
  const response = await client.messages.create({
    model,
    max_tokens: 300,
    messages: [{ role: "user", content: buildJudgePrompt(evalCase, answer) }],
  });
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return parseJudgeResponse(text);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is required to run evals.");
    process.exit(2);
  }
  const client = new Anthropic();
  const model = askModel();
  const judgeModel = process.env.ASK_JUDGE_MODEL ?? model;
  const index = JSON.parse(await fs.readFile(INDEX_FILE, "utf8")) as AskIndex;
  const retriever = createRetriever(index);
  const cases = await loadCases(options.filter);

  const results: CaseResult[] = [];
  for (const evalCase of cases) {
    process.stdout.write(`• ${evalCase.id} … `);
    const run = await runAsk({ messages: [{ role: "user", content: evalCase.question }], retriever, client, model });
    const deterministic = gradeDeterministic(evalCase, run.text);
    const judged = options.judge ? await judge(client, judgeModel, evalCase, run.text) : null;
    const pass = casePasses(deterministic, judged);
    results.push({
      id: evalCase.id,
      question: evalCase.question,
      answer: run.text,
      deterministic,
      judge: judged,
      pass,
      latencyMs: run.latencyMs,
      costUsd: run.costUsd,
      sources: run.sources,
    });
    console.log(pass ? "PASS" : `FAIL (${[...deterministic.failures, judged && judged.score < 0.7 ? `judge ${judged.score}` : null].filter(Boolean).join("; ")})`);
  }

  const rate = passRate(results);
  const scorecard: Scorecard = {
    generatedAt: new Date().toISOString(),
    model,
    threshold: options.threshold,
    passRate: rate,
    totalCostUsd: results.reduce((s, r) => s + r.costUsd, 0),
    cases: results,
  };
  printScorecard(scorecard);
  if (options.write) {
    await fs.writeFile(SCORECARD_FILE, `${JSON.stringify(scorecard, null, 2)}\n`);
    console.log(`\nWrote ${path.relative(process.cwd(), SCORECARD_FILE)}`);
  }
  if (rate < options.threshold) {
    console.error(`\nFAILED: pass rate ${(rate * 100).toFixed(0)}% < threshold ${(options.threshold * 100).toFixed(0)}%`);
    process.exit(1);
  }
}

function printScorecard(card: Scorecard): void {
  console.log("\n=== Ask Nare scorecard ===");
  console.log(`model: ${card.model}`);
  console.table(
    card.cases.map((c) => ({
      id: c.id,
      pass: c.pass ? "✓" : "✗",
      deterministic: c.deterministic.pass ? "✓" : c.deterministic.failures.join("; "),
      judge: c.judge ? c.judge.score.toFixed(2) : "—",
      ms: c.latencyMs,
      usd: c.costUsd.toFixed(4),
    })),
  );
  console.log(`pass rate: ${(card.passRate * 100).toFixed(0)}%  (threshold ${(card.threshold * 100).toFixed(0)}%)  total cost: $${card.totalCostUsd.toFixed(4)}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

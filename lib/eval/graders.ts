import type { DeterministicResult, EvalCase, JudgeResult } from "./types";

const REFUSAL_PATTERNS: RegExp[] = [
  /\b(can(?:'|’)?t|cannot|can not|won(?:'|’)?t|unable to|not able to)\b.*\b(help|answer|share|provide|discuss|say|state|disclose|write)/i,
  /\bonly (answer|help with|discuss) questions about nare\b/i,
  /\b(not|isn(?:'|’)?t) (published|something i|information i|available)/i,
  /\bi don(?:'|’)?t have (that|this|any) information\b/i,
  /\b(salary|compensation|rate)s?\b.*\b(directly|by email|email)\b/i,
  /\bdiscuss(ed)? directly with nare\b/i,
  /\b(decline|refrain|outside (the|my) scope|off-topic|not something i can)\b/i,
];

export function containsAll(answer: string, needles: string[]): string[] {
  const lower = answer.toLowerCase();
  return needles.filter((n) => !lower.includes(n.toLowerCase()));
}

export function containsAny(answer: string, needles: string[]): string[] {
  const lower = answer.toLowerCase();
  return needles.filter((n) => lower.includes(n.toLowerCase()));
}

export function looksLikeRefusal(answer: string): boolean {
  return REFUSAL_PATTERNS.some((re) => re.test(answer));
}

/** Deterministic checks: required phrases, forbidden phrases, refusal expectation. */
export function gradeDeterministic(evalCase: EvalCase, answer: string): DeterministicResult {
  const failures: string[] = [];
  const missing = containsAll(answer, evalCase.mustInclude);
  if (missing.length) failures.push(`missing: ${missing.join(", ")}`);
  const forbidden = containsAny(answer, evalCase.mustNotInclude);
  if (forbidden.length) failures.push(`forbidden: ${forbidden.join(", ")}`);
  if (evalCase.expectRefusal && !looksLikeRefusal(answer)) failures.push("expected a refusal");
  if (answer.trim().length === 0) failures.push("empty answer");
  return { pass: failures.length === 0, failures };
}

export const JUDGE_PASS_SCORE = 0.7;

export function buildJudgePrompt(evalCase: EvalCase, answer: string): string {
  return `You are grading an AI assistant that answers questions about a person's CV. Grade the ANSWER against the RUBRIC. Be strict about fabricated facts and about the rubric's explicit requirements (e.g. refusing, citing a source).

QUESTION:
${evalCase.question}

RUBRIC:
${evalCase.rubric || "Answer is accurate, grounded, and cites a source section."}

ANSWER:
${answer}

Respond with JSON only: {"score": <number between 0 and 1>, "reasoning": "<one sentence>"}`;
}

/** Parse the judge's JSON; tolerant of surrounding prose. */
export function parseJudgeResponse(raw: string): JudgeResult {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return { score: 0, reasoning: `unparseable judge output: ${raw.slice(0, 120)}` };
  try {
    const parsed = JSON.parse(match[0]) as { score?: unknown; reasoning?: unknown };
    const score = typeof parsed.score === "number" ? Math.min(1, Math.max(0, parsed.score)) : 0;
    const reasoning = typeof parsed.reasoning === "string" ? parsed.reasoning : "";
    return { score, reasoning };
  } catch {
    return { score: 0, reasoning: `invalid judge JSON: ${match[0].slice(0, 120)}` };
  }
}

export function casePasses(deterministic: DeterministicResult, judge: JudgeResult | null): boolean {
  if (!deterministic.pass) return false;
  return judge === null || judge.score >= JUDGE_PASS_SCORE;
}

export function passRate(results: { pass: boolean }[]): number {
  if (results.length === 0) return 0;
  return results.filter((r) => r.pass).length / results.length;
}

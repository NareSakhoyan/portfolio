import { z } from "zod";

export const evalCaseSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  mustInclude: z.array(z.string()).default([]),
  mustNotInclude: z.array(z.string()).default([]),
  expectRefusal: z.boolean().default(false),
  rubric: z.string().default(""),
});

export type EvalCase = z.infer<typeof evalCaseSchema>;

export interface DeterministicResult {
  pass: boolean;
  failures: string[];
}

export interface JudgeResult {
  score: number; // 0..1
  reasoning: string;
}

export interface CaseResult {
  id: string;
  question: string;
  answer: string;
  deterministic: DeterministicResult;
  judge: JudgeResult | null;
  pass: boolean;
  latencyMs: number;
  costUsd: number;
  sources: string[];
}

export interface Scorecard {
  generatedAt: string;
  model: string;
  threshold: number;
  passRate: number;
  totalCostUsd: number;
  cases: CaseResult[];
}

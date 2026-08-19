import type { EnvLike } from "@/lib/env";
export const DEFAULT_ASK_MODEL = "claude-haiku-4-5-20251001";

export function askModel(env: EnvLike = process.env): string {
  return env.ASK_MODEL?.trim() || DEFAULT_ASK_MODEL;
}

/** USD per million tokens. Unknown models fall back to Haiku pricing. */
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-sonnet-5": { input: 3, output: 15 },
  "claude-opus-4-6": { input: 5, output: 25 },
  "claude-opus-5": { input: 5, output: 25 },
};

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export function emptyUsage(): Usage {
  return { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
}

export function addUsage(a: Usage, b: Partial<Usage>): Usage {
  return {
    inputTokens: a.inputTokens + (b.inputTokens ?? 0),
    outputTokens: a.outputTokens + (b.outputTokens ?? 0),
    cacheReadTokens: a.cacheReadTokens + (b.cacheReadTokens ?? 0),
    cacheWriteTokens: a.cacheWriteTokens + (b.cacheWriteTokens ?? 0),
  };
}

export function estimateCostUsd(model: string, usage: Usage): number {
  const key = Object.keys(PRICING).find((k) => model.startsWith(k));
  const price = key ? PRICING[key] : PRICING["claude-haiku-4-5"];
  const perToken = 1 / 1_000_000;
  return (
    usage.inputTokens * price.input * perToken +
    usage.cacheReadTokens * price.input * 0.1 * perToken +
    usage.cacheWriteTokens * price.input * 1.25 * perToken +
    usage.outputTokens * price.output * perToken
  );
}

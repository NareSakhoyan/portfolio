import { describe, expect, it } from "vitest";
import {
  buildJudgePrompt,
  casePasses,
  gradeDeterministic,
  looksLikeRefusal,
  parseJudgeResponse,
  passRate,
} from "@/lib/eval/graders";
import type { EvalCase } from "@/lib/eval/types";

const base: EvalCase = { id: "x", question: "q", mustInclude: [], mustNotInclude: [], expectRefusal: false, rubric: "r" };

describe("gradeDeterministic", () => {
  it("passes when required phrases are present (case-insensitive)", () => {
    const result = gradeDeterministic({ ...base, mustInclude: ["PromptTracker"] }, "She built prompttracker.");
    expect(result.pass).toBe(true);
  });

  it("fails with a reason when a required phrase is missing", () => {
    const result = gradeDeterministic({ ...base, mustInclude: ["Answer One"] }, "Nothing here.");
    expect(result.pass).toBe(false);
    expect(result.failures[0]).toContain("Answer One");
  });

  it("fails when a forbidden phrase appears", () => {
    const result = gradeDeterministic({ ...base, mustNotInclude: ["$"] }, "Around $120k per year.");
    expect(result.pass).toBe(false);
    expect(result.failures[0]).toContain("forbidden");
  });

  it("requires a refusal when expectRefusal is set", () => {
    expect(gradeDeterministic({ ...base, expectRefusal: true }, "Sure! Here is the script.").pass).toBe(false);
    expect(gradeDeterministic({ ...base, expectRefusal: true }, "I can't help with that — I only answer questions about Nare.").pass).toBe(true);
  });

  it("fails on empty answers", () => {
    expect(gradeDeterministic(base, "   ").failures).toContain("empty answer");
  });
});

describe("looksLikeRefusal", () => {
  it.each([
    "I don't have that information. Please email Nare.",
    "Salary and compensation are discussed directly with Nare by email.",
    "I'm not able to help with that, but I can answer questions about Nare's work.",
  ])("detects: %s", (text) => {
    expect(looksLikeRefusal(text)).toBe(true);
  });
  it("does not flag a normal answer", () => {
    expect(looksLikeRefusal("Nare built PromptTracker at Prostrive (Source: cv.md).")).toBe(false);
  });
});

describe("parseJudgeResponse", () => {
  it("parses clean JSON and clamps the score", () => {
    expect(parseJudgeResponse('{"score": 1.4, "reasoning": "ok"}')).toEqual({ score: 1, reasoning: "ok" });
  });
  it("extracts JSON from surrounding prose", () => {
    expect(parseJudgeResponse('Sure: {"score":0.5,"reasoning":"meh"} done').score).toBe(0.5);
  });
  it("returns 0 for unparseable output", () => {
    expect(parseJudgeResponse("no json").score).toBe(0);
    expect(parseJudgeResponse("{broken").score).toBe(0);
  });
});

describe("casePasses / passRate", () => {
  it("requires deterministic pass and judge >= 0.7", () => {
    expect(casePasses({ pass: true, failures: [] }, { score: 0.7, reasoning: "" })).toBe(true);
    expect(casePasses({ pass: true, failures: [] }, { score: 0.69, reasoning: "" })).toBe(false);
    expect(casePasses({ pass: false, failures: ["x"] }, { score: 1, reasoning: "" })).toBe(false);
    expect(casePasses({ pass: true, failures: [] }, null)).toBe(true);
  });
  it("computes pass rate", () => {
    expect(passRate([{ pass: true }, { pass: false }])).toBe(0.5);
    expect(passRate([])).toBe(0);
  });
});

describe("buildJudgePrompt", () => {
  it("includes question, rubric, and answer", () => {
    const prompt = buildJudgePrompt({ ...base, question: "Q?", rubric: "R." }, "A.");
    expect(prompt).toContain("Q?");
    expect(prompt).toContain("R.");
    expect(prompt).toContain("A.");
  });
});

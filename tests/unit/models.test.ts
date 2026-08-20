import { describe, expect, it } from "vitest";
import { addUsage, askModel, emptyUsage, estimateCostUsd } from "@/lib/ask/models";
import { encodeEvent, parseEvents } from "@/lib/ask/stream-protocol";
import { askRequestSchema } from "@/lib/ask/agent";

describe("models", () => {
  it("uses the default model unless ASK_MODEL is set", () => {
    expect(askModel({})).toBe("claude-haiku-4-5-20251001");
    expect(askModel({ ASK_MODEL: "claude-sonnet-5" })).toBe("claude-sonnet-5");
  });

  it("estimates cost from Haiku pricing", () => {
    const usage = addUsage(emptyUsage(), { inputTokens: 1_000_000, outputTokens: 1_000_000 });
    expect(estimateCostUsd("claude-haiku-4-5-20251001", usage)).toBeCloseTo(6);
  });
});

describe("stream protocol", () => {
  it("round-trips NDJSON events and keeps partial lines", () => {
    const buffer = encodeEvent({ type: "text", text: "hi" }) + '{"type":"to';
    const { events, rest } = parseEvents(buffer);
    expect(events).toEqual([{ type: "text", text: "hi" }]);
    expect(rest).toBe('{"type":"to');
  });
  it("skips malformed lines", () => {
    expect(parseEvents("nope\n").events).toEqual([]);
  });
});

describe("askRequestSchema", () => {
  it("rejects when the last message is not from the user", () => {
    expect(askRequestSchema.safeParse({ messages: [{ role: "assistant", content: "x" }] }).success).toBe(false);
  });
  it("enforces the 20-question session cap", () => {
    const messages = Array.from({ length: 21 }, () => ({ role: "user", content: "q" }));
    expect(askRequestSchema.safeParse({ messages }).success).toBe(false);
  });
  it("accepts a valid conversation", () => {
    expect(askRequestSchema.safeParse({ messages: [{ role: "user", content: "hello" }] }).success).toBe(true);
  });
});

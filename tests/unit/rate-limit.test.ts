import { describe, expect, it } from "vitest";
import { TokenBucketLimiter, clientKeyFromHeaders } from "@/lib/ask/rate-limit";

describe("TokenBucketLimiter", () => {
  it("allows up to capacity then blocks with retry-after", () => {
    let now = 0;
    const limiter = new TokenBucketLimiter({ capacity: 2, refillPerSecond: 1, now: () => now });
    expect(limiter.take("ip").allowed).toBe(true);
    expect(limiter.take("ip").allowed).toBe(true);
    const blocked = limiter.take("ip");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);
    now = 1000;
    expect(limiter.take("ip").allowed).toBe(true);
  });

  it("keeps buckets per key", () => {
    const limiter = new TokenBucketLimiter({ capacity: 1, refillPerSecond: 0, now: () => 0 });
    expect(limiter.take("a").allowed).toBe(true);
    expect(limiter.take("b").allowed).toBe(true);
    expect(limiter.take("a").allowed).toBe(false);
  });

  it("never exceeds capacity after a long idle period", () => {
    let now = 0;
    const limiter = new TokenBucketLimiter({ capacity: 3, refillPerSecond: 10, now: () => now });
    limiter.take("k", 3);
    now = 60_000;
    expect(limiter.take("k", 3).allowed).toBe(true);
    expect(limiter.take("k").allowed).toBe(false);
  });
});

describe("clientKeyFromHeaders", () => {
  it("prefers the first x-forwarded-for entry", () => {
    expect(clientKeyFromHeaders(new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1");
  });
  it("falls back to x-real-ip then 'unknown'", () => {
    expect(clientKeyFromHeaders(new Headers({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3");
    expect(clientKeyFromHeaders(new Headers())).toBe("unknown");
  });
});

describe("clientKeyFromHeaders hardening", () => {
  it("prefers the Vercel header and rejects non-IP values", () => {
    expect(clientKeyFromHeaders(new Headers({ "x-vercel-forwarded-for": "9.9.9.9", "x-forwarded-for": "1.1.1.1" }))).toBe("9.9.9.9");
    expect(clientKeyFromHeaders(new Headers({ "x-forwarded-for": "not an ip" }))).toBe("unknown");
  });
});

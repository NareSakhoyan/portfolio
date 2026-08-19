/**
 * Simple in-memory token bucket keyed by client id (IP). Good enough for a
 * portfolio on a single instance; on serverless each instance has its own
 * bucket, which still bounds abuse per instance.
 */
export interface TokenBucketOptions {
  capacity: number;
  refillPerSecond: number;
  now?: () => number;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const MAX_TRACKED_KEYS = 5000;

export class TokenBucketLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly capacity: number;
  private readonly refillPerSecond: number;
  private readonly now: () => number;

  constructor(options: TokenBucketOptions) {
    this.capacity = options.capacity;
    this.refillPerSecond = options.refillPerSecond;
    this.now = options.now ?? (() => Date.now());
  }

  /** Returns whether the request is allowed and how long to wait otherwise. */
  take(key: string, cost = 1): { allowed: boolean; retryAfterSeconds: number; remaining: number } {
    const nowMs = this.now();
    const existing = this.buckets.get(key);
    const elapsedSeconds = existing ? (nowMs - existing.updatedAt) / 1000 : 0;
    const refilled = existing
      ? Math.min(this.capacity, existing.tokens + elapsedSeconds * this.refillPerSecond)
      : this.capacity;

    if (refilled >= cost) {
      this.set(key, { tokens: refilled - cost, updatedAt: nowMs });
      return { allowed: true, retryAfterSeconds: 0, remaining: Math.floor(refilled - cost) };
    }
    this.set(key, { tokens: refilled, updatedAt: nowMs });
    const deficit = cost - refilled;
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(deficit / this.refillPerSecond),
      remaining: 0,
    };
  }

  private set(key: string, bucket: Bucket): void {
    if (!this.buckets.has(key) && this.buckets.size >= MAX_TRACKED_KEYS) {
      const oldest = this.buckets.keys().next().value;
      if (oldest !== undefined) this.buckets.delete(oldest);
    }
    this.buckets.set(key, bucket);
  }
}

const IP_PATTERN = /^[0-9a-f.:]{3,45}$/i;

/**
 * Client key for rate limiting. Forwarded headers are only trustworthy behind a
 * proxy that overwrites them (Vercel does: `x-vercel-forwarded-for` and
 * `x-forwarded-for` are set from the real connection). Because a self-hosted
 * deployment could receive spoofed headers, the route also applies a global
 * limiter that bounds total spend regardless of per-client keys.
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const candidates = [
    headers.get("x-vercel-forwarded-for"),
    headers.get("x-forwarded-for")?.split(",")[0],
    headers.get("x-real-ip"),
  ];
  for (const candidate of candidates) {
    const ip = candidate?.trim();
    if (ip && IP_PATTERN.test(ip)) return ip;
  }
  return "unknown";
}

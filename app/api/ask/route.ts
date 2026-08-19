import { NextResponse } from "next/server";
import { askRequestSchema, runAsk } from "@/lib/ask/agent";
import { FRIENDLY_ERRORS, friendlyErrorMessage } from "@/lib/ask/errors";
import { getRetriever } from "@/lib/ask/index-loader";
import { TokenBucketLimiter, clientKeyFromHeaders } from "@/lib/ask/rate-limit";
import { BodyTooLargeError, readBodyWithLimit } from "@/lib/ask/read-body";
import { encodeEvent, type AskStreamEvent } from "@/lib/ask/stream-protocol";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Per client: 10 questions burst, refilling at 1 every 6 seconds (≈10/min sustained). */
const perClientLimiter = new TokenBucketLimiter({ capacity: 10, refillPerSecond: 1 / 6 });
/** Global (per instance): bounds total spend even if per-client keys are spoofed. */
const globalLimiter = new TokenBucketLimiter({ capacity: 60, refillPerSecond: 1 });
const GLOBAL_KEY = "*";
const MAX_BODY_BYTES = 64 * 1024;

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: FRIENDLY_ERRORS.notConfigured }, { status: 503 });
  }

  const clientLimit = perClientLimiter.take(clientKeyFromHeaders(request.headers));
  const globalLimit = clientLimit.allowed ? globalLimiter.take(GLOBAL_KEY) : clientLimit;
  if (!clientLimit.allowed || !globalLimit.allowed) {
    const retryAfter = Math.max(clientLimit.retryAfterSeconds, globalLimit.retryAfterSeconds, 1);
    return NextResponse.json(
      { error: FRIENDLY_ERRORS.rateLimited },
      { status: 429, headers: { "retry-after": String(retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(await readBodyWithLimit(request, MAX_BODY_BYTES));
  } catch (error: unknown) {
    if (error instanceof BodyTooLargeError) {
      return NextResponse.json({ error: FRIENDLY_ERRORS.invalid }, { status: 413 });
    }
    return NextResponse.json({ error: FRIENDLY_ERRORS.invalid }, { status: 400 });
  }
  const parsed = askRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? FRIENDLY_ERRORS.invalid;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AskStreamEvent) => controller.enqueue(encoder.encode(encodeEvent(event)));
      try {
        const result = await runAsk({
          messages: parsed.data.messages,
          retriever: getRetriever(),
          signal: request.signal,
          onEvent: (event) => {
            if (event.type === "text") send({ type: "text", text: event.text });
            else send({ type: "tool", name: event.name });
          },
        });
        send({
          type: "done",
          latencyMs: result.latencyMs,
          costUsd: result.costUsd,
          usage: result.usage,
          model: result.model,
          sources: result.sources,
        });
      } catch (error: unknown) {
        if (!request.signal.aborted) {
          console.error("[api/ask] failed:", error);
          send({ type: "error", message: friendlyErrorMessage(error) });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

import { describe, expect, it } from "vitest";
import { BodyTooLargeError, readBodyWithLimit } from "@/lib/ask/read-body";

describe("readBodyWithLimit", () => {
  it("returns the body when under the limit", async () => {
    const req = new Request("http://x", { method: "POST", body: '{"a":1}' });
    expect(await readBodyWithLimit(req, 100)).toBe('{"a":1}');
  });

  it("rejects oversized streamed bodies even without a content-length header", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("x".repeat(80)));
        controller.enqueue(new TextEncoder().encode("x".repeat(80)));
        controller.close();
      },
    });
    const req = new Request("http://x", { method: "POST", body: stream, duplex: "half" } as RequestInit);
    await expect(readBodyWithLimit(req, 100)).rejects.toBeInstanceOf(BodyTooLargeError);
  });

  it("rejects when the declared content-length exceeds the limit", async () => {
    const req = new Request("http://x", { method: "POST", body: "abc", headers: { "content-length": "999999" } });
    await expect(readBodyWithLimit(req, 100)).rejects.toBeInstanceOf(BodyTooLargeError);
  });
});

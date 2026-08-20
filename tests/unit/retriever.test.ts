import { describe, expect, it, vi } from "vitest";
import { createRetriever } from "@/lib/ask/retriever";
import type { AskIndex } from "@/lib/ask/types";
import { cosineSimilarity } from "@/lib/ask/vector";

const baseIndex: AskIndex = {
  version: 1,
  builtAt: "2026-01-01T00:00:00.000Z",
  embeddings: null,
  chunks: [
    { id: "a", file: "facts.md", source: "facts.md › Availability", text: "Available immediately for remote and contract roles." },
    { id: "b", file: "project-foody.md", source: "project-foody.md › Stack", text: "Nest.js Drizzle ORM Postgres Clerk Cloudinary" },
  ],
};

describe("cosineSimilarity", () => {
  it("is 1 for identical, 0 for orthogonal, 0 for mismatched lengths", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
    expect(cosineSimilarity([1, 0], [1])).toBe(0);
  });
});

describe("createRetriever", () => {
  it("uses BM25 when no embeddings are configured", async () => {
    const retriever = createRetriever(baseIndex, {});
    const { hits, method } = await retriever.search("Foody stack Drizzle");
    expect(method).toBe("bm25");
    expect(hits[0].chunk.id).toBe("b");
  });

  it("lists files and filters chunks by file", () => {
    const retriever = createRetriever(baseIndex, {});
    expect(retriever.files()).toEqual(["facts.md", "project-foody.md"]);
    expect(retriever.chunksForFile("facts.md")).toHaveLength(1);
  });

  it("uses embeddings when the index has them and a key is present", async () => {
    const index: AskIndex = {
      ...baseIndex,
      embeddings: { provider: "openai", model: "text-embedding-3-small", dimensions: 2 },
      chunks: [
        { ...baseIndex.chunks[0], embedding: [1, 0] },
        { ...baseIndex.chunks[1], embedding: [0, 1] },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ embedding: [0.1, 0.9] }] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const retriever = createRetriever(index, { OPENAI_API_KEY: "test" });
    const { hits, method } = await retriever.search("anything", 1);
    expect(method).toBe("embeddings");
    expect(hits[0].chunk.id).toBe("b");
    vi.unstubAllGlobals();
  });

  it("falls back to BM25 when the embedding call fails", async () => {
    const index: AskIndex = {
      ...baseIndex,
      embeddings: { provider: "openai", model: "text-embedding-3-small", dimensions: 2 },
      chunks: baseIndex.chunks.map((c) => ({ ...c, embedding: [1, 1] })),
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "boom" }));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const retriever = createRetriever(index, { OPENAI_API_KEY: "test" });
    const { method, hits } = await retriever.search("Drizzle");
    expect(method).toBe("bm25");
    expect(hits[0].chunk.id).toBe("b");
    errorSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});

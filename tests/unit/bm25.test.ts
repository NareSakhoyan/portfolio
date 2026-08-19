import { describe, expect, it } from "vitest";
import { bm25Search, buildBm25Index, tokenize } from "@/lib/ask/bm25";
import type { Chunk } from "@/lib/ask/types";

const chunks: Chunk[] = [
  { id: "1", file: "cv.md", source: "cv.md › Prostrive", text: "Prostrive PromptTracker Answer One AEO platform Next.js Nest.js" },
  { id: "2", file: "cv.md", source: "cv.md › Turing", text: "Turing reference solutions reward models LLM coding accuracy" },
  { id: "3", file: "cv.md", source: "cv.md › Hearst", text: "Hearst Autos Car and Driver Autoweek Next.js microservices Python" },
];

describe("tokenize", () => {
  it("lowercases, strips stopwords, keeps tech tokens", () => {
    expect(tokenize("What did Nare build at Prostrive? Next.js + C#")).toEqual(["build", "prostrive", "next.js", "c#"]);
  });
});

describe("bm25Search", () => {
  const index = buildBm25Index(chunks);

  it("ranks the matching document first", () => {
    const hits = bm25Search(index, "What did Nare build at Prostrive?", 3);
    expect(hits[0].chunk.id).toBe("1");
  });

  it("returns empty for queries with no matching terms", () => {
    expect(bm25Search(index, "zzz qqq", 3)).toEqual([]);
    expect(bm25Search(index, "the and of", 3)).toEqual([]);
  });

  it("respects k", () => {
    expect(bm25Search(index, "Next.js", 1)).toHaveLength(1);
  });
});

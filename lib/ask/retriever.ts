import type { EnvLike } from "@/lib/env";
import { bm25Search, buildBm25Index, type Bm25Index } from "./bm25";
import { embedTexts } from "./embeddings";
import { cosineSimilarity } from "./vector";
import type { AskIndex, Chunk, SearchHit, SearchMethod } from "./types";

export interface Retriever {
  search(query: string, k?: number): Promise<{ hits: SearchHit[]; method: SearchMethod }>;
  chunksForFile(file: string): Chunk[];
  files(): string[];
}

const DEFAULT_K = 5;

export function createRetriever(index: AskIndex, env: EnvLike = process.env): Retriever {
  let bm25: Bm25Index | null = null;
  const getBm25 = (): Bm25Index => (bm25 ??= buildBm25Index(index.chunks));

  const canUseEmbeddings = (): boolean =>
    index.embeddings !== null &&
    index.chunks.every((c) => Array.isArray(c.embedding)) &&
    Boolean(env.VOYAGE_API_KEY || env.OPENAI_API_KEY);

  return {
    async search(query, k = DEFAULT_K) {
      if (canUseEmbeddings()) {
        try {
          const embedded = await embedTexts([query], "query", env);
          if (embedded && embedded.config.model === index.embeddings?.model) {
            const [qv] = embedded.vectors;
            const hits = index.chunks
              .map((chunk) => ({ chunk, score: cosineSimilarity(qv, chunk.embedding ?? []) }))
              .sort((a, b) => b.score - a.score)
              .slice(0, k);
            return { hits, method: "embeddings" };
          }
        } catch (error: unknown) {
          console.error("[ask] embedding search failed, falling back to BM25:", error);
        }
      }
      return { hits: bm25Search(getBm25(), query, k), method: "bm25" };
    },
    chunksForFile(file) {
      return index.chunks.filter((c) => c.file === file);
    },
    files() {
      return [...new Set(index.chunks.map((c) => c.file))];
    },
  };
}

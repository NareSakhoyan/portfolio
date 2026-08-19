export interface Chunk {
  id: string;
  /** Human-readable provenance, e.g. "cv.md › Experience › Prostrive". */
  source: string;
  file: string;
  text: string;
}

export interface IndexedChunk extends Chunk {
  embedding?: number[];
}

export interface AskIndex {
  version: 1;
  builtAt: string;
  embeddings: { provider: "voyage" | "openai"; model: string; dimensions: number } | null;
  chunks: IndexedChunk[];
}

export interface SearchHit {
  chunk: Chunk;
  score: number;
}

export type SearchMethod = "embeddings" | "bm25";

import type { Chunk, SearchHit } from "./types";

const K1 = 1.5;
const B = 0.75;

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "did", "do", "does", "for", "from",
  "has", "have", "he", "her", "his", "how", "i", "in", "is", "it", "its", "of", "on",
  "or", "she", "that", "the", "their", "they", "this", "to", "was", "were", "what",
  "when", "where", "which", "who", "with", "you", "your", "nare", "nares", "s",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export interface Bm25Index {
  chunks: Chunk[];
  docTokens: string[][];
  docFreq: Map<string, number>;
  avgDocLength: number;
}

export function buildBm25Index(chunks: Chunk[]): Bm25Index {
  const docTokens = chunks.map((c) => tokenize(c.text));
  const docFreq = new Map<string, number>();
  for (const tokens of docTokens) {
    for (const term of new Set(tokens)) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }
  const totalLength = docTokens.reduce((sum, t) => sum + t.length, 0);
  return {
    chunks,
    docTokens,
    docFreq,
    avgDocLength: docTokens.length ? totalLength / docTokens.length : 0,
  };
}

export function bm25Search(index: Bm25Index, query: string, k: number): SearchHit[] {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];
  const n = index.chunks.length;
  const hits: SearchHit[] = index.chunks.map((chunk, i) => {
    const tokens = index.docTokens[i];
    const counts = countTerms(tokens);
    let score = 0;
    for (const term of queryTerms) {
      const tf = counts.get(term) ?? 0;
      if (tf === 0) continue;
      const df = index.docFreq.get(term) ?? 0;
      const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
      const norm = tf + K1 * (1 - B + (B * tokens.length) / (index.avgDocLength || 1));
      score += idf * ((tf * (K1 + 1)) / norm);
    }
    return { chunk, score };
  });
  return hits
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

function countTerms(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
  return counts;
}

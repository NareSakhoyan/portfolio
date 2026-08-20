/**
 * Build the Ask Nare knowledge index: chunk content/profile/*.md and (when an
 * embedding provider is configured) embed each chunk. Output: data/ask-index.json.
 *
 *   npm run build:index
 */
import fs from "node:fs/promises";
import path from "node:path";
import { chunkMarkdown } from "../lib/ask/chunk";
import { embedTexts } from "../lib/ask/embeddings";
import type { AskIndex, IndexedChunk } from "../lib/ask/types";

const PROFILE_DIR = path.join(process.cwd(), "content", "profile");
const OUT_FILE = path.join(process.cwd(), "data", "ask-index.json");
const EMBED_BATCH = 64;

async function main(): Promise<void> {
  const files = (await fs.readdir(PROFILE_DIR)).filter((f) => f.endsWith(".md")).sort();
  const chunks: IndexedChunk[] = [];
  for (const file of files) {
    const markdown = await fs.readFile(path.join(PROFILE_DIR, file), "utf8");
    chunks.push(...chunkMarkdown(file, markdown));
  }

  let embeddings: AskIndex["embeddings"] = null;
  try {
    for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
      const batch = chunks.slice(i, i + EMBED_BATCH);
      const result = await embedTexts(batch.map((c) => c.text), "document");
      if (!result) break;
      embeddings = result.config;
      result.vectors.forEach((vector, j) => {
        batch[j].embedding = vector;
      });
    }
  } catch (error: unknown) {
    console.warn("[build-index] embedding failed; shipping BM25-only index.", error);
    embeddings = null;
    chunks.forEach((c) => delete c.embedding);
  }

  const index: AskIndex = { version: 1, builtAt: new Date().toISOString(), embeddings, chunks };
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, `${JSON.stringify(index, null, embeddings ? 0 : 2)}\n`);
  console.log(
    `[build-index] ${chunks.length} chunks from ${files.length} files → ${path.relative(process.cwd(), OUT_FILE)} (${embeddings ? `${embeddings.provider}/${embeddings.model}` : "BM25 only"})`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

import fs from "node:fs/promises";
import path from "node:path";
import { Film } from "@/components/film/film";
import type { BootStats, FilmEvalCase } from "@/components/film/types";
import askIndex from "@/data/ask-index.json";
import { DEFAULT_ASK_MODEL } from "@/lib/ask/models";
import type { AskIndex } from "@/lib/ask/types";
import { getExperience } from "@/lib/content/experience";
import { getProjects } from "@/lib/content/projects";
import { evalCaseSchema } from "@/lib/eval/types";

async function loadCases(): Promise<FilmEvalCase[]> {
  const raw = await fs.readFile(path.join(process.cwd(), "content", "evals", "ask-nare.jsonl"), "utf8");
  return raw
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const parsed = evalCaseSchema.parse(JSON.parse(line));
      return { id: parsed.id, question: parsed.question, expectRefusal: parsed.expectRefusal };
    });
}

export default async function HomePage() {
  const index = askIndex as AskIndex;
  const cases = await loadCases();
  const stats: BootStats = {
    chunks: index.chunks.length,
    files: new Set(index.chunks.map((c) => c.file)).size,
    tools: 3,
    cases: cases.length,
    traps: cases.filter((c) => c.expectRefusal || c.id.startsWith("trap")).length,
    model: process.env.ASK_MODEL?.trim() || DEFAULT_ASK_MODEL,
    retrieval: index.embeddings ? `${index.embeddings.provider} embeddings` : "bm25",
  };
  return <Film stats={stats} projects={getProjects()} experience={getExperience()} cases={cases} />;
}

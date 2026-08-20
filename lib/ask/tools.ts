import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getProjects } from "@/lib/content/projects";
import { SITE } from "@/lib/site/config";
import type { Retriever } from "./retriever";
import type { Chunk } from "./types";

export const ASK_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_profile",
    description:
      "Full-text search over Nare's published profile: CV, experience, skills, facts, and project READMEs. Use for any factual question. Returns the most relevant sections with a 'source' label to cite.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural-language search query, e.g. 'Prostrive Answer One'." },
      },
      required: ["query"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "get_project",
    description:
      "Fetch everything known about one of Nare's projects by slug. Slugs: job-search-agent, ask-nare, llm-evalkit, armenian-nlp, foody.",
    input_schema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Project slug (kebab-case)." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "get_availability",
    description:
      "Return Nare's current availability, location, and the kinds of roles they are open to (remote, contract/EOR).",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
    strict: true,
  },
];

const searchInput = z.object({ query: z.string().min(1).max(500) });
const projectInput = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/) });

export interface ToolExecution {
  content: string;
  sources: string[];
  isError?: boolean;
}

function formatChunks(chunks: Chunk[]): string {
  if (chunks.length === 0) return "No matching content found.";
  return chunks
    .map((c, i) => `[${i + 1}] source: ${c.source}\n${c.text}`)
    .join("\n\n---\n\n");
}

export async function executeTool(
  name: string,
  rawInput: unknown,
  retriever: Retriever,
): Promise<ToolExecution> {
  switch (name) {
    case "search_profile": {
      const parsed = searchInput.safeParse(rawInput);
      if (!parsed.success) return { content: "Invalid input: query is required.", sources: [], isError: true };
      const { hits } = await retriever.search(parsed.data.query, 5);
      const chunks = hits.map((h) => h.chunk);
      return { content: formatChunks(chunks), sources: chunks.map((c) => c.source) };
    }
    case "get_project": {
      const parsed = projectInput.safeParse(rawInput);
      if (!parsed.success) return { content: "Invalid input: slug is required.", sources: [], isError: true };
      const meta = getProjects().find((p) => p.slug === parsed.data.slug);
      const chunks = retriever.chunksForFile(`project-${parsed.data.slug}.md`);
      if (!meta && chunks.length === 0) {
        return {
          content: `Unknown project slug "${parsed.data.slug}". Known slugs: ${getProjects().map((p) => p.slug).join(", ")}.`,
          sources: [],
        };
      }
      const header = meta
        ? `Project: ${meta.title}\nSummary: ${meta.summary}\nStack: ${meta.stack.join(", ")}\nLinks: ${JSON.stringify(meta.links)}\n\n`
        : "";
      return { content: header + formatChunks(chunks), sources: chunks.map((c) => c.source) };
    }
    case "get_availability": {
      const chunks = retriever
        .chunksForFile("facts.md")
        .filter((c) => /availability|location|identity/i.test(c.source));
      const summary = `Availability: ${SITE.availability}. Location: ${SITE.location}. Contact: ${SITE.email}.\n\n`;
      return {
        content: summary + formatChunks(chunks),
        sources: ["facts.md › Availability and preferences", ...chunks.map((c) => c.source)],
      };
    }
    default:
      return { content: `Unknown tool: ${name}`, sources: [], isError: true };
  }
}

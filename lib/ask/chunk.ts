import type { Chunk } from "./types";

const MAX_CHUNK_CHARS = 1200;

interface Section {
  path: string[];
  lines: string[];
}

/**
 * Split a markdown document into heading-scoped chunks. Each chunk carries a
 * breadcrumb source ("file › H1 › H2") so the model can cite it. Long sections
 * are split further on paragraph boundaries.
 */
export function chunkMarkdown(file: string, markdown: string): Chunk[] {
  const sections = splitSections(markdown);
  const chunks: Chunk[] = [];
  for (const section of sections) {
    const body = section.lines.join("\n").trim();
    if (!body) continue;
    const source = [file, ...section.path].join(" › ");
    for (const piece of splitLong(body)) {
      chunks.push({
        id: `${file}#${chunks.length}`,
        source,
        file,
        text: `${section.path.join(" / ")}\n${piece}`.trim(),
      });
    }
  }
  return chunks;
}

function splitSections(markdown: string): Section[] {
  const sections: Section[] = [];
  let path: string[] = [];
  let current: Section = { path: [], lines: [] };
  for (const line of markdown.split("\n")) {
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (!heading) {
      current.lines.push(line);
      continue;
    }
    sections.push(current);
    const level = heading[1].length;
    path = [...path.slice(0, level - 1), heading[2].trim()];
    current = { path: [...path], lines: [] };
  }
  sections.push(current);
  return sections;
}

function splitLong(text: string): string[] {
  if (text.length <= MAX_CHUNK_CHARS) return [text];
  const paragraphs = text.split(/\n\s*\n/);
  const out: string[] = [];
  let buffer = "";
  for (const paragraph of paragraphs) {
    const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    if (candidate.length > MAX_CHUNK_CHARS && buffer) {
      out.push(buffer);
      buffer = paragraph;
    } else {
      buffer = candidate;
    }
  }
  if (buffer) out.push(buffer);
  return out;
}

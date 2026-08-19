import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { PostMeta } from "./types";
import { isNotFound, isSafeSlug } from "./projects";

const WRITING_DIR = path.join(process.cwd(), "content", "writing");

const frontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  summary: z.string().default(""),
  draft: z.boolean().default(false),
});

function toMeta(slug: string, data: unknown): PostMeta {
  const parsed = frontmatterSchema.parse(data);
  return {
    slug,
    title: parsed.title,
    date: parsed.date.toISOString().slice(0, 10),
    summary: parsed.summary,
    draft: parsed.draft,
  };
}

export async function getPosts(): Promise<PostMeta[]> {
  const files = await fs.readdir(WRITING_DIR);
  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(WRITING_DIR, file), "utf8");
        return toMeta(file.replace(/\.mdx$/, ""), matter(raw).data);
      }),
  );
  return posts
    .filter((p) => !p.draft || process.env.NODE_ENV !== "production")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(
  slug: string,
): Promise<{ meta: PostMeta; content: string } | null> {
  if (!isSafeSlug(slug)) return null;
  try {
    const raw = await fs.readFile(path.join(WRITING_DIR, `${slug}.mdx`), "utf8");
    const { data, content } = matter(raw);
    return { meta: toMeta(slug, data), content };
  } catch (error: unknown) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

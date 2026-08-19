import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import projectsJson from "@/content/projects.json";
import type { ProjectMeta } from "./types";

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

export function getProjects(): ProjectMeta[] {
  return projectsJson as ProjectMeta[];
}

export function getProject(slug: string): ProjectMeta | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

export async function getProjectMdx(slug: string): Promise<string | null> {
  if (!isSafeSlug(slug)) return null;
  try {
    const raw = await fs.readFile(path.join(PROJECTS_DIR, `${slug}.mdx`), "utf8");
    return matter(raw).content;
  } catch (error: unknown) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

export function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ENOENT"
  );
}

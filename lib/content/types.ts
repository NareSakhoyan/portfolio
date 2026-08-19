export type ProjectLinks = Partial<
  Record<"repo" | "repo2" | "demo" | "live" | "report", string>
>;

export interface ProjectMeta {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  featured: boolean;
  size: "large" | "small";
  links: ProjectLinks;
  metric?: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
  draft: boolean;
}

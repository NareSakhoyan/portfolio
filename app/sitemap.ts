import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content/projects";
import { getPosts } from "@/lib/content/writing";
import { siteUrl } from "@/lib/site/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const posts = await getPosts();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/writing`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/evals`, changeFrequency: "monthly", priority: 0.5 },
    ...getProjects().map((p) => ({ url: `${base}/projects/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...posts.map((p) => ({ url: `${base}/writing/${p.slug}`, lastModified: p.date, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}

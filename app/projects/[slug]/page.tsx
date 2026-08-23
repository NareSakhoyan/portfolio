import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/mdx/mdx-content";
import { getProject, getProjectMdx, getProjects } from "@/lib/content/projects";
import type { ProjectLinks } from "@/lib/content/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary, type: "article" },
    alternates: { canonical: `/projects/${slug}` },
  };
}

const LINK_LABELS: Record<keyof ProjectLinks, string> = {
  live: "Live",
  demo: "Demo",
  repo: "Repo",
  repo2: "Front-end repo",
  report: "Report",
};

function isPlaceholder(url: string): boolean {
  return url.startsWith("REPLACE_ME");
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  const mdx = await getProjectMdx(slug);
  if (!project || !mdx) notFound();

  const links = (Object.entries(project.links) as [keyof ProjectLinks, string][]).filter(([, url]) => Boolean(url));

  return (
    <article className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <Link href="/#projects" className="text-sm text-fg-muted hover:text-fg">← Projects</Link>
      <header className="mt-6 max-w-[68ch]">
        <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-2 font-serif text-4xl tracking-tight text-fg sm:text-5xl">
          {project.title}
          {project.status === "in_progress" ? (
            <span className="rounded-full border border-dashed border-fg-subtle px-3 py-0.5 font-mono text-sm font-normal text-fg-subtle">
              in progress
            </span>
          ) : null}
        </h1>
        <p className="mt-4 text-lg text-fg-muted">{project.summary}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Links">
          {links.map(([key, url]) => (
            <li key={key}>
              {isPlaceholder(url) ? (
                <span className="inline-flex rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-fg-subtle" title="Link not yet published">
                  {LINK_LABELS[key]} · soon
                </span>
              ) : (
                <a
                  href={url}
                  className="inline-flex rounded-full border border-border bg-bg-elevated px-3 py-1.5 text-sm text-fg transition-colors hover:border-fg-subtle"
                  rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {LINK_LABELS[key]} ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </header>
      <div className="mt-10">
        <MdxContent source={mdx} />
      </div>
      <aside className="mt-12 max-w-[68ch] border-t border-border pt-6">
        <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-fg-subtle">Stack</h2>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.map((item) => (
            <li key={item} className="rounded-full border border-border px-2.5 py-0.5 text-sm text-fg-muted">{item}</li>
          ))}
        </ul>
      </aside>
    </article>
  );
}

import Link from "next/link";
import type { ProjectMeta } from "@/lib/content/types";

export function ProjectCard({ project }: { project: ProjectMeta }) {
  const isSmall = project.size === "small";
  return (
    <article
      className={`group relative flex flex-col rounded-xl border border-border bg-bg-elevated p-5 transition-colors hover:border-fg-subtle ${
        isSmall ? "sm:col-span-1" : "sm:col-span-1"
      }`}
    >
      <h3 className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-serif text-xl tracking-tight text-fg">
        <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:content-['']">
          {project.title}
        </Link>
        {project.status === "in_progress" ? (
          <span className="rounded-full border border-dashed border-fg-subtle px-2 py-0.5 font-mono text-[0.65rem] font-normal text-fg-subtle">
            in progress
          </span>
        ) : null}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{project.summary}</p>
      {project.metric && !project.metric.startsWith("REPLACE_ME") ? (
        <p className="mt-3 text-sm font-medium text-accent">{project.metric}</p>
      ) : null}
      <ul className="mt-auto flex flex-wrap gap-1.5 pt-4" aria-label="Stack">
        {project.stack.slice(0, isSmall ? 4 : 6).map((item) => (
          <li key={item} className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-subtle">
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

"use client";

import Link from "next/link";
import type { ProjectMeta } from "@/lib/content/types";
import { Scene } from "./scene";
import { ScrubWindow } from "./scrub";

/** Harness signature + human note per module, keyed by slug. */
const SIGNATURES: Record<string, { sig: string; note: string }> = {
  "job-search-agent": {
    sig: "agent harness · 4 graders · human approval gate",
    note: "its failures would ship under my name, so it earns autonomy through evals",
  },
  "ask-nare": {
    sig: "rag harness · live · you're using it",
    note: "retrieval, tools, guardrails, telemetry — the site answers for itself",
  },
  "llm-evalkit": {
    sig: "pure eval harness · 3 models · cost/latency report",
    note: "“which model?” is an empirical question",
  },
  "armenian-nlp": {
    sig: "eval when no benchmark exists",
    note: "for a low-resource language you build the measuring stick first",
  },
  foody: {
    sig: "classic full-stack · the foundation",
    note: "the substrate every harness stands on",
  },
};

function ModulePanel({ project, index, total }: { project: ProjectMeta; index: number; total: number }) {
  const meta = SIGNATURES[project.slug] ?? { sig: project.stack.slice(0, 3).join(" · "), note: "" };
  return (
    <div>
      <p className="font-mono text-xs text-fg-subtle">
        module {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
      </p>
      <h3 className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-serif text-4xl tracking-tight text-fg sm:text-6xl">
        <Link href={`/projects/${project.slug}`} className="hover:text-accent">
          {project.title}
        </Link>
        {project.status === "in_progress" ? (
          <span className="rounded-full border border-dashed border-fg-subtle px-2.5 py-0.5 font-mono text-xs font-normal tracking-normal text-fg-subtle">
            in progress
          </span>
        ) : null}
      </h3>
      <p className="mt-4 font-mono text-sm text-accent sm:text-base">{meta.sig}</p>
      <p className="mt-4 max-w-[52ch] text-lg text-fg-muted">{project.summary}</p>
      {meta.note ? <p className="mt-5 max-w-[48ch] font-serif text-xl italic text-fg-muted">{meta.note}</p> : null}
      <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Stack">
        {project.stack.slice(0, 6).map((item) => (
          <li key={item} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-fg-subtle">
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-6 font-mono text-xs text-fg-subtle">
        <Link href={`/projects/${project.slug}`} className="underline underline-offset-4 hover:text-fg">
          open module →
        </Link>
      </p>
    </div>
  );
}

function ModulesHeader() {
  return (
    <div className="mb-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">modules</p>
    </div>
  );
}

export function ModulesScene({ projects, reduce }: { projects: ProjectMeta[]; reduce: boolean }) {
  const total = projects.length;
  return (
    <Scene
      id="modules"
      length={Math.max(2.2, total * 0.46)}
      reduce={reduce}
      staticFrame={
        <>
          <ModulesHeader />
          <div className="space-y-16">
            {projects.map((p, i) => (
              <ModulePanel key={p.slug} project={p} index={i} total={total} />
            ))}
          </div>
        </>
      }
    >
      {(progress) => (
        <>
          <ModulesHeader />
          <div className="relative min-h-[24rem]">
            {projects.map((p, i) => (
              <ScrubWindow
                key={p.slug}
                progress={progress}
                enter={i === 0 ? 0 : i / total}
                exit={i === total - 1 ? 1 : (i + 1) / total}
                className="absolute inset-0"
              >
                <ModulePanel project={p} index={i} total={total} />
              </ScrubWindow>
            ))}
          </div>
        </>
      )}
    </Scene>
  );
}

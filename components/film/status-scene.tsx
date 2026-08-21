"use client";

import { SITE } from "@/lib/site/config";

export function StatusScene() {
  return (
    <div className="mx-auto flex min-h-[70svh] w-full max-w-6xl flex-col justify-center px-5 py-16 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">status</p>
      <p className="mt-4 inline-flex items-center gap-2 font-mono text-sm text-fg">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
        accepting connections
      </p>
      <p className="mt-4 max-w-[56ch] text-lg text-fg-muted">
        Remote worldwide · contract or EOR · start immediately. Looking for{" "}
        <span className="text-fg">{SITE.targetRoles.join(" · ")}</span> — shipping LLM systems into
        production: harnesses, evals, RAG, tool use.
      </p>
      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
        <li><a className="underline decoration-border underline-offset-4 hover:decoration-accent" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
        <li><a className="underline decoration-border underline-offset-4 hover:decoration-accent" href={SITE.github} rel="noopener noreferrer">github ↗</a></li>
        <li><a className="underline decoration-border underline-offset-4 hover:decoration-accent" href={SITE.linkedin} rel="noopener noreferrer">linkedin ↗</a></li>
        <li><a className="underline decoration-border underline-offset-4 hover:decoration-accent" href={SITE.cv}>cv.pdf</a></li>
      </ul>
    </div>
  );
}

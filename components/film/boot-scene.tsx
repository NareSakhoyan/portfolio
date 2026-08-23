"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site/config";
import type { BootStats } from "./types";

const LINE_STAGGER = 0.13;
const IDENTITY_AT = 1.15;
const HINT_AT = 2.1;

function bootLines(stats: BootStats): { label: string; detail: string; status: string }[] {
  return [
    { label: "retrieval", detail: `${stats.chunks} chunks · ${stats.files} sources · ${stats.retrieval}`, status: "ok" },
    { label: "tools", detail: "search_profile · get_project · get_availability", status: "ok" },
    { label: "guardrails", detail: "no salary · no speculation · cite or decline", status: "ok" },
    { label: "limiter", detail: "10/min per client · global cap · 64kb body", status: "ok" },
    { label: "graders", detail: "schema · hallucination · coverage · judge", status: "ok" },
    { label: "evals", detail: `${stats.cases} cases · ${stats.traps} traps · published`, status: "ok" },
    { label: "model", detail: stats.model, status: "(swappable)" },
  ];
}

/** Autoplay entrance: fades up on mount at a fixed delay (no scroll needed). */
function Enter({ delay, reduce, children }: { delay: number; reduce: boolean; children: ReactNode }) {
  if (reduce) return <div>{children}</div>;
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}

function BootLine({ label, detail, status }: { label: string; detail: string; status: string }) {
  return (
    <p className="flex gap-3 whitespace-nowrap">
      <span className="w-24 shrink-0 text-fg-subtle">{label}</span>
      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis">{detail}</span>
      <span className={status === "ok" ? "text-fg-subtle" : "text-accent"}>{status}</span>
    </p>
  );
}

function Identity() {
  return (
    <div className="mt-10">
      <p className="font-mono text-xs text-fg-subtle">harness ready.</p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight text-fg sm:text-7xl">{SITE.name}</h1>
      <p className="mt-3 text-lg text-fg-muted">{SITE.role} · {SITE.positioning}</p>
      <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-fg-muted">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
        accepting connections — remote · contract · immediate
      </p>
    </div>
  );
}

/**
 * Scene 1 plays by itself on page load — the visitor sees the harness boot
 * without touching the scroll wheel. Scroll takes over from the thesis scene.
 */
export function BootScene({ stats, reduce }: { stats: BootStats; reduce: boolean }) {
  return (
    <section
      id="boot"
      className="relative mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center px-5 py-16 sm:px-8"
    >
      <div className="font-mono text-[0.8rem] leading-7 text-fg-muted sm:text-sm" aria-label="System boot log">
        {bootLines(stats).map((line, i) => (
          <Enter key={line.label} delay={0.15 + i * LINE_STAGGER} reduce={reduce}>
            <BootLine {...line} />
          </Enter>
        ))}
      </div>
      <Enter delay={IDENTITY_AT} reduce={reduce}>
        <Identity />
      </Enter>
      <div aria-hidden="true" className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <Enter delay={HINT_AT} reduce={reduce}>
          <p className="font-mono text-xs text-fg-subtle">scroll ↓</p>
        </Enter>
      </div>
    </section>
  );
}

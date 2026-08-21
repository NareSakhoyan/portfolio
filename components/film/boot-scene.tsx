"use client";

import type { MotionValue } from "motion/react";
import { SITE } from "@/lib/site/config";
import { Scene } from "./scene";
import { FadeIn } from "./scrub";
import type { BootStats } from "./types";

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

function BootLog({ stats, progress }: { stats: BootStats; progress?: MotionValue<number> }) {
  const lines = bootLines(stats);
  return (
    <div className="font-mono text-[0.8rem] leading-7 text-fg-muted sm:text-sm" aria-label="System boot log">
      {lines.map((line, i) =>
        progress ? (
          <FadeIn key={line.label} progress={progress} at={0.06 + i * 0.07} y={4}>
            <BootLine {...line} />
          </FadeIn>
        ) : (
          <BootLine key={line.label} {...line} />
        ),
      )}
    </div>
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
      <p className="mt-3 text-lg text-fg-muted">{SITE.role} · {SITE.positioning.toLowerCase()}</p>
      <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-fg-muted">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
        accepting connections — remote · contract · immediate
      </p>
    </div>
  );
}

export function BootScene({ stats, reduce }: { stats: BootStats; reduce: boolean }) {
  return (
    <Scene
      id="boot"
      length={3}
      reduce={reduce}
      staticFrame={
        <>
          <BootLog stats={stats} />
          <Identity />
        </>
      }
    >
      {(progress) => (
        <>
          <BootLog stats={stats} progress={progress} />
          <FadeIn progress={progress} at={0.62} span={0.12} y={16}>
            <Identity />
          </FadeIn>
        </>
      )}
    </Scene>
  );
}

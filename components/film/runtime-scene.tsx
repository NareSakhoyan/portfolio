"use client";

import { m, useTransform, type MotionValue } from "motion/react";
import type { ExperienceEntry } from "@/lib/content/types";
import { formatYearMonth } from "@/lib/content/experience";
import { Scene } from "./scene";

/** Arc label per company: how each stop builds toward harness engineering. */
const ARC: Record<string, string> = {
  Matemat: "foundations: full-stack, search, data",
  "Hearst Autos": "scale: the platform behind Car and Driver & every Hearst site",
  Turing: "inside the reward model — I wrote and graded what teaches models “correct”",
  Prostrive: "orchestration: multiple LLM providers, automated validation of AI answers",
};

function RuntimePanel({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="flex h-svh w-screen shrink-0 flex-col justify-center px-5 sm:px-16">
      <p className="font-mono text-xs text-fg-subtle">
        {formatYearMonth(entry.start).toLowerCase()} → {formatYearMonth(entry.end).toLowerCase()} · {entry.location.toLowerCase()}
      </p>
      <h3 className="mt-3 font-serif text-4xl tracking-tight text-fg sm:text-5xl">{entry.company}</h3>
      <p className="mt-1 text-lg text-fg-muted">{entry.role}</p>
      <p className="mt-5 max-w-[46ch] font-serif text-2xl italic leading-snug text-fg sm:text-3xl">
        {ARC[entry.company] ?? ""}
      </p>
      <ul className="mt-6 max-w-[60ch] space-y-2 font-mono text-sm text-fg-muted">
        {entry.bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span aria-hidden="true" className="text-fg-subtle">▸</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Track({ entries, progress }: { entries: ExperienceEntry[]; progress: MotionValue<number> }) {
  // Chronological order, oldest first; Turing gets the long dwell (0.42 → 0.75).
  const x = useTransform(progress, [0, 0.22, 0.42, 0.75, 0.97], ["0vw", "-100vw", "-200vw", "-200vw", "-300vw"]);
  return (
    <m.div style={{ x }} className="flex w-max will-change-transform">
      {entries.map((entry) => (
        <RuntimePanel key={entry.company} entry={entry} />
      ))}
    </m.div>
  );
}

export function RuntimeScene({ experience, reduce }: { experience: ExperienceEntry[]; reduce: boolean }) {
  const chronological = [...experience].reverse();
  const header = (
    <p className="absolute left-5 top-8 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle sm:left-8">
      runtime history
    </p>
  );
  return (
    <Scene
      id="runtime"
      length={Math.max(1.8, chronological.length * 0.5)}
      reduce={reduce}
      className="!max-w-none !px-0"
      staticFrame={
        <div className="mx-auto w-full max-w-6xl space-y-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">runtime history</p>
          {chronological.map((entry) => (
            <div key={entry.company} className="[&>div]:h-auto [&>div]:w-auto [&>div]:px-0">
              <RuntimePanel entry={entry} />
            </div>
          ))}
          <p className="font-mono text-xs text-fg-subtle">cs coursework · université toulouse iii · 2019–2023</p>
        </div>
      }
    >
      {(progress) => (
        <>
          {header}
          <Track entries={chronological} progress={progress} />
          <p className="absolute bottom-8 left-5 font-mono text-xs text-fg-subtle sm:left-8">
            cs coursework · université toulouse iii · 2019–2023
          </p>
        </>
      )}
    </Scene>
  );
}

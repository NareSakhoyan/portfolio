"use client";

import { m, useTransform, type MotionValue } from "motion/react";
import type { ReactNode } from "react";
import { Scene } from "./scene";
import { DrawPath, FadeIn, useRatchetedProgress } from "./scrub";

/** Blocks of this site's own harness, laid out on a 960×340 canvas. */
const BLOCKS = [
  { id: "request", x: 10, y: 140, w: 110, label: "request", at: 0.06 },
  { id: "limiter", x: 170, y: 140, w: 110, label: "limiter", at: 0.14 },
  { id: "loop", x: 330, y: 140, w: 140, label: "agent loop", at: 0.22 },
  { id: "tools", x: 520, y: 60, w: 120, label: "tools ×3", at: 0.32 },
  { id: "retrieval", x: 690, y: 60, w: 150, label: "retrieval", at: 0.4 },
  { id: "guardrails", x: 520, y: 140, w: 120, label: "guardrails", at: 0.48 },
  { id: "stream", x: 520, y: 230, w: 150, label: "stream + telemetry", at: 0.58 },
  { id: "evals", x: 720, y: 230, w: 130, label: "evals", at: 0.68 },
] as const;

const EDGES = [
  { d: "M 120 160 H 168", at: 0.1 },
  { d: "M 280 160 H 328", at: 0.18 },
  { d: "M 470 160 L 518 90", at: 0.28 },
  { d: "M 640 80 H 688", at: 0.36 },
  { d: "M 470 160 H 518", at: 0.44 },
  { d: "M 400 180 L 400 250 L 518 250", at: 0.54 },
  { d: "M 670 250 H 718", at: 0.64 },
] as const;

const NOTES = [
  { at: 0.16, text: "the model never sees a request the limiter didn’t approve" },
  { at: 0.42, text: "every answer traces to a retrieved chunk — cite or decline" },
  { at: 0.62, text: "latency and cost are printed under every reply, not hidden in logs" },
  { at: 0.72, text: "8 cases · 3 traps defined — run pending, failures will be included" },
] as const;

function Schematic({ progress }: { progress?: MotionValue<number> }) {
  return (
    <svg
      viewBox="0 0 960 340"
      role="img"
      aria-label="Schematic of this site's harness: request through limiter into the agent loop, out to tools and retrieval, constrained by guardrails, streaming with telemetry into the evals pipeline"
      className="w-full max-w-5xl text-fg-subtle"
    >
      {BLOCKS.map((b) => {
        const block = (
          <g key={b.id} className="text-fg">
            <rect x={b.x} y={b.y} width={b.w} height={40} rx={6} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.25} />
            <text x={b.x + b.w / 2} y={b.y + 25} textAnchor="middle" fill="currentColor" className="font-mono" fontSize={14}>
              {b.label}
            </text>
          </g>
        );
        if (!progress) return block;
        return (
          <FadeInGroup key={b.id} progress={progress} at={b.at}>
            {block}
          </FadeInGroup>
        );
      })}
      {EDGES.map((e) =>
        progress ? (
          <DrawPath key={e.d} progress={progress} at={e.at} d={e.d} className="text-accent" />
        ) : (
          <path key={e.d} d={e.d} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-accent" />
        ),
      )}
    </svg>
  );
}

// SVG groups animate opacity only — transforms would shift the diagram geometry.
// Ratcheted so a drawn block stays visible once revealed, even scrolling back up.
function FadeInGroup({ progress, at, children }: { progress: MotionValue<number>; at: number; children: ReactNode }) {
  const ratcheted = useRatchetedProgress(progress);
  const opacity = useTransform(ratcheted, [at, at + 0.05], [0, 1]);
  return <m.g style={{ opacity }}>{children}</m.g>;
}

export function AnatomyScene({ reduce }: { reduce: boolean }) {
  const header = (
    <div className="mb-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">anatomy</p>
      <h2 className="mt-2 font-serif text-3xl tracking-tight text-fg sm:text-4xl">This site is the schematic</h2>
    </div>
  );
  return (
    <Scene
      id="anatomy"
      length={1.9}
      reduce={reduce}
      staticFrame={
        <>
          {header}
          <Schematic />
          <ul className="mt-6 max-w-2xl space-y-2">
            {NOTES.map((n) => (
              <li key={n.text} className="font-serif text-lg italic text-fg-muted">{n.text}</li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-xs text-accent">[ you are here ]</p>
        </>
      }
    >
      {(progress) => (
        <>
          {header}
          <Schematic progress={progress} />
          <div className="relative mt-6 h-16 max-w-2xl">
            {NOTES.map((n, i) => (
              <FadeIn
                key={n.text}
                progress={progress}
                at={n.at}
                span={0.05}
                className="absolute inset-0"
              >
                <FadeOutNote progress={progress} until={i < NOTES.length - 1 ? NOTES[i + 1].at : 1}>
                  <p className="font-serif text-lg italic text-fg-muted sm:text-xl">{n.text}</p>
                </FadeOutNote>
              </FadeIn>
            ))}
          </div>
          <FadeIn progress={progress} at={0.82} span={0.08}>
            <p className="mt-4 font-mono text-xs text-accent">[ you are here ]</p>
          </FadeIn>
        </>
      )}
    </Scene>
  );
}

// Ratcheted: the crossfade to the next note still plays forward on scroll-down,
// but scrolling back up won't un-fade the currently-shown note.
function FadeOutNote({ progress, until, children }: { progress: MotionValue<number>; until: number; children: ReactNode }) {
  const ratcheted = useRatchetedProgress(progress);
  const opacity = useTransform(ratcheted, [until - 0.01, until + 0.02], [1, 0]);
  return <m.div style={until < 1 ? { opacity } : undefined}>{children}</m.div>;
}

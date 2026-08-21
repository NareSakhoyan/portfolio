"use client";

import Link from "next/link";
import type { MotionValue } from "motion/react";
import { Scene } from "./scene";
import { FadeIn } from "./scrub";
import type { FilmEvalCase } from "./types";

function CaseRow({ evalCase }: { evalCase: FilmEvalCase }) {
  const isTrap = evalCase.expectRefusal || evalCase.id.startsWith("trap");
  return (
    <p className="flex items-baseline gap-3 font-mono text-[0.8rem] leading-7 sm:text-sm">
      <span className={`w-28 shrink-0 truncate ${isTrap ? "text-accent" : "text-fg-subtle"}`}>{evalCase.id}</span>
      <span className="min-w-0 flex-1 truncate text-fg-muted">{evalCase.question}</span>
      <span className="shrink-0 text-fg-subtle">
        {evalCase.expectRefusal ? "must decline ✓" : isTrap ? "trap · graded ✓" : "graded ✓"}
      </span>
    </p>
  );
}

function Header() {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">self-test</p>
      <h2 className="mt-2 font-serif text-3xl leading-tight tracking-tight text-fg sm:text-5xl">
        A harness that can’t fail its own tests isn’t testing anything.
      </h2>
    </div>
  );
}

function Footer() {
  return (
    <p className="mt-8 font-mono text-xs text-fg-subtle">
      deterministic checks + llm judge · fails the build under threshold ·{" "}
      <Link href="/evals" className="text-accent underline underline-offset-4">
        full scorecard →
      </Link>
    </p>
  );
}

export function SelfTestScene({ cases, reduce }: { cases: FilmEvalCase[]; reduce: boolean }) {
  const rows = (progress?: MotionValue<number>) => (
    <div aria-label="Evaluation cases">
      {cases.map((c, i) =>
        progress ? (
          <FadeIn key={c.id} progress={progress} at={0.18 + (i * 0.6) / cases.length} y={4}>
            <CaseRow evalCase={c} />
          </FadeIn>
        ) : (
          <CaseRow key={c.id} evalCase={c} />
        ),
      )}
    </div>
  );
  return (
    <Scene
      id="selftest"
      length={3}
      reduce={reduce}
      staticFrame={
        <>
          <Header />
          {rows()}
          <Footer />
        </>
      }
    >
      {(progress) => (
        <>
          <Header />
          {rows(progress)}
          <FadeIn progress={progress} at={0.85}>
            <Footer />
          </FadeIn>
        </>
      )}
    </Scene>
  );
}

"use client";

import { AskWidget } from "@/components/ask/ask-widget";

/** The finale is interactive, so it scrolls normally — no scrub. */
export function ConsoleScene() {
  return (
    <div id="console" className="mx-auto flex min-h-svh w-full max-w-5xl scroll-mt-16 flex-col justify-center px-5 py-16 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">console</p>
      <h2 className="mt-2 max-w-3xl font-serif text-3xl leading-tight tracking-tight text-fg sm:text-5xl">
        This is a harness with a model inside.
      </h2>
      <p className="mt-2 font-mono text-sm text-accent">interrogate it.</p>
      <div className="mt-8 [&>section]:px-0">
        <AskWidget />
      </div>
    </div>
  );
}

"use client";

import { Scene } from "./scene";
import { FadeIn } from "./scrub";

const LINES = [
  { text: "Anyone can call a model.", mono: false },
  { text: "I build the harness around it —", mono: false },
  { text: "the loop · the limits · the retrieval · the graders", mono: true },
  { text: "— the part that decides whether it can be trusted.", mono: false },
] as const;

function ThesisLines({ progress }: { progress?: import("motion/react").MotionValue<number> }) {
  return (
    <div className="max-w-4xl">
      {LINES.map((line, i) => {
        const content = line.mono ? (
          <p className="my-6 font-mono text-base text-accent sm:text-xl">{line.text}</p>
        ) : (
          <p className="font-serif text-4xl leading-tight tracking-tight text-fg sm:text-6xl">{line.text}</p>
        );
        return progress ? (
          <FadeIn key={line.text} progress={progress} at={0.12 + i * 0.16} span={0.1} y={24}>
            {content}
          </FadeIn>
        ) : (
          <div key={line.text}>{content}</div>
        );
      })}
    </div>
  );
}

export function ThesisScene({ reduce }: { reduce: boolean }) {
  return (
    <Scene
      id="thesis"
      length={3}
      reduce={reduce}
      staticFrame={
        <>
          <ThesisLines />
          <p className="mt-12 font-mono text-xs text-fg-subtle">this page is one. keep scrolling.</p>
        </>
      }
    >
      {(progress) => (
        <>
          <ThesisLines progress={progress} />
          <FadeIn progress={progress} at={0.85} span={0.1}>
            <p className="mt-12 font-mono text-xs text-fg-subtle">this page is one. keep scrolling.</p>
          </FadeIn>
        </>
      )}
    </Scene>
  );
}

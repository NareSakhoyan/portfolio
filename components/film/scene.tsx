"use client";

import { useScroll, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";

interface SceneProps {
  id?: string;
  /** Scroll length in viewport heights. */
  length?: number;
  /** prefers-reduced-motion: render the static end-state instead of a scrub. */
  reduce: boolean;
  className?: string;
  children: (progress: MotionValue<number>) => ReactNode;
  staticFrame: ReactNode;
}

/**
 * A film scene: a tall scroll region whose sticky viewport is scrubbed by
 * scroll progress. With reduced motion it collapses to a static full-height
 * frame showing the scene's final composition.
 */
export function Scene({ id, length = 3, reduce, className, children, staticFrame }: SceneProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  if (reduce) {
    return (
      <section
        id={id}
        className={`relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-16 sm:px-8 ${className ?? ""}`}
      >
        {staticFrame}
      </section>
    );
  }
  return (
    <section id={id} ref={ref} style={{ height: `${length * 100}svh` }} className="relative">
      <div
        className={`sticky top-0 mx-auto flex h-svh w-full max-w-6xl flex-col justify-center overflow-hidden px-5 sm:px-8 ${className ?? ""}`}
      >
        {children(scrollYProgress)}
      </div>
    </section>
  );
}

"use client";

import { m, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useEffect } from "react";
import type { ReactNode } from "react";

/**
 * A derived progress value that only ever increases. Entrance reveals driven
 * by this play once on the way down and hold their end state on scroll-up
 * instead of reversing (text shouldn't disappear when you scroll back).
 */
export function useRatchetedProgress(progress: MotionValue<number>): MotionValue<number> {
  const ratcheted = useMotionValue(progress.get());
  useEffect(() => {
    return progress.on("change", (latest) => {
      if (latest > ratcheted.get()) ratcheted.set(latest);
    });
  }, [progress, ratcheted]);
  return ratcheted;
}

interface FadeInProps {
  progress: MotionValue<number>;
  /** Scene progress (0..1) at which this element starts appearing. */
  at: number;
  /** Progress span of the fade itself. */
  span?: number;
  y?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Scroll-scrubbed fade + rise, driven by a ratcheted (one-way) progress —
 * plays once as the user scrolls down and stays put on scroll-up. One
 * component per animated line keeps hooks out of loops.
 */
export function FadeIn({ progress, at, span = 0.05, y = 10, className, children }: FadeInProps) {
  const ratcheted = useRatchetedProgress(progress);
  const opacity = useTransform(ratcheted, [at, at + span], [0, 1]);
  const translateY = useTransform(ratcheted, [at, at + span], [y, 0]);
  return (
    <m.div style={{ opacity, y: translateY }} className={className}>
      {children}
    </m.div>
  );
}

interface WindowProps {
  progress: MotionValue<number>;
  /** Progress window [enter, exit] during which this panel is fully visible. */
  enter: number;
  exit: number;
  fade?: number;
  className?: string;
  children: ReactNode;
}

/** Panel visible only inside a progress window; crossfades at the edges. */
export function ScrubWindow({ progress, enter, exit, fade = 0.04, className, children }: WindowProps) {
  const opacity = useTransform(
    progress,
    [enter, Math.min(enter + fade, exit), Math.max(exit - fade, enter), exit],
    [0, 1, 1, 0],
  );
  const pointerEvents = useTransform(opacity, (v) => (v > 0.5 ? "auto" : "none"));
  return (
    <m.div style={{ opacity, pointerEvents }} className={className}>
      {children}
    </m.div>
  );
}

interface DrawPathProps {
  progress: MotionValue<number>;
  at: number;
  span?: number;
  d: string;
  className?: string;
}

/** SVG path that draws itself across a progress range and stays drawn on scroll-up. */
export function DrawPath({ progress, at, span = 0.08, d, className }: DrawPathProps) {
  const ratcheted = useRatchetedProgress(progress);
  const pathLength = useTransform(ratcheted, [at, at + span], [0, 1]);
  return (
    <m.path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      style={{ pathLength }}
      className={className}
    />
  );
}

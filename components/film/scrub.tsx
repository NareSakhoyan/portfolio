"use client";

import { m, useTransform, type MotionValue } from "motion/react";
import type { ReactNode } from "react";

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

/** Scroll-scrubbed fade + rise. One component per animated line keeps hooks out of loops. */
export function FadeIn({ progress, at, span = 0.05, y = 10, className, children }: FadeInProps) {
  const opacity = useTransform(progress, [at, at + span], [0, 1]);
  const translateY = useTransform(progress, [at, at + span], [y, 0]);
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

/** SVG path that draws itself across a progress range. */
export function DrawPath({ progress, at, span = 0.08, d, className }: DrawPathProps) {
  const pathLength = useTransform(progress, [at, at + span], [0, 1]);
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

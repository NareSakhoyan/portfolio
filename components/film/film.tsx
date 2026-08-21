"use client";

import { LazyMotion, domAnimation, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ExperienceEntry, ProjectMeta } from "@/lib/content/types";
import { AnatomyScene } from "./anatomy-scene";
import { BootScene } from "./boot-scene";
import { ConsoleScene } from "./console-scene";
import { ModulesScene } from "./modules-scene";
import { RuntimeScene } from "./runtime-scene";
import { SelfTestScene } from "./selftest-scene";
import { StatusScene } from "./status-scene";
import { ThesisScene } from "./thesis-scene";
import type { BootStats, FilmEvalCase } from "./types";

interface FilmProps {
  stats: BootStats;
  projects: ProjectMeta[];
  experience: ExperienceEntry[];
  cases: FilmEvalCase[];
}

export function Film({ stats, projects, experience, cases }: FilmProps) {
  const reduce = useReducedMotion() ?? false;
  const router = useRouter();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "i" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
      router.push("/overview");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <LazyMotion features={domAnimation} strict>
      <div data-film className="contents">
      <BootScene stats={stats} reduce={reduce} />
      <ThesisScene reduce={reduce} />
      <AnatomyScene reduce={reduce} />
      <ModulesScene projects={projects} reduce={reduce} />
      <RuntimeScene experience={experience} reduce={reduce} />
      <SelfTestScene cases={cases} reduce={reduce} />
      <ConsoleScene />
      <StatusScene />
      <p aria-hidden="true" className="pointer-events-none fixed bottom-4 right-4 z-40 hidden font-mono text-[0.65rem] text-fg-subtle sm:block">
        press <kbd className="rounded border border-border px-1">i</kbd> for index
      </p>
      </div>
    </LazyMotion>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Experience } from "@/components/home/experience";
import { Hero } from "@/components/home/hero";
import { Now } from "@/components/home/now";
import { ProjectsGrid } from "@/components/home/projects-grid";
import { WritingPreview } from "@/components/home/writing-preview";

export const metadata: Metadata = {
  title: "Index",
  description: "The scannable index view of the site: projects, experience, writing, availability.",
  alternates: { canonical: "/overview" },
};

export default function OverviewPage() {
  return (
    <>
      <p className="mx-auto w-full max-w-5xl px-5 pt-6 font-mono text-xs text-fg-subtle sm:px-8">
        index view ·{" "}
        <Link href="/" className="underline underline-offset-4 hover:text-fg">
          watch the film instead →
        </Link>
      </p>
      <Hero />
      <ProjectsGrid />
      <Experience />
      <WritingPreview />
      <Now />
    </>
  );
}

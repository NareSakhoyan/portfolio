import { AskWidget } from "@/components/ask/ask-widget";
import { Experience } from "@/components/home/experience";
import { Hero } from "@/components/home/hero";
import { Now } from "@/components/home/now";
import { ProjectsGrid } from "@/components/home/projects-grid";
import { WritingPreview } from "@/components/home/writing-preview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AskWidget />
      <ProjectsGrid />
      <Experience />
      <WritingPreview />
      <Now />
    </>
  );
}

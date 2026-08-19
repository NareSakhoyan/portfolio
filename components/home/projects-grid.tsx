import { getProjects } from "@/lib/content/projects";
import { ProjectCard } from "./project-card";
import { Section } from "./section";

export function ProjectsGrid() {
  const projects = getProjects().filter((p) => p.featured);
  const large = projects.filter((p) => p.size === "large");
  const small = projects.filter((p) => p.size === "small");
  return (
    <Section id="projects" eyebrow="Selected work" title="Projects">
      <div className="grid gap-4 sm:grid-cols-2">
        {large.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
      {small.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {small.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : null}
    </Section>
  );
}

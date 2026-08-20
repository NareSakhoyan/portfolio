import { Reveal } from "@/components/motion/reveal";
import { SITE } from "@/lib/site/config";

const LINKS = [
  { href: SITE.github, label: "GitHub" },
  { href: SITE.linkedin, label: "LinkedIn" },
  { href: `mailto:${SITE.email}`, label: "Email" },
  { href: SITE.cv, label: "CV (PDF)" },
] as const;

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="mx-auto w-full max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-20">
      <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3 py-1 text-xs font-medium text-fg-muted">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
        {SITE.availability}
      </p>
      <h1 id="hero-title" className="font-serif text-[2.6rem] leading-[1.05] tracking-tight text-fg sm:text-6xl">
        {SITE.name}
      </h1>
      <p className="mt-3 text-lg text-fg-muted">
        {SITE.role} · {SITE.positioning.toLowerCase()}
      </p>
      {/* Kept static: it is the LCP element, so it must paint before hydration. */}
      <p className="mt-8 max-w-[40ch] font-serif text-2xl leading-snug text-fg sm:text-[2rem]">
        {SITE.tagline}
      </p>
      <Reveal delay={0.1}>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-fg underline decoration-border underline-offset-4 transition-colors hover:decoration-accent"
                rel={link.href.startsWith("http") ? "noopener noreferrer me" : undefined}
              >
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
      <p className="mt-6 text-sm text-fg-subtle">
        agent harnesses · evals · RAG · tool use — on a full-stack TypeScript foundation · {SITE.location}
      </p>
    </section>
  );
}

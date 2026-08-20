import { SITE } from "@/lib/site/config";
import { Section } from "./section";

export function Now() {
  return (
    <Section id="now" eyebrow="Now" title="What I’m looking for">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="max-w-[60ch] space-y-4 text-[0.97rem] text-fg-muted">
          <p>
            <strong className="text-fg">Available now</strong> for remote roles worldwide and for contract or EOR arrangements. Based in {SITE.location} (UTC+4), comfortable overlapping with European and US-East hours.
          </p>
          <p>
            I’m looking for roles like <strong className="text-fg">Applied AI Engineer, Forward Deployed Engineer, AI Infrastructure / Agent Platform Engineer, or AI Systems Engineer</strong> — shipping LLM systems into production: harnesses, evals, RAG, tool use. Ideal: a real product, TypeScript end to end, and AI features that need proof, not just demos.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-bg-elevated p-5 text-sm">
          <p className="font-medium text-fg">Get in touch</p>
          <ul className="mt-3 space-y-2 text-fg-muted">
            <li><a className="underline decoration-border underline-offset-4 hover:decoration-accent" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            <li><a className="underline decoration-border underline-offset-4 hover:decoration-accent" href={SITE.linkedin} rel="noopener noreferrer">LinkedIn ↗</a></li>
            <li><a className="underline decoration-border underline-offset-4 hover:decoration-accent" href={SITE.cv}>Download CV (PDF)</a></li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

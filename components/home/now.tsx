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
            I’m looking for a senior full-stack or AI-product engineering role where shipping features and measuring whether they work both count. Ideal: TypeScript end to end, a real product, and LLM features that need evals, not just demos.
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

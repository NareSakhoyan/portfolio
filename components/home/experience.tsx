import { formatYearMonth, getExperience } from "@/lib/content/experience";
import { Section } from "./section";

export function Experience() {
  const entries = getExperience();
  return (
    <Section id="experience" eyebrow="Timeline" title="Experience">
      <ol className="relative border-l border-border pl-6">
        {entries.map((entry) => (
          <li key={`${entry.company}-${entry.start}`} className="relative pb-10 last:pb-0">
            <span aria-hidden="true" className="absolute -left-[29px] top-2 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent" />
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-fg-subtle">
              <time dateTime={entry.start}>{formatYearMonth(entry.start)}</time> – <time dateTime={entry.end}>{formatYearMonth(entry.end)}</time>
            </p>
            <h3 className="mt-1 text-lg font-medium text-fg">
              {entry.role} <span className="text-fg-muted">· {entry.company}</span>
            </h3>
            <p className="text-sm text-fg-subtle">{entry.location}</p>
            <ul className="mt-3 max-w-[68ch] list-disc space-y-1.5 pl-5 text-[0.95rem] text-fg-muted">
              {entry.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-sm text-fg-subtle">Computer Science coursework · Université Toulouse III · 2019–2023</p>
    </Section>
  );
}

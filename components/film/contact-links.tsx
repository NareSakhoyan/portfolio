import { SITE } from "@/lib/site/config";

/** Shared contact link row, used by both the mid-film and end-of-film status beats. */
export function ContactLinks({ className }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm ${className ?? ""}`}>
      <li>
        <a className="underline decoration-border underline-offset-4 hover:decoration-accent" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
      </li>
      <li>
        <a className="underline decoration-border underline-offset-4 hover:decoration-accent" href={SITE.github} rel="noopener noreferrer">
          github ↗
        </a>
      </li>
      <li>
        <a className="underline decoration-border underline-offset-4 hover:decoration-accent" href={SITE.linkedin} rel="noopener noreferrer">
          linkedin ↗
        </a>
      </li>
      <li>
        <a className="underline decoration-border underline-offset-4 hover:decoration-accent" href={SITE.cv}>
          cv.pdf
        </a>
      </li>
    </ul>
  );
}

import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function Section({ id, title, eyebrow, children, action }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mx-auto w-full max-w-5xl scroll-mt-24 px-5 py-14 sm:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          {eyebrow ? <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-fg-subtle">{eyebrow}</p> : null}
          <h2 id={`${id}-title`} className="font-serif text-3xl tracking-tight text-fg">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

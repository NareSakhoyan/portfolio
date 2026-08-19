import { SITE } from "@/lib/site/config";

export function Footer() {
  return (
    <footer className="mx-auto mt-24 w-full max-w-5xl border-t border-border px-5 py-10 text-sm text-fg-muted sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Built with Next.js and Claude ·{" "}
          <a
            href={SITE.sourceRepo}
            className="underline decoration-border underline-offset-4 hover:text-fg hover:decoration-fg"
            rel="noopener noreferrer"
          >
            source ↗
          </a>
        </p>
        <p className="flex flex-wrap gap-x-4">
          <a href={`mailto:${SITE.email}`} className="hover:text-fg">Email</a>
          <a href={SITE.github} className="hover:text-fg" rel="noopener noreferrer">GitHub</a>
          <a href={SITE.linkedin} className="hover:text-fg" rel="noopener noreferrer">LinkedIn</a>
          <a href="/feed.xml" className="hover:text-fg">RSS</a>
        </p>
      </div>
    </footer>
  );
}

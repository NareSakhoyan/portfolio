import Link from "next/link";
import { SITE } from "@/lib/site/config";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/overview", label: "Index" },
  { href: "/writing", label: "Writing" },
  { href: "/evals", label: "Evals" },
] as const;

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-4 sm:px-8 sm:py-6">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-bg-elevated focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <Link href="/" className="shrink-0 whitespace-nowrap font-serif text-base tracking-tight text-fg sm:text-lg">
        {SITE.name}
      </Link>
      <nav aria-label="Primary" className="flex min-w-0 items-center gap-0.5 sm:gap-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-full px-2 py-1 text-xs text-fg-muted transition-colors hover:text-fg sm:px-3 sm:py-1.5 sm:text-sm"
          >
            {item.label}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}

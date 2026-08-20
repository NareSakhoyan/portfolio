import Link from "next/link";
import { SITE } from "@/lib/site/config";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/#projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/writing", label: "Writing" },
  { href: "/#now", label: "Now" },
] as const;

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-bg-elevated focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <Link href="/" className="font-serif text-lg tracking-tight text-fg">
        {SITE.name}
      </Link>
      <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-3 py-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            {item.label}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}

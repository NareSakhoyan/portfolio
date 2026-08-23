import { SITE } from "@/lib/site/config";
import { ContactLinks } from "./contact-links";

/**
 * A compact status/contact beat at roughly the ⅓ mark — right after the
 * visitor has seen the harness's anatomy, before the module walkthrough.
 * Keeps the "how do I reach her" answer close, not only at the very end.
 */
export function MidStatusScene() {
  return (
    <div className="mx-auto flex min-h-[45svh] w-full max-w-6xl flex-col justify-center border-y border-border/60 px-5 py-12 sm:px-8">
      <p className="inline-flex items-center gap-2 font-mono text-xs text-fg-subtle">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
        accepting connections — remote · contract or EOR · start immediately
      </p>
      <p className="mt-3 max-w-[60ch] text-fg-muted">
        Looking for <span className="text-fg">{SITE.targetRoles.join(" · ")}</span>.
      </p>
      <ContactLinks className="mt-5" />
    </div>
  );
}

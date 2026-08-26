/** Repeated enough times that one copy of the track is wider than any viewport. */
const REPEATS = 20;
const MESSAGE = `${Array(REPEATS).fill("UNFINISHED").join("   ·   ")}   ·   `;

/**
 * A slim, honest ticker pinned to the very top of every page: this site is a
 * work in progress, same message the "in progress" badges make elsewhere.
 * Pure CSS animation (see .marquee-track in globals.css) — no JS, no client
 * boundary needed. Decorative: the real "in progress" statuses are already
 * exposed with proper semantics on the project cards themselves.
 */
export function MarqueeBanner() {
  return (
    <div
      aria-hidden="true"
      className="sticky top-0 z-[60] overflow-hidden border-b border-border bg-accent-soft"
    >
      <div className="marquee-track flex w-max whitespace-nowrap py-1.5 font-mono text-[0.7rem] tracking-wide text-accent">
        <span className="px-2">{MESSAGE}</span>
        <span className="px-2">{MESSAGE}</span>
      </div>
    </div>
  );
}

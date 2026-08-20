"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";

/**
 * Renders a Mermaid diagram client-side. The (large) mermaid bundle is only
 * downloaded on pages that actually contain a diagram, and only once the
 * diagram scrolls near the viewport.
 */
export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === "dark" ? "dark" : "neutral",
          fontFamily: "inherit",
          securityLevel: "strict",
        });
        const { svg: rendered } = await mermaid.render(`mermaid-${id}-${resolvedTheme ?? "light"}`, chart);
        if (!cancelled) setSvg(rendered);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Diagram failed to render.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id, isVisible, resolvedTheme]);

  if (error) {
    return (
      <pre className="text-sm">
        <code>{chart}</code>
      </pre>
    );
  }
  return (
    <div
      ref={ref}
      role="img"
      aria-label="Architecture diagram"
      className="mermaid-diagram my-6 overflow-x-auto rounded-xl border border-border bg-bg-elevated p-4"
      {...(svg ? { dangerouslySetInnerHTML: { __html: svg } } : {})}
    >
      {svg ? undefined : <p className="text-sm text-fg-subtle">Rendering diagram…</p>}
    </div>
  );
}

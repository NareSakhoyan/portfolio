"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-24 sm:px-8">
      <h1 className="font-serif text-4xl tracking-tight text-fg">Something went wrong</h1>
      <p className="mt-3 text-fg-muted">The page failed to render. You can try again.</p>
      <button type="button" onClick={reset} className="mt-6 rounded-full border border-border px-4 py-2 text-sm text-fg hover:border-fg-subtle">
        Try again
      </button>
    </div>
  );
}

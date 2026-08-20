import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-24 sm:px-8">
      <h1 className="font-serif text-4xl tracking-tight text-fg">Not found</h1>
      <p className="mt-3 text-fg-muted">That page doesn’t exist.</p>
      <Link href="/" className="mt-6 inline-block underline decoration-border underline-offset-4 hover:decoration-accent">← Home</Link>
    </div>
  );
}

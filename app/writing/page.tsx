import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/content/writing";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes on building and evaluating LLM features, agents, and low-resource NLP.",
  alternates: { canonical: "/writing", types: { "application/rss+xml": "/feed.xml" } },
};

export default async function WritingPage() {
  const posts = await getPosts();
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <h1 className="font-serif text-4xl tracking-tight text-fg">Writing</h1>
      <p className="mt-3 max-w-[60ch] text-fg-muted">
        Notes on shipping LLM features and measuring whether they work. <a href="/feed.xml" className="underline decoration-border underline-offset-4 hover:decoration-accent">RSS</a>
      </p>
      <ul className="mt-10 divide-y divide-border">
        {posts.map((post) => (
          <li key={post.slug} className="py-6">
            <Link href={`/writing/${post.slug}`} className="group block">
              <time dateTime={post.date} className="text-sm text-fg-subtle">{post.date}</time>
              <h2 className="mt-1 font-serif text-2xl tracking-tight text-fg group-hover:text-accent">{post.title}</h2>
              <p className="mt-2 max-w-[68ch] text-fg-muted">{post.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

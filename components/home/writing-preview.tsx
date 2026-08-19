import Link from "next/link";
import { getPosts } from "@/lib/content/writing";
import { Section } from "./section";

export async function WritingPreview() {
  const posts = (await getPosts()).slice(0, 3);
  return (
    <Section
      id="writing"
      eyebrow="Writing"
      title="Notes"
      action={<Link href="/writing" className="text-sm text-fg-muted underline decoration-border underline-offset-4 hover:text-fg">All posts →</Link>}
    >
      <ul className="divide-y divide-border">
        {posts.map((post) => (
          <li key={post.slug} className="py-4">
            <Link href={`/writing/${post.slug}`} className="group flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <span className="font-serif text-xl tracking-tight text-fg group-hover:text-accent">{post.title}</span>
              <time dateTime={post.date} className="text-sm text-fg-subtle">{post.date}</time>
            </Link>
            <p className="mt-1 max-w-[68ch] text-sm text-fg-muted">{post.summary}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/mdx/mdx-content";
import { getPost, getPosts } from "@/lib/content/writing";
import { SITE } from "@/lib/site/config";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/writing/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.summary,
    openGraph: { type: "article", title: post.meta.title, description: post.meta.summary, publishedTime: post.meta.date },
    alternates: { canonical: `/writing/${slug}` },
  };
}

export default async function PostPage({ params }: PageProps<"/writing/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.meta.title,
    datePublished: post.meta.date,
    description: post.meta.summary,
    author: { "@type": "Person", name: SITE.name },
  };

  return (
    <article className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <Link href="/writing" className="text-sm text-fg-muted hover:text-fg">← Writing</Link>
      <header className="mt-6 max-w-[68ch]">
        <time dateTime={post.meta.date} className="text-sm text-fg-subtle">{post.meta.date}</time>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-fg sm:text-5xl">{post.meta.title}</h1>
        <p className="mt-4 text-lg text-fg-muted">{post.meta.summary}</p>
      </header>
      <div className="mt-10">
        <MdxContent source={post.content} />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </article>
  );
}

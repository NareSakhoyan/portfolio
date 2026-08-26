import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Newsreader } from "next/font/google";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { MarqueeBanner } from "@/components/site/marquee-banner";
import { Providers } from "@/components/site/providers";
import { SITE, siteUrl } from "@/lib/site/config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500"],
});
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description },
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  robots: { index: true, follow: true },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  jobTitle: SITE.role,
  description: SITE.description,
  email: `mailto:${SITE.email}`,
  url: siteUrl(),
  address: { "@type": "PostalAddress", addressLocality: "Yerevan", addressCountry: "AM" },
  sameAs: [SITE.github, SITE.linkedin],
  knowsAbout: [
    "LLM agent harnesses",
    "LLM evaluation",
    "RAG",
    "Tool use",
    "TypeScript",
    "Node.js",
    "Nest.js",
    "React",
    "Next.js",
    "PostgreSQL",
    "GraphQL",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${newsreader.variable} ${plexMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <MarqueeBanner />
        <Providers>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}

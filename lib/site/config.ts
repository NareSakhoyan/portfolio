export const SITE = {
  name: "Nare Sakhoyan",
  title: "Nare Sakhoyan — Senior Full-Stack Engineer",
  tagline:
    "I build full-stack products and the LLM features inside them — and I measure whether they actually work.",
  role: "Senior Full-Stack Engineer",
  location: "Yerevan, Armenia",
  availability: "Open to remote & contract · start immediately",
  email: "nare.sakhoyan@gmail.com",
  github: "https://github.com/NareSakhoyan",
  linkedin: "https://linkedin.com/in/naresakhoyan",
  cv: "/cv.pdf",
  sourceRepo: "REPLACE_ME_PORTFOLIO_REPO_URL",
  description:
    "Senior Full-Stack Engineer (TypeScript · Node/Nest.js · React/Next.js · PostgreSQL/MongoDB · GraphQL). ~6 years. Builds full-stack products and the LLM features inside them, and measures whether they work.",
} as const;

export function siteUrl(): string {
  const raw = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

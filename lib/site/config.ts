export const SITE = {
  name: "Nare Sakhoyan",
  title: "Nare Sakhoyan — AI Engineer",
  tagline:
    "Anyone can call a model. I build the harness around it — the part that decides whether it can be trusted.",
  role: "AI Engineer",
  positioning: "Product engineer who ships LLM systems into production",
  /** Short line for the hero/boot identity — keeps "Full-Stack" visible alongside the AI framing. */
  subtitle: "AI Engineer · Full-Stack — ships LLM systems into production",
  targetRoles: [
    "Applied AI Engineer",
    "Forward Deployed Engineer",
    "AI Infrastructure / Agent Platform Engineer",
    "AI Systems Engineer",
  ],
  location: "Yerevan, Armenia",
  availability: "Open to remote & contract · start immediately",
  email: "nare.sakhoyan@gmail.com",
  github: "https://github.com/NareSakhoyan",
  linkedin: "https://linkedin.com/in/naresakhoyan",
  cv: "/cv.pdf",
  sourceRepo: "REPLACE_ME_PORTFOLIO_REPO_URL",
  description:
    "Product engineer who ships LLM systems into production — agent harnesses, evals, RAG, tool use, multi-provider orchestration. Open to Applied AI, Forward Deployed, AI Infrastructure / Agent Platform, and AI Systems roles. Full-stack foundation: TypeScript, Node/Nest.js, React/Next.js, PostgreSQL.",
} as const;

export function siteUrl(): string {
  const raw = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

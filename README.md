# Portfolio — Nare Sakhoyan

Personal site of **Nare Sakhoyan**, Senior Full-Stack Engineer, with an embedded **Ask Nare** assistant: a streaming Claude tool-use chat that answers questions about my work from a published knowledge base — and proves it with an eval scorecard.

Built with Next.js 16 (App Router) · TypeScript strict · Tailwind v4 · MDX · `@anthropic-ai/sdk`.

| Home (light) | Home (dark) |
| --- | --- |
| ![Home, light theme](docs/screenshots/home-light.png) | ![Home, dark theme](docs/screenshots/home-dark.png) |

| Project page | Ask Nare |
| --- | --- |
| ![Project page](docs/screenshots/project-job-search-agent.png) | ![Ask Nare answering a question about Prostrive](docs/screenshots/chat-prostrive-mocked.png) |

> The chat screenshot was captured with `/api/ask` mocked (no API credit in the build environment); the text shown is the expected answer. Re-capture live with `E2E_REAL_API=1 npm run test:e2e`.

## Quick start

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Without an API key the whole site works; only the chat widget returns a friendly "not configured" message.

## Configuration

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables the chat widget and evals. |
| `SITE_URL` | Canonical URL for metadata, sitemap, RSS, OG image (set in production). |
| `ASK_MODEL` | Chat model. Default `claude-haiku-4-5-20251001`. |
| `ASK_JUDGE_MODEL` | Judge model for evals. Defaults to `ASK_MODEL`. |
| `VOYAGE_API_KEY` or `OPENAI_API_KEY` | Optional. Switches retrieval from BM25 to embeddings (`voyage-3-lite` / `text-embedding-3-small`). Re-run `npm run build:index` after changing. |
| `EMBEDDING_MODEL` | Optional embedding model override. |

Secrets are read server-side only; nothing sensitive reaches the client bundle.

## Commands

```bash
npm run dev          # dev server
npm run build        # production build (regenerates the Ask index first)
npm run check        # lint + typecheck + unit tests
npm run test:e2e     # Playwright smoke tests
npm run build:index  # rebuild data/ask-index.json from content/profile
npm run eval:ask     # run the eval suite; exits non-zero under the threshold
```

`eval:ask` flags: `--write` (publish results to `/evals`), `--threshold 0.9`, `--no-judge`, `--filter trap`.

## Editing content

Everything user-facing lives in `content/` — no code changes needed.

| What | Where |
| --- | --- |
| Project cards (links, stack, metrics) | `content/projects.json` — `REPLACE_ME` links render as "soon" pills |
| Project detail pages | `content/projects/<slug>.mdx` — ` ```mermaid ` fences become diagrams |
| Experience timeline | `content/experience.json` |
| Blog posts (RSS at `/feed.xml`) | `content/writing/<slug>.mdx` |
| Ask Nare knowledge base | `content/profile/*.md` — headings become citation sources; re-run `npm run build:index` |
| Eval cases | `content/evals/ask-nare.jsonl` |
| Name, links, tagline, availability | `lib/site/config.ts` |
| CV PDF | drop at `public/cv.pdf` |

## How Ask Nare works

1. **Index** — build time chunks `content/profile/*.md` by heading into `data/ask-index.json`; embeddings when a provider is configured, BM25 otherwise (and as runtime fallback).
2. **Agent** — `/api/ask` streams NDJSON from a manual Claude tool loop with three tools: `search_profile`, `get_project`, `get_availability`.
3. **Guardrails** — answers only from retrieved content with cited sources; says "I don't know"; refuses off-topic questions, salary talk, and degree speculation.
4. **Limits** — per-IP and global token buckets, 64 KB body cap enforced on the stream, 20 turns per session, capped output tokens. Latency and approximate cost shown under each answer.
5. **Evals** — `scripts/eval-ask.ts` runs every case through the real assistant, grades with deterministic checks plus an LLM judge, and publishes the scorecard at `/evals`.

## Deploy (Vercel)

```bash
vercel link
vercel env add ANTHROPIC_API_KEY production
vercel env add SITE_URL production   # e.g. https://nare.dev
vercel --prod
```

Zero config — the build regenerates the index automatically.

## Quality

- **Lighthouse** (production build, home page): desktop 100 / 100 / 100 / 100; mobile 96–97 perf, 100 elsewhere; CLS 0.
- **Accessibility**: WCAG AA contrast in both themes, semantic landmarks, skip link, keyboard-navigable chat with `aria-live`, visible focus, `prefers-reduced-motion` respected.
- **Tests**: 43 Vitest unit tests (retrieval, rate limiter, graders, stream protocol) and 4 Playwright smoke tests; CI runs lint, typecheck, unit, build, and e2e.
- **SEO**: OG image via `next/og`, sitemap, robots, JSON-LD `Person`/`BlogPosting`, RSS.

## Layout

```
app/          routes: / · projects/[slug] · writing[/slug] · evals · api/ask · feed.xml · sitemap · robots · og-image
components/   site chrome · home sections · ask widget · mdx + mermaid · motion
content/      profile (RAG source) · projects · writing · evals · projects.json · experience.json
lib/          ask (chunk, bm25, embeddings, retriever, tools, agent, limits) · content · eval · site
scripts/      build-index.ts · eval-ask.ts
tests/        unit (Vitest) · e2e (Playwright)
```

# Project: Ask Nare

## Summary
Ask Nare is the chat widget on Nare Sakhoyan's portfolio site. It answers questions about Nare's experience, projects, and availability using retrieval-augmented generation (RAG), tool use, and guardrails, and it publishes an evaluation scorecard.

## How it works
- Knowledge source: markdown files (CV facts, project READMEs, a facts file) chunked at build time. Embeddings are stored as JSON when an embedding provider is configured; otherwise BM25 keyword search is used so it works with only an Anthropic API key.
- Model: Claude Haiku 4.5 by default (overridable by environment variable), streaming responses.
- Tools exposed to the model: search_profile(query), get_project(slug), get_availability().
- Guardrails: answers only from retrieved content, cites the source section, says "I don't know" when the content does not cover the question, politely refuses off-topic requests, never states salary, never speculates about degree completion.
- Rate limiting: in-memory token bucket per IP, maximum 20 turns per session, capped output tokens.
- Each answer shows latency and approximate cost.
- Evaluation: scripts/eval-ask.ts runs a JSONL set of cases with deterministic checks plus an LLM judge and prints a scorecard; it fails under a threshold.

## Stack
Next.js App Router route handler, @anthropic-ai/sdk, TypeScript, Vitest for unit tests.

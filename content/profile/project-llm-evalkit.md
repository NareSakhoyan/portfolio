# Project: llm-evalkit

## Summary
llm-evalkit is a TypeScript evaluation harness that compares Claude Haiku, Sonnet, and Opus on résumé tailoring.

## Graders
- Schema grader: does the output validate against the expected JSON schema?
- Hallucination grader: does the tailored résumé invent facts not present in the source profile?
- Keyword-coverage grader: how many of the posting's required keywords are covered?
- LLM-judge grader: a model grades overall quality against a rubric.

## Output
A cost and latency report per model, plus per-grader pass rates. The report page and repository are linked from the project page. Numbers are placeholders until Nare fills them in.

## Stack
TypeScript, Anthropic SDK, Zod schemas, Vitest.

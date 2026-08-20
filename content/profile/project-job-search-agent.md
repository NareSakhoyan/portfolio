# Project: Job-search agent

## Summary
An autonomous pipeline that discovers job postings, scores how well each one fits Nare's profile, tailors a résumé per posting using Claude tool use, and fills application forms via browser automation.

## What it does
- Discovers postings from applicant-tracking systems such as Greenhouse, Lever, Ashby, and others.
- Scores each posting's fit against Nare's profile.
- Tailors a résumé per posting with Claude tool use (structured output, schema-validated).
- Fills application forms with browser automation.

## Stack
TypeScript monorepo (pnpm and turbo), Nest.js services, Next.js dashboard, PostgreSQL, Docker.

## Status
Repository and demo GIF are linked from the project page. Metrics (postings discovered, applications submitted, precision of fit scoring) are placeholders until Nare fills them in.

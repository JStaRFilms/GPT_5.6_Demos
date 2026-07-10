# Task 01 — Foundation and Ingestion

## Objective
Create the Next.js foundation and a deterministic build-time content pipeline.

## Scope
- Scaffold Next.js App Router, TypeScript, Tailwind, linting, and scripts without disturbing experiment folders.
- Define normalized project/transcript types.
- Scan Sol/Terra/Luna directories and infer model, order, title, slug, output, and Pi export.
- Support optional per-project `showcase.json` overrides.
- Copy demos to stable public paths.
- Decode Pi export payloads and emit sanitized transcript JSON.
- Strip system prompts, tool schemas, absolute local paths, and secret-like values.
- Emit a generated catalogue and a validation report.

## Definition of Done
- Existing content is represented in generated data.
- Incomplete folders do not break builds.
- Generated transcript files contain no `C:\\CreativeOS` path or system prompt block.
- Pipeline has focused automated tests.

## Expected Artifacts
- Application configuration and package files.
- `scripts/` ingestion and verification utilities.
- Typed generated catalogue/data contracts.
- Tests and validation output.

# Model Showcase — Master Plan

## Objective
Build a polished, static-first showcase for the Sol, Terra, and Luna model experiments. Every complete experiment should expose a sandboxed live preview, a safe Pi conversation view, project metadata, and model/prompt comparison where multiple models attempted the same concept.

## Product Direction
The site should feel like a curated computational exhibition rather than a generic dashboard: dark editorial surfaces, restrained model-specific accents, strong typography, generous whitespace, and a precise laboratory/archive vocabulary.

## Technical Direction
- Next.js App Router with TypeScript and static generation.
- No database and no runtime API dependency.
- A build-time ingestion script scans `Sol`, `Terra`, and `Luna`.
- Demo HTML is copied into stable public routes and loaded in sandboxed iframes.
- Pi session exports are decoded and sanitized into lazy-loaded static JSON.
- Metadata may be inferred from folders and overridden with optional `showcase.json` files.
- Vercel hosts the generated static application and assets.

## Delivery Stages
1. **Foundation:** Scaffold the application, define content types, and implement ingestion/sanitization.
2. **Experience:** Build gallery, model filtering, project detail, preview controls, transcript rendering, and comparisons.
3. **Hardening:** Add validation, responsive/accessibility behavior, deployment configuration, documentation, and verification.
4. **Review:** Audit correctness, privacy, security boundaries, and production build output.

## Definition of Done
- Existing complete projects are discovered automatically.
- Incomplete projects are represented safely or excluded with clear validation output.
- Raw local paths and system/tool-definition data are not exposed in public transcript JSON.
- Demos run in sandboxed frames with reload, full-screen, viewport controls, and separate-tab access.
- Sol/Terra/Luna filtering and Nitro League comparison work.
- Mobile layouts are usable.
- Type checking, linting, tests, and production build pass.
- README documents adding a project and deploying to Vercel.

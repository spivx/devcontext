# Agents Playbook

## Purpose of This Repo
- Provide a front-end experience for assembling tailored coding instruction files.
- Convert structured guidance stored in `data/*.json` into a multi-step wizard rendered from `components/instructions-wizard.tsx`.

## Core UI Flow
- Entry point at `app/page.tsx` toggles between a marketing hero and the instructions wizard.
- Wizard steps currently cover:
  - IDE selection (`data/ides.json`).
  - Framework selection (`data/frameworks.json`) with branching into framework-specific question sets (e.g., `data/questions/react.json`).
  - Dynamic question sets loaded via `import()` based on the chosen framework.
- User actions per question:
  - Select single or multiple answers (with skip support that records `null`).
  - Review hover tooltips with examples, pros/cons, tags, and documentation links.
  - Complete flow with a summary of answered vs skipped items.

## Data Conventions
- Every answer object may define: `value`, `label`, `icon`, `example`, `infoLines` (derived from `pros`/`cons`), `tags`, `isDefault`, `disabled`, `disabledLabel`, and `docs`.
- JSON files in `data/` supply domain-specific options:
  - `ides.json`, `frameworks.json`, `files.json`, `general.json`, `architecture.json`, `performance.json`, `security.json`, `commits.json`.
  - Framework-specific questionnaires live in `data/questions/<framework>.json`.
- Newly added `docs` fields should point to authoritative resources and are surfaced in tooltips as external links.

## Visual & Interaction Details (components/instructions-wizard.tsx)
- Uses Simple Icons (`simple-icons` package) to display brand icons; fallback initials render if no slug is available.
- Icon colors auto-lighten for dark mode readability (`getAccessibleIconColor`).
- Tooltips open on hovering the info icon only, remain interactive while moving the cursor, and expose external documentation via `ExternalLink` icon.
- Disabled choices include a "Soon" badge and are non-interactive.
- Progress tracking and completion summary show counts of answered questions.

## Extending the Wizard
1. Add new answer sets to relevant JSON files with `docs` links when possible.
2. For additional frameworks, create `data/questions/<framework>.json` and ensure the `docs` field on the framework entry is populated.
3. The wizard automatically consumes new questions when they follow the existing schema.

## Development Workflow
- Lint with `npm run lint` (already part of standard checks).
- When editing, maintain ASCII files, Tailwind utility classes, and ShadCN UI conventions.
- Tests are lint-only at present; consider adding React Testing Library coverage if the wizard logic expands.

## Notes for Agents
- Respect the "enabled" flag semantics: `false` means the option renders disabled with a "Soon" badge.
- When adding tooltip content, prefer concise prose and keep hover cards scannable.
- Keep documentation links trustworthy; avoid marketing splash pages when direct references exist.
- If adding new output formats, update both the data definition in `data/files.json` and any generation logic (currently beyond this repo).
- When page-level components need reusable calculations or datasets, extract those helpers into `lib/utils.ts` and import them instead of defining inline.
- For complex UI blocks reused across the wizard, lift them into dedicated components (e.g., `components/instructions-answer-card.tsx`) and consume them in the wizard instead of duplicating markup.

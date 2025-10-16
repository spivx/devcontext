![devcontext logo](public/logo.png)

Repo-aware AI coding guidelines assistant. Wizard or Repo Scan — your context, ready.

## What DevContext does
- Generates AI‑ready files for your project: Copilot instructions, Cursor rules, and agent guidance.
- Works two ways: start from scratch with a guided wizard or scan a public GitHub repository to prefill answers.
- Surfaces examples, trade‑offs, tags, and authoritative docs so choices are transparent and revisitable.

## Two ways to use
- New Project (Wizard)
  - Start from curated stacks or go fully custom.
  - Answer focused questions (general, architecture, performance, security, commits, etc.).
  - Apply smart defaults when unsure; you can edit everything later.
- Existing Project (Repo Scan)
  - Paste an `owner/repo` or full URL. DevContext detects languages, frameworks, tooling, tests, and conventions.
  - The wizard is prefilled with detected signals; you only confirm or fill gaps.

See the Scan → Wizard pipeline in docs/scan-flow.md.

## What repo scan detects
- Languages and frameworks (e.g., Next.js, React, Vue, Python)
- Tooling and testing (ESLint, Prettier, TypeScript; Jest, Vitest, Playwright, Cypress, pytest)
- Structure (src/, components/, tests/, monorepo/workspaces) and package manager
- Routing, styling, state management, data fetching
- Auth, validation, logging, CI/CD, code quality tools
- Editor and naming conventions; commit message style

The detected summary is converted into wizard answers and ultimately into tailored instruction files.

## Outputs
- `copilot-instructions.md` (from `file-templates/copilot-instructions-template.md`)
- `agents.md` (from `file-templates/agents-template.md`)
- `.cursor/rules` (from `file-templates/cursor-rules-template.json`)

Templates are mapped via `lib/template-config.ts` and populated by `lib/template-render.ts`.

## Run locally
```bash
git clone https://github.com/spivx/devcontext.git
cd devcontext
npm install

# Set your GitHub token for repo scans (required)
cp .env.local.example .env.local  # if present, otherwise create it
echo "GITHUB_TOKEN=YOUR_TOKEN_HERE" >> .env.local

npm run dev
```
Open the printed local URL. On the landing page you can:
- Launch the wizard (Start from stacks or custom)
- Scan a public GitHub repo (prefills the wizard)

Notes:
- Scanning requires a GitHub personal access token (`GITHUB_TOKEN`) to avoid low rate limits.
- Only public repositories are supported.

## Testing
- Unit tests (Vitest): `npm run test`
- E2E tests (Playwright): `npm run test:e2e`
- Validate question IDs: `npm run validate:ids`

## Community knowledge base
- All selectable answers are defined in `data/*.json` and stack‑specific files under `data/questions/<stack>.json`.
- Each answer can include `value`, `label`, `icon`, `example`, `infoLines` (from pros/cons), `tags`, `isDefault`, `disabled`, `disabledLabel`, and `docs`.
- Disabled choices show as “Soon” and are non‑interactive.
- Icons come from `simple-icons` and auto‑adjust for dark mode readability.

## Key interaction details
- Tooltips open from the info icon and remain interactive, with External Link icons to docs.
- You can apply recommended defaults per question to keep momentum.
- A completion summary highlights answered items and remaining gaps.

## Contributing
- Add new stacks by updating `data/stacks.json`, adding `data/questions/<stack>.json`, and (optionally) `conventions/<stack>.json`.
- When adding logic: move shared TypeScript types into `types/` (e.g., `types/wizard.ts`).
- Extract reusable effect logic into hooks under `hooks/` and reuse across components.
- Keep PRs focused; include docs or examples where helpful.

## License
MIT — see `LICENSE`.

# DevContext Scan → Wizard Flow

This document outlines how repository scans are transformed into AI instruction defaults inside DevContext. It covers the major touchpoints so you can extend or debug the pipeline with confidence.

## High-Level Sequence

1. **Scan the repository** (`app/api/scan-repo/route.ts`)
   - Detect languages, frameworks, tooling, structure hints, and enriched metadata.
   - Use stack conventions (`collectConventionValues`) to cross-check detection lists (e.g., testing tools) so any signal we add in `conventions/<stack>.json` becomes discoverable with minimal code changes.
   - Reuse convention values to expand stack-specific heuristics (e.g., Python’s Behave directories, Next.js routing shapes), so each conventions file remains the source of truth for new detections.
   - Infer the primary stack using `inferStackFromScan`.
   - Load stack conventions (`loadStackConventions`) to determine which structure hints matter and whether stack-specific rules exist.
   - Attach `summary.conventions` so the UI knows which directories to highlight and whether a conventions file was found.

2. **Build wizard defaults** (`lib/scan-to-wizard.ts`)
   - Start with an empty `WizardResponses` object.
   - Apply convention defaults from `conventions/<stack>.json` + `default.json`.
   - Layer in detections from the scan (tooling, testing, naming signals, etc.), matching scan values against convention-provided options so stack JSON remains the single source of truth.
   - Run convention rules to tweak values based on detected tooling/testing.
   - Pull default answers directly from the stack’s question set (`buildStepsForStack`) and fill any remaining empty responses. We track which questions were auto-defaulted (`defaultedQuestionIds`) so the summary can explain why.

3. **Persist and surface responses**
   - `lib/scan-prefill.ts` merges the generated responses into local wizard state and stores both `autoFilledMap` and `defaultedMap` in localStorage.
   - The instructions wizard and stack summary pages read these maps to highlight that values came from a scan or from default recommendations.
   - `components/wizard-completion-summary.tsx` displays a “Default applied” badge for any question filled solely by defaults.

4. **Generate instruction files**
   - From the repo-scan UI, clicking “Generate” calls `lib/scan-generate.ts`, which posts to `/api/scan-generate/[fileId]`.
   - The API reuses `buildResponsesFromScan` server-side to ensure consistency, then renders the target template with `renderTemplate`.
   - Template rendering pulls `applyToGlob` from conventions so Copilot instructions target stack-appropriate file globs (e.g. `**/*.{py,pyi,md}` for Python).

## Key Data Sources

| Location | Purpose |
| --- | --- |
| `conventions/default.json` & `/conventions/<stack>.json` | Declarative defaults + rules for each stack (tooling choices, structure hints, apply-to glob, etc.). |
| `lib/convention-values.ts` | Helpers that normalize and aggregate convention values (e.g., testingUT/testingE2E) for both the scanner and the wizard. |
| `data/stacks.json` | List of stacks exposed to the wizard; each should have a matching conventions file. |
| `data/questions/<stack>.json` | Stack-specific questions with default answers and metadata. These defaults are now honored automatically when scan data is missing. |

## Extending the Flow

- **Add a new stack**: create `conventions/<stack>.json`, add questions under `data/questions/<stack>.json`, and register the stack in `data/stacks.json`. The pipeline will pick it up automatically.
- **Add scan heuristics**: update `app/api/scan-repo/route.ts` (e.g., detect tooling/testing) so conventions rules have richer signals to work with. Shared helpers mean you can usually expand detection by tweaking the convention file plus a small matcher (see `detectPythonTestingSignals` for the current pattern).
- **Adjust defaults**: edit the stack’s question JSON to set a new `isDefault` answer; the scan pipeline will adopt it whenever the repo lacks an explicit signal.
- **Customize templates**: templates consume the final `WizardResponses`, so any new fields surfaced via conventions should be represented there before referencing them in markdown/JSON output.

## Notable Behaviors

- If a stack lacks a conventions file, the repo-scan page shows a call-to-action to add one. Structure hints fall back to the global defaults.
- The completion summary distinguishes between values detected from the scan (`isAutoFilled`) and those populated strictly because a question has a default (`isDefaultApplied`).
- The `/api/scan-generate` endpoint keeps the server-side and client-side generation logic aligned, preventing divergence between UI previews and API output.

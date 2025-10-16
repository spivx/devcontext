# Repository Scan Process

This document explains how DevContext scans a GitHub repository and turns signals into stack detection, conventions, and instruction file generation. Use it as a reference when extending detection or debugging results.

## High‑Level Flow

1. Fetch repository metadata (default branch, languages).
2. Fetch repository tree and collect file paths.
3. Read key manifests (e.g., `package.json`) and detect tooling/testing/framework hints.
4. Run dependency/packages analyzer driven by `data/stacks.json` to identify frameworks from dependency files (e.g., FastAPI, Django, Spring Boot).
5. Merge signals and build a `RepoScanSummary` with languages, frameworks, tooling, testing, structure, and warnings.
6. Infer the stack (`inferStackFromScan`). Unsupported stacks are marked as such (no React fallback).
7. Build wizard responses from the scan and conventions, then generate instruction files via templates.

## Inputs and Outputs

- Input: GitHub repo URL (`owner/repo`).
- Output: `RepoScanSummary` JSON (used by the UI and generator) and optional rendered instruction files (Copilot/Cursor/Agents).

## Key Stages and Files

- API route and scan pipeline: `app/api/scan-repo/route.ts`
  - Parse repo URL, fetch repo and language data from GitHub.
  - Fetch tree (`git/trees?recursive=1`) and build a list of paths.
  - Optionally read `package.json` (for Node projects).
  - Detect base tooling/testing/frameworks from filenames and dependencies (`detectTooling`).
  - Evaluate dependency/package analyzer tasks (see below) to detect frameworks from dependency files.
  - Detect enriched signals (package manager, router, styling, CI, naming, etc.).
    - File naming is inferred from the repository tree; variable naming samples up to 20 representative code files (JS/TS/Python) to classify the dominant identifier style.
  - Merge and return `RepoScanSummary` with warnings.

- Stack inference and response building: `lib/scan-to-wizard.ts`
  - `inferStackFromScan` maps frameworks/languages to a supported stack or `unsupported`.
  - Builds wizard responses by applying detected values and stack defaults.
  - Applies conventions (`lib/conventions.ts`) to fine‑tune defaults based on scan signals.

- Template rendering: `app/api/scan-generate/[fileId]/route.ts` and `lib/template-render.ts`
  - Renders chosen instruction file using templates and filled responses.

## Dependency / Packages Analyzer

This is a declarative system that reads dependency files per stack to refine framework detection.

- Configuration source: `data/stacks.json`
  - Each stack answer can include a `detection.dependencyFiles` section listing patterns and signals.
  - Example (Python): detect `fastapi`, `django`, `flask` inside `pyproject.toml`, `poetry.lock`, `requirements*.txt`.
  - Example (Java): detect `org.springframework.boot` inside `pom.xml`, `build.gradle(.kts)`.

- Types: `types/stack-detection.ts`
  - Describes dependency files and signals (substring matches, JSON dependency checks, and side effects like setting primary language).

- Compiler: `lib/stack-detection.ts`
  - Compiles patterns to regex and produces analysis tasks for matching repo paths.

- Evaluation: `app/api/scan-repo/route.ts`
  - `buildDependencyAnalysisTasks(paths)` builds work from repo file list.
  - For each task, the route reads file content from GitHub and applies configured signals.
  - Merges detected frameworks/languages and may override the primary language when strong signals are found.

## Unsupported Stacks

- If no known framework is detected and the language isn’t explicitly supported, the stack is set to `unsupported`.
- The UI shows a “Not yet supported” notice and disables generation for that repo (prevents React‑centric output in non‑JS repos).

## Extending Detection

- Add or refine signals in `data/stacks.json` under the relevant stack answer’s `detection` field.
  - Add new `patterns` for dependency files.
  - Add `signals` with `match` values and side effects (`addFrameworks`, `addLanguages`, `setPrimaryLanguage`).
- If you add a new supported stack, also create:
  - `data/questions/<stack>.json` (wizard questions/defaults)
  - `conventions/<stack>.json` (defaults and rules)
  - Optional template guidance in `lib/stack-guidance.ts`.

## Field Reference (RepoScanSummary)

- `language`: Primary language (may be overridden by dependency signals).
- `languages`: All detected languages.
- `frameworks`: Detected frameworks (from dependencies and tooling).
- `tooling`: Detected build and quality tooling.
- `testing`: Detected testing frameworks.
- `structure`: Presence of `src/`, `tests/`, `components/`, `apps/`, `packages/`.
- `fileNamingStyle`: Primary file naming pattern detected from filenames (`kebab-case`, `snake_case`, etc.).
- `variableNamingStyle`: Dominant identifier casing inferred from sampled source files.
- `warnings`: Scanner warnings (e.g., truncated tree, low API rate limit).
- `conventions`: Stack label, support flag, and structure-relevant keys.

## Related Docs

- `docs/scan-flow.md`: end‑to‑end wizard flow and how scan results become defaults.

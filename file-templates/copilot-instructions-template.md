---
# Configuration for Copilot in this project
applyTo: "**/*.{ts,tsx,js,jsx,md}"  # apply to all code files by default
---

# Project Overview  
These are the conventions and guardrails Copilot should follow when generating code, tests, commits, and PRs in our project.  
They reflect the decisions we made (IDE, framework, language) and real-world best practices.

---

## 1. Project Context & Priorities

- IDE: **{{preferredIde}}**  
- Framework: **{{frameworkSelection}}**  
- Build tooling: **{{tooling}}**  
- Language: **{{language}}**  

- Primary focus: **{{projectPriority}}**

> Use this context — when Copilot needs to choose between simpler vs. more optimized code, prefer what aligns with **{{projectPriority}}**.

---

## 2. Naming, Style & Structure Rules

### Naming & Exports

- Variables, functions, object keys: **{{variableNaming}}**  
- Files & modules: **{{fileNaming}}**  
- Components, types: **{{componentNaming}}**  
- Always use **{{exports}}** exports style  
- Comments & documentation style: **{{comments}}**  
- Code style: follow **{{codeStyle}}**  

### File and Folder Structure

- Component / UI layout organization: **{{fileStructure}}**  
- Styling approach: **{{styling}}**  
- State management: adopt **{{stateManagement}}**  
- API layer organization: put remote calls in **{{apiLayer}}**  
- Folder strategy: **{{folders}}**  

> Copilot should not generate code outside these structures or naming patterns.

---

## 3. Testing & Quality Assurance

- Unit tests: **{{testingUT}}**  
- E2E / integration: **{{testingE2E}}**  

**Rules**  
- Use descriptive test names.  
- Always include both “happy path” and edge cases.  
- Avoid large tests that span too many modules.  
- Tests should live alongside modules (or in designated `__tests__` folder per convention).

---

## 4. Performance & Data Loading

- Data fetching approach: **{{dataFetching}}**  
- React performance optimizations: **{{reactPerf}}**  

**Do**  
- Use pagination or limit responses.  
- Memoize computations or components when data is large.  
- Lazy-load modules/components that aren’t critical at startup.

**Don’t**  
- Fetch all data at once without constraints.  
- Place heavy logic in render without memoization.

---

## 5. Security, Validation, Logging

- Secrets / auth handling: **{{auth}}**  
- Input validation: **{{validation}}**  
- Logging style: **{{logging}}**

**Rules**  
- Never embed secrets in code; always use environment variables.  
- Validate all incoming data (API or client side) using the chosen validation library.  
- Logging messages should never reveal secrets or PII.  
- Use structured or contextual logs (vs. free-form `console.log`) especially in production.

---

## 6. Commit & PR Conventions

- Commit message style: **{{commitStyle}}**  
- PR rules: **{{prRules}}**

**Do**  
- Write commit messages that follow the agreed style (e.g. `feat: add login`)  
- Keep PRs small and focused  
- Always link the issue or ticket  
- If PR introduces new API or breaking change, update the documentation

**Don’t**  
- Use vague commit messages like “fix stuff”  
- Combine unrelated changes in one commit or PR

---

## 7. Copilot Usage Guidance

- Use Copilot to scaffold boilerplate (e.g. `useQuery`, component boilerplate), not to bypass core logic.  
- When writing prompts/comments for Copilot, embed **context** (e.g. expected return shape, types).  
- When Copilot suggests code that violates naming, structure, or validation rules – override or reject it.  
- For ambiguous design choices, ask for clarification in comments (e.g. “// Should this go in services or hooks?”).  
- Prefer completions that respect folder boundaries and import paths (don’t let Copilot propose imports from “wrong” layers).

---

## 8. IDE-Specific Rules & Settings

For **VS Code**:

- Use `.editorconfig` for consistent indent / line endings  
- Enable **Prettier** and **ESLint**, synced to our style rules  
- Set `editor.formatOnSave = true`  
- Suggested extensions: `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`, `formulahendry.auto-rename-tag`  
- Avoid conflicting formatters or duplicated rules  

> These help Copilot suggestions align more closely with how your code will be formatted and linted.

---

## 9. Caveats & Overrides

- If a feature is experimental or out-of-scope, document it in comments.  
- In rare cases, exceptions may be allowed — but always document why.  
- Always run linters and tests on generated code before merging.

---

## Notes

- This instructions file was **auto-generated** based on your chosen configuration.  
- Regenerate it whenever your JSON configuration changes (framework, naming, testing, etc.).  
- You may also split this file into domain-specific `.instructions.md` files using `applyTo` frontmatter if your project grows.


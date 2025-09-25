---
# Configuration for Copilot in this project
applyTo: "**/*.{ts,tsx,js,jsx,md}"  # apply to all code files by default
---

# Copilot Instructions

⚠️ This file is **auto-generated**. Do not edit manually unless overriding defaults.  
Regenerate whenever your JSON configuration changes (framework, naming, testing, etc.).

---

## 1. Project Context & Priorities

- Framework: **{{frameworkSelection}}**  
- Build tooling: **{{tooling}}**  
- Language: **{{language}}**  

- Primary focus: **{{projectPriority}}**

> Use this context when Copilot suggests alternatives: prefer what aligns with **{{projectPriority}}**.

---

## 2. Naming, Style & Structure Rules

### Naming & Exports
- Variables, functions, object keys: **{{variableNaming}}**  
- Files & modules: **{{fileNaming}}**  
- Components & types: **{{componentNaming}}**  
- Always use **{{exports}}** export style  
- Comments/documentation style: **{{comments}}**  
- Code style: follow **{{codeStyle}}**  

### File and Folder Structure
- Component / UI layout: **{{fileStructure}}**  
- Styling approach: **{{styling}}**  
- State management: **{{stateManagement}}**  
- API layer organization: **{{apiLayer}}**  
- Folder strategy: **{{folders}}**

> Copilot should not generate code outside these structures or naming patterns.

---

## 3. Testing & Quality Assurance

- Unit tests: **{{testingUT}}**  
- E2E / integration: **{{testingE2E}}**

**Rules**
- Use descriptive test names.  
- Cover both “happy path” and edge cases.  
- Keep tests focused and avoid spanning unrelated modules.  
- Place tests alongside modules or in designated `__tests__` folders.  

---

## 4. Performance & Data Loading

- Data fetching: **{{dataFetching}}**  
- React performance optimizations: **{{reactPerf}}**

**Do**
- Use pagination or limit queries.  
- Memoize expensive computations.  
- Lazy-load non-critical modules.  

**Don’t**
- Fetch all data at once.  
- Put heavy logic in render without memoization.  

---

## 5. Security, Validation, Logging

- Secrets/auth handling: **{{auth}}**  
- Input validation: **{{validation}}**  
- Logging: **{{logging}}**

**Rules**
- Never commit secrets; use environment variables.  
- Validate all incoming data (API and client).  
- Do not log secrets or PII.  
- Use structured/contextual logs instead of raw `console.log`.  

---

## 6. Commit & PR Conventions

- Commit style: **{{commitStyle}}**  
- PR rules: **{{prRules}}**

**Do**
- Follow commit style (`feat: add login`, `fix: correct bug`).  
- Keep PRs small and focused.  
- Link issues/tickets.  
- Update docs for new APIs or breaking changes.  

**Don’t**
- Use vague commit messages like “fix stuff”.  
- Bundle unrelated changes.  

---

## 7. Copilot Usage Guidance

- Use Copilot for boilerplate (hooks, component scaffolds).  
- Provide context in comments/prompts.  
- Reject completions that break naming, structure, or validation rules.  
- Ask clarifying questions in comments (e.g., “// Should this live in services?”).  
- Prefer completions that respect folder boundaries and import paths.  

**Don’t rely on Copilot for**
- Security-critical code (auth, encryption).  
- Inferring business logic without requirements.  
- Blindly accepting untyped/unsafe code.  

---

## 8. Editor Setup

Recommended editor configuration:

- Use `.editorconfig` for indentation/line endings.  
- Enable linting/formatting (ESLint, Prettier, or Biome).  
- Set `editor.formatOnSave = true`.  
- Suggested integrations:
  - VS Code: `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`  
  - JetBrains: ESLint + Prettier plugins  
  - Cursor: use built-in `.instructions.md` support  

---

## 9. Caveats & Overrides

- Document exceptions with comments.  
- Experimental features must be flagged.  
- Always run linters and tests before merging Copilot-generated code.  

---

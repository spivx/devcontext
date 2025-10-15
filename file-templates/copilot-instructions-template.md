---
# Configuration for Copilot in this project
applyTo: "{{applyToGlob}}"  # apply to relevant code files by default
---

# Copilot Instructions

⚠️ This file is **auto-generated**. Do not edit manually unless overriding defaults.  
Regenerate whenever your JSON configuration changes (stack, naming, testing, etc.).

---

## 1. Project Context & Priorities

- Stack: **{{stackSelection}}**  
- Build tooling: **{{tooling}}**  
- Language: **{{language}}**  

- Primary focus: **{{projectPriority}}**

> Use this context when Copilot suggests alternatives: prefer what aligns with **{{projectPriority}}**.

---

## 2. Stack Playbook

{{stackGuidance}}

---

## 3. Naming, Style & Structure Rules

### Naming & Exports
- Variables, functions, object keys: **{{variableNaming}}**  
- Files & modules: **{{fileNaming}}**  
- Components & types: **{{componentNaming}}**  
- Always use **{{exports}}** export style  
- Comments/documentation style: **{{comments}}**  
- Code style: follow **{{codeStyle}}**  

### File and Folder Structure
- Module / feature layout: **{{fileStructure}}**  
- Styling approach (if applicable): **{{styling}}**  
- State management / shared context: **{{stateManagement}}**  
- API / service layer organization: **{{apiLayer}}**  
- Folder strategy: **{{folders}}**


> Copilot should not generate code outside these structures or naming patterns.

---

## 4. Testing & Quality Assurance

- Unit tests: **{{testingUT}}**  
- E2E / integration: **{{testingE2E}}**

**Rules**
- Use descriptive test names.  
- Cover both “happy path” and edge cases.  
- Keep tests focused and avoid spanning unrelated modules.  
- Place tests alongside modules or in designated `__tests__` folders.  

---

## 5. Performance & Data Handling

- Data fetching: **{{dataFetching}}**  
- Performance focus: **{{reactPerf}}**

**Do**
- Use pagination or streaming for large datasets.  
- Cache or memoize expensive work when it matters.  
- Offload non-critical processing to background tasks.  

**Don’t**
- Load entire datasets eagerly without need.  
- Block hot execution paths with heavy synchronous work.  
- Skip instrumentation that would surface performance regressions.  

---

## 6. Security, Validation, Logging

- Secrets/auth handling: **{{auth}}**  
- Input validation: **{{validation}}**  
- Logging: **{{logging}}**

**Rules**
- Never commit secrets; use environment variables.  
- Validate all incoming data (API and client).  
- Do not log secrets or PII.  
- Use structured/contextual logs instead of raw print/log statements.  

---

## 7. Commit & PR Conventions

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

## 8. Copilot Usage Guidance

- Use Copilot for boilerplate (e.g., scaffolds, repetitive wiring).  
- Provide context in comments/prompts.  
- Reject completions that break naming, structure, or validation rules.  
- Ask clarifying questions in comments (e.g., “# Should this live in services?”).  
- Prefer completions that respect folder boundaries and import paths.  

**Don’t rely on Copilot for**
- Security-critical code (auth, encryption).  
- Inferring business logic without requirements.  
- Blindly accepting untyped/unsafe code.  

---

## 9. Editor Setup

Recommended editor configuration:

- Use `.editorconfig` for indentation/line endings.  
- Enable linting/formatting (ESLint, Prettier, Ruff, Black, etc.).  
- Set `editor.formatOnSave = true`.  
- Suggested integrations:
  - VS Code: `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`  
  - JetBrains: ESLint + Prettier plugins  
  - Cursor: use built-in `.instructions.md` support  

---

## 10. Caveats & Overrides

- Document exceptions with comments.  
- Experimental features must be flagged.  
- Always run linters and tests before merging Copilot-generated code.  

---

--- FILE: .cursor/rules/tech-stack.mdc ---
---
description: Application core tech stack and framework guidance
globs: ["**/*"]
alwaysApply: true
---

# Tech Stack: {{stackSelection}}

- **Language**: {{language}}
- **Framework**: {{stackSelection}}
- **Tooling**: {{tooling}}

## Core Guidance
{{stackGuidance}}

--- FILE: .cursor/rules/naming.mdc ---
---
description: Naming conventions for variables, files, and components
globs: ["**/*.{ts,tsx,js,jsx,py,go,rs}"]
alwaysApply: false
---

# Naming Conventions

- **Variables & Functions**: {{variableNaming}}
- **Files & Modules**: {{fileNaming}}
- **Components & Types**: {{componentNaming}}
- **Exports**: {{exports}}

--- FILE: .cursor/rules/testing.mdc ---
---
description: Testing strategy and quality assurance
globs: ["**/*.test.{ts,tsx,js,jsx}", "**/*_test.go", "**/test_*.py", "**/__tests__/**/*"]
alwaysApply: false
---

# Testing Strategy

- **Unit Testing**: {{testingUT}}
- **E2E Testing**: {{testingE2E}}

## Requirements
- Use descriptive test names.
- Cover both success and failure cases.
- Place tests in appropriate directories based on project structure.

--- FILE: .cursor/rules/security.mdc ---
---
description: Security, validation, and logging rules
globs: ["**/*"]
alwaysApply: false
---

# Security & Quality

- **Auth & Secrets**: {{auth}}
- **Validation**: {{validation}}
- **Logging**: {{logging}}

## Rules
- Never commit secrets to version control.
- Validate all external data inputs.
- Use structured logging; avoid logging sensitive information.

--- FILE: .cursor/rules/collaboration.mdc ---
---
description: Commit messages and PR conventions
globs: [".git/**/*", "**/*"]
alwaysApply: false
---

# Collaboration

- **Commit Style**: {{commitStyle}}
- **PR Rules**: {{prRules}}
- **Collaboration Style**: {{collaboration}}

Follow project-specific conventions for small, focused changes.

---
name: Design System Tokens
description: Manage and explain design tokens (colors, spacing, typography).
dependencies: ""
---

## Concept
Use semantic names (what it is used for) over primitive names (what it looks like).

## Format (CSS Variables)
\`\`\`css
:root {
  /* Primitive */
  --blue-500: #3b82f6;
  
  /* Semantic */
  --color-primary: var(--blue-500);
  --color-text-body: #1f2937;
  --spacing-unit: 4px;
  --spacing-md: calc(var(--spacing-unit) * 4); /* 16px */
}
\`\`\`

## Usage
- Don't use hex codes in components.
- Use \`var(--color-primary)\`.

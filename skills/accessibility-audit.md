---
name: Accessibility (a11y) Check
description: Review code for WCAG accessibility compliance.
dependencies: ""
---

## Guidelines
- Ensure all images have \`alt\` text.
- Verify color contrast (minimum 4.5:1 for text).
- Check heading hierarchy (h1 -> h2 -> h3).
- Verify interactive elements have aria-labels if no text.
- Ensure keyboard navigability.

## Checklist
- [ ] Images have descriptive alt text?
- [ ] Forms have labels connected to inputs?
- [ ] Buttons are reachable by Tab key?
- [ ] Focus states are visible?
- [ ] Semantic HTML is used (nav, main, footer)?

## Example Issues
User: check this snippet
Assistant:
1. \`<div onclick="...">\` should be a \`<button>\` for keyboard access.
2. \`<img>\` is missing \`alt\` tag.

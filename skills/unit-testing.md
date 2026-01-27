---
name: Unit Testing
description: Generate robust unit tests for your code.
dependencies: "jest, vitest, @testing-library/react"
---

## Guidelines
- Test behavior, not implementation details.
- Use descriptive test names ("should do X when Y").
- Arrange, Act, Assert pattern.
- Mock external dependencies.

## Checklist
- [ ] Happy path tested?
- [ ] Error states tested?
- [ ] Edge cases (empty arrays, nulls) tested?

## Example
\`\`\`ts
describe("calculator", () => {
    it("should add two numbers correctly", () => {
        expect(add(1, 2)).toBe(3)
    })
})
\`\`\`

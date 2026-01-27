export interface SkillTemplate {
    id: string
    name: string
    description: string
    skillData: {
        name: string
        description: string
        dependencies: string
        content: string
    }
}

export const skillTemplates: SkillTemplate[] = [
    {
        id: "code-style",
        name: "Code Style Enforcer",
        description: "Standardize code style and formatting rules for consistency.",
        skillData: {
            name: "Code Style",
            description: "Enforce project-specific coding standards and best practices.",
            dependencies: "",
            content: `## Principles
- Clarity over cleverness
- Consistent naming conventions
- Early returns for guard clauses

## Naming Conventions
- specific_variable_names (snake_case for Python)
- camelCaseVariableNames (camelCase for JS/TS)
- PascalCaseComponentNames (PascalCase for React components)

## Examples
User: How should I name this variable?
Assistant: Since this is a boolean flag in TypeScript, use \`is\` or \`has\` prefix, e.g., \`isValidUser\` or \`hasPermission\`.`
        }
    },
    {
        id: "documentation",
        name: "Docstring Generator",
        description: "Generate comprehensive documentation for functions and classes.",
        skillData: {
            name: "Documentation Generator",
            description: "Generate JSDoc/Docstring for code automatically.",
            dependencies: "",
            content: `## Goal
Produce high-quality documentation comments for all exported functions and classes.

## Format
For TypeScript/JavaScript, use JSDoc:
/**
 * Short description.
 *
 * @param {Type} name - Description
 * @returns {Type} Description
 */

## Examples
User: Document this function
Assistant:
/**
 * Calculates the total sum of an array of numbers.
 *
 * @param {number[]} numbers - The list of numbers to sum.
 * @returns {number} The total sum.
 */
function sum(numbers: number[]): number { ... }`
        }
    },
    {
        id: "react-component",
        name: "React Component",
        description: "Scaffold a new React component with best practices.",
        skillData: {
            name: "React Component Generator",
            description: "Create modern, accessible, and typed React components.",
            dependencies: "react, lucide-react, clsx, tailwind-merge",
            content: `## Structure
- Use functional components with named exports.
- Use explicit return types.
- Destructure props.
- Use 'cn' utility for class merging.

## Template
\`\`\`tsx
import { cn } from "@/lib/utils"

interface MyComponentProps {
    className?: string
    children?: React.ReactNode
}

export function MyComponent({ className, children }: MyComponentProps) {
    return (
        <div className={cn("base-styles", className)}>
            {children}
        </div>
    )
}
\`\`\``
        }
    },
    {
        id: "unit-testing",
        name: "Unit Testing",
        description: "Generate robust unit tests for your code.",
        skillData: {
            name: "Test Generator",
            description: "Create comprehensive unit tests covering edge cases.",
            dependencies: "jest, vitest, @testing-library/react",
            content: `## Guidelines
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
\`\`\``
        }
    }
]

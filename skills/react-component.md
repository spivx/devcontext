---
name: React Component
description: Scaffold a new React component with best practices.
dependencies: "react, lucide-react, clsx, tailwind-merge"
---

## Structure
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
\`\`\`

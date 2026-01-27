---
name: TSConfig Generator
description: Create or update tsconfig.json for different environments.
dependencies: "typescript"
---

## Options
- \`target\`: JS version output.
- \`module\`: Module system (ESNext, CommonJS).
- \`strict\`: Enable strict type checking.
- \`lib\`: Library files (DOM, ES2020).

## Template (Strict Next.js)
\`\`\`json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
\`\`\`

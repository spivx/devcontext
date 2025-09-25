
When adding props to a component, always place the props interface at the top of the component file, above the component definition.

Development Workflow:
- Always move TypeScript types and interfaces to a dedicated file (e.g., `types/wizard.ts`) instead of declaring them inside components.
- When you identify reusable effect logic, wrap it in a custom hook under `hooks/` (e.g., `use-window-click-dismiss.ts`) and consume that hook rather than repeating `useEffect` blocks.

const asMarkdownList = (lines: string[]) => lines.map((line) => `- ${line}`).join("\n")

const stackGuidanceBySlug: Record<string, string> = {
  default: asMarkdownList([
    "Document your preferred architecture and reference this file before accepting AI suggestions.",
    "Highlight coding patterns that save review time for your team.",
    "Call out testing expectations so automated output stays production-ready.",
  ]),
  react: asMarkdownList([
    "Prefer modern function components with Hooks; avoid new class components.",
    "Use React Testing Library + Jest for unit coverage when possible.",
    "Reach for Context or dedicated state libraries instead of prop drilling complex data.",
  ]),
  nextjs: asMarkdownList([
    "Clarify if routes belong in the App Router and whether they run on the server or client.",
    "Use built-in data fetching helpers (Server Components, Route Handlers, Server Actions) before custom fetch logic.",
    "Keep shared UI and server utilities in clearly named directories to support bundler boundaries.",
  ]),
  angular: asMarkdownList([
    "Favor standalone components and provide module guidance if legacy NgModules remain.",
    "Leverage Angular's dependency injection and RxJS patterns rather than ad-hoc state management.",
    "Keep schematics and CLI commands documented for generating new features consistently.",
  ]),
  vue: asMarkdownList([
    "Specify when to use the Composition API versus Options API within new components.",
    "Pinia should be the default store unless a legacy Vuex module is explicitly required.",
    "Encourage single-file components with script/setup for new work unless otherwise noted.",
  ]),
  nuxt: asMarkdownList([
    "Indicate default rendering mode (SSR, SSG, ISR) and when to override it per route.",
    "Rely on `useFetch` and server routes before introducing ad-hoc API clients.",
    "Document deployment adapters (Vercel, Netlify, Node) so build output matches hosting.",
  ]),
  svelte: asMarkdownList([
    "Prefer SvelteKit for routing and server endpoints unless a standalone widget is needed.",
    "Use stores for shared state and highlight when external libraries such as Zustand are acceptable.",
    "Note styling defaults (scoped styles, Tailwind, Vanilla Extract) to keep components consistent.",
  ]),
  astro: asMarkdownList([
    "Clarify which framework powers interactive islands (React, Vue, Svelte).",
    "State the default rendering strategy (SSG, SSR, ISR) and when to opt into alternatives.",
    "Document where content collections live and how frontmatter schema is enforced.",
  ]),
  remix: asMarkdownList([
    "Loaders and actions should remain the default data flow; document when client fetches are acceptable.",
    "Capture which runtime the project targets (Vercel Edge, Fly.io, Express) and needed adapters.",
    "Keep links, forms, and nested routes aligned with Remix conventions to benefit from built-in optimizations.",
  ]),
  python: asMarkdownList([
    "Call out whether FastAPI, Django, or Flask is the project's default framework.",
    "Define typing expectations (mypy, Ruff, or dynamic) to keep contributions consistent.",
    "Describe package management commands (Poetry, pip-tools, uv) for installing and locking dependencies.",
  ]),
}

export const getStackGuidance = (stack?: string) => {
  if (!stack) {
    return stackGuidanceBySlug.default
  }

  const normalized = stack.trim().toLowerCase()

  return stackGuidanceBySlug[normalized] ?? stackGuidanceBySlug.default
}

export const supportedGuidanceStacks = Object.keys(stackGuidanceBySlug).filter((slug) => slug !== "default")

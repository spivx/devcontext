---
name: Performance Optimization
description: Identify bottlenecks and optimize React/Node code.
dependencies: ""
---

## Areas to Inspect
- React: Unnecessary re-renders, large bundles, missing memoization.
- Node/DB: N+1 queries, missing indexes, heavy synchronous computation.
- Network: Large payloads, waterfall requests.

## Checklist
- [ ] Is data fetching parallelized where possible?
- [ ] Are heavy computations memoized (useMemo)?
- [ ] Are images optimized/lazy loaded?
- [ ] Is code splitting implemented?

## Refactoring Pattern
Bad:
\`\`\`js
props.items.forEach(item => {
  // Database call inside loop (N+1)
  await db.getDetails(item.id);
})
\`\`\`

Good:
\`\`\`js
// Batch fetch
const itemIds = props.items.map(i => i.id);
const details = await db.getDetailsForIds(itemIds);
\`\`\`

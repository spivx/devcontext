![devcontext logo](public/logo.png)


Build high-signal agent and instruction files from community-proven best practices.

## What devcontext does
- Transforms curated community knowledge into ready-to-use instructions for agents, coding copilots, and repo guides.
- Guides you through a multi-step wizard that selects files, stacks, and scenario-specific topics.
- Surfaces examples, trade-offs, and documentation links so every choice is backed by trusted references.

## How the wizard works
1. Launch the app and switch from the landing hero to the Instructions Wizard.
2. Pick the instruction file you want to assemble (from templates defined in `data/files.json`).
3. Choose your stack and automatically load its follow-up question set (dynamic imports from `data/questions/<stack>.json`).
4. Answer topic prompts across general, architecture, performance, security, commits, and more—or lean on the recommended defaults when you need a fast decision.
5. Review a completion summary that highlights what made it into your file and which areas still need decisions.

## Community knowledge base
- Every topic originates from the developer community—playbooks, real-world retrospectives, and shared tooling habits.
- JSON entries in `data/` capture those insights: each answer carries labels, examples, pros/cons, tags, and authoritative `docs` links.
- Disabled options mark ideas that the community is still refining; they stay visible so contributors can track demand.
- Icon choices use Simple Icons with automatic contrast adjustments for readability across themes.

## Key interaction details
- Tooltips open from the info icon, letting you explore examples, pros/cons, tags, and external docs without losing your place.
- Multi-select questions let you apply the curated default choice with a single click so momentum never stalls.
- Progress indicators keep a running count of answered versus unanswered items, making gaps obvious before export.

## Run devcontext locally
```bash
git clone https://github.com/spivx/devcontext.git
cd devcontext
npm install
npm run dev
```
Then open the printed local URL in your browser to explore the wizard.

## Contribute back to the community
- Add or improve topics in `data/*.json` with clear labels, examples, and `docs` links.
- Propose new stack questionnaires under `data/questions/`, keeping the schema consistent.
- Share hooks, utilities, or UI refinements that make the wizard easier to reason about for first-time contributors.

Every addition helps the community build better instruction files faster.

## License
MIT License — see [`LICENSE`](LICENSE) for the full text.

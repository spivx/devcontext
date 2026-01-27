---
name: GitHub Action Workflow
description: Create GitHub Actions for CI/CD pipelines.
dependencies: ""
---

## Components
- Triggers (`on: push`, `pull_request`).
- Jobs (build, test, deploy).
- Steps (checkout, setup-node, run scripts).

## Template (CI)
\`\`\`yaml
name: CI

on:
  push:
    branches: ["main"]
  pull_request:
    types: [opened, synchronize]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Test
        run: npm test
\`\`\`

---
name: Bug Analysis & Fix
description: Analyze error logs/descriptions and propose fixes.
dependencies: ""
---

## Process
1. Reproduce: Understand the steps to trigger the bug.
2. Isolate: Identify the component or function responsible.
3. Root Cause: Why is it happening? (Race condition, null pointer, logic error).
4. Fix: Propose a solution that handles the root cause, not just a patch.

## Request Format
User: Here is the stack trace and the code snippet.
Assistant:
**Analysis**: The error `Cannot read properties of undefined (reading 'map')` occurs on line 12.
**Root Cause**: The API response `users` is sometimes null if no users are found.
**Fix**: Add a default value or optional chaining.
\`users?.map(...)\` or \`const safeUsers = users || [];\`

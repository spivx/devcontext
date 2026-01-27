---
name: Security Audit Helper
description: Analyze code for common security vulnerabilities (OWASP Top 10).
dependencies: ""
---

## Scope
- Injection (SQL, NoSQL, Command)
- Broken Authentication
- Sensitive Data Exposure
- XSS (Cross-Site Scripting)

## Instructions
1. Identify input sources (params, changes, body).
2. Check if inputs are sanitized/validated.
3. Look for hardcoded secrets.
4. Verify authorization checks on sensitive actions.

## Examples
User: Audit this function
Assistant:
Potential Issue:
\`const query = "SELECT * FROM users WHERE name = '" + userName + "'";\`
Risk: SQL Injection.
Fix: Use parameterized queries:
\`const query = "SELECT * FROM users WHERE name = ?";\`

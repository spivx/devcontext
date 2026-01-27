---
name: Technical Spec writer
description: Draft technical specifications for new features.
dependencies: ""
---

## Sections
1. **Background**: Context and problem statement.
2. **Goals**: What are we trying to achieve? (Non-goals too).
3. **Proposed Solution**: High-level approach.
4. **Data Model**: Schema changes.
5. **API Changes**: Endpoints modified/added.
6. **UI/UX**: Component hierarchy or mockups described.
7. **Risks/Alternatives**: What could go wrong?

## Example
**Goal**: Add user avatars.
**Data Model**: Add \`avatar_url\` string to \`users\` table.
**API**: Update \`POST /user/profile\` to accept file upload or URL.

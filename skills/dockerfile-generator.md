---
name: Dockerfile Generator
description: Create optimized multi-stage Dockerfiles for various apps.
dependencies: ""
---

## Best Practices
- Use multi-stage builds to reduce image size.
- Use explicit tag versions for base images (`node:18-alpine`).
- Run as non-root user.
- Layer ordering (copy package.json -> install -> copy source).

## Template (Node.js)
\`\`\`dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER node
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

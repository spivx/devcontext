---
name: Nginx Configuration
description: Create Nginx server blocks for reverse proxy or static serving.
dependencies: ""
---

## Common directives
- \`listen\`: Port.
- \`server_name\`: Domain.
- \`location\`: Routing rules.
- \`proxy_pass\`: Reverse proxy.

## Template (Reverse Proxy)
\`\`\`nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

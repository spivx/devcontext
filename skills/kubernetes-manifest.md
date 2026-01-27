---
name: Kubernetes Manifest
description: Generate K8s Deployment and Service YAMLs.
dependencies: ""
---

## Basics
- Deployment: Defines Pods, Replicas, Container specs.
- Service: Exposes Pods (ClusterIP, NodePort, LoadBalancer).
- ConfigMap/Secret: Environment variables.

## Template
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: myregistry/my-app:v1
        ports:
        - containerPort: 8080
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: ClusterIP
\`\`\`

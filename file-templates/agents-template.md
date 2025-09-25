# Agents Development Guide

This guide provides conventions and best practices for building AI agent applications.

---

## 1. Project Overview

- Framework/Language: **{{frameworkSelection}}** / **{{language}}**
- Build tooling: **{{tooling}}**
- Primary focus: **{{projectPriority}}**

---

## 2. Development Standards

### Code Organization
- File structure: **{{fileStructure}}**
- Folder organization: **{{folders}}**
- Naming conventions:
  - Variables & functions: **{{variableNaming}}**
  - Files: **{{fileNaming}}**
  - Components/classes: **{{componentNaming}}**

### Code Style & Quality
- Code style: **{{codeStyle}}**
- Export style: **{{exports}}**
- Comments/documentation: **{{comments}}**

### Testing
- Unit tests: **{{testingUT}}**
- E2E tests: **{{testingE2E}}**

**Additional for Agents**
- Add scenario-based tests simulating conversations or workflows.  
- Validate agent fallbacks (how the agent behaves when tools or APIs fail).  

---

## 3. Agent-Specific Patterns

### State & Memory
- State handling: **{{stateManagement}}**
- Data fetching: **{{dataFetching}}**
- Memory / context strategy: define how the agent retains conversation or state.

### API Integration
- API layer: **{{apiLayer}}**
- Authentication: **{{auth}}**
- Validation: **{{validation}}**
- Tool usage: document which external APIs or tools the agent can call.

### Performance & Monitoring
- Logging: **{{logging}}**
- Performance considerations: **{{reactPerf}}**
- Additional concerns:
  - Monitor token usage and cost efficiency.  
  - Handle API rate limits gracefully.  
  - Use observability tools to track agent responses and latency.  

---

## 4. Collaboration & Git

### Version Control
- Commit style: **{{commitStyle}}**
- PR rules: **{{prRules}}**

### Team Collaboration
- Collaboration approach: **{{collaboration}}**

---

*This agents guide was auto-generated based on your project configuration.  
Customize it further to align with your specific agent development workflows.*

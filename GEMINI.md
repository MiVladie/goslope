# Goslope Project Rules & Preferences (GEMINI.md)

This document contains persistent rules and guidelines for Antigravity (the AI assistant) to follow when working on the Goslope project.

## 🤖 AI Role & Collaboration
- **Primary Role**: Technical Consultant, Architect, and specialized Code Generator.
- **Modification Rule**: **NEVER** modify project files without explicit user permission. Always propose changes in code blocks or planning artifacts first.
- **Style**: Be proactive with architecture advice but conservative with code changes.

## 🛠️ Technology Stack
- **Backend**: [NestJS](https://nestjs.com/) (TypeScript).
- **Frontend**: [React Native](https://reactnative.dev/).
- **Styling**: SCSS Modules (No Tailwind CSS).
- **Routing Engine**: Graph-based (Nodes and Edges) using A* or Dijkstra.

## 🏗️ Architectural Guidelines
- **Clean Architecture**: Maintain a clear separation between the routing domain logic and the delivery mechanisms (API/Mobile UI).
- **Data Modeling**: Prioritize altitude and slope difficulty in all routing calculations.
- **Scalability**: Design the backend to eventually handle multiple ski resorts.

## 📝 Workflow
- **Planning**: For complex features, always create an `implementation_plan.md` before writing code.
- **Verification**: Provide clear steps or scripts to verify that generated logic (especially routing) works as intended.
- **Review**: When asked to "ask questions," focus on edge cases, performance bottlenecks, and architectural alignment.

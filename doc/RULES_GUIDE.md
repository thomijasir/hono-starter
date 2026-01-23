# Rules & Context

This document is an authoritative guide for AI agents contributing to this project. Follow these rules without exception.

## 1. Project Context

- **Type**: Backend API / Web Server
- **Runtime**: Bun
- **Framework**: Hono (Web Standards based)
- **Language**: TypeScript (Strict Mode)
- **Architecture**: Modular Domain-Driven Design (DDD)

## 2. Core Constraints (CRITICAL)

- **NO `any`**: Explicitly define all types. Use `unknown` if strictly necessary but prefer Zod schemas.
- **Strict Null Checks**: Do not ignore `undefined` or `null`. Handle them explicitly.
- **Imports**:
  - Use **Absolute Imports** via path aliases (`~/...`) defined in `tsconfig.json`.
  - Example: `import { createHandler } from "~/utils";` (Correct)
  - Example: `import { x } from "../../utils";` (INCORRECT)
  - **Barrel Files**: Import from index files where available (e.g., `~/middlewares`). Do not deep import (e.g., `~/middlewares/logger`).
- **JSDoc**: MANDATORY. All exported functions, classes, interfaces, and types in `utils`, `modules`, and `middlewares` MUST have JSDoc comments explaining:
  - @description What it does.
  - @param Input arguments.
  - @returns Return value.
  - @throws Potential errors.

## 3. Implementation Patterns

### 3.1 Request Handling (`createHandler`)

You MUST use the `createHandler` wrapper for all route controllers. This ensures consistent error handling and context injection.

```typescript
// src/modules/user/controller.ts
import { createHandler, HandlerContext } from "~/utils";

export const getUser = createHandler(
  async ({ httpResponse }: HandlerContext) => {
    // Logic here
    return httpResponse(data, "Success message");
  },
);
```

### 3.2 Response Format

NEVER return raw JSON. ALWAYS use `httpResponse` or `errorResponse` helpers to ensure the standard envelope:

```json
{
  "success": true, // or false
  "message": "...",
  "data": { ... },
  "meta": { ... } // Optional
}
```

### 3.3 Adding a New Feature (Module)

1.  Create `src/modules/<feature_name>/`
2.  Create `model.ts` (Zod schemas & TS types).
3.  Create `repository.ts` (Data access using Drizzle).
4.  Create `service.ts` (Business logic, optional if simple).
5.  Create `controller.ts` (HTTP handlers using `createHandler`).
6.  Create `index.ts` (Hono Router definitions).
7.  Mount the module in `src/routes.ts`.

## 4. Linting & Formatting

- The project uses **ESLint** and **Prettier**.
- Run `bun run lint:fix` if you are unsure about style violation.
- Ensure no unused variables (prefix with `_` if intentional per TS config).

## 5. Environment

- Use `process.env` via `state.config` (injected in context) preferred, or `Bun.env`.
- Configuration is centralized in `src/state.ts`.

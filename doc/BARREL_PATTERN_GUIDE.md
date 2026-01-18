# Barrel Pattern Guide

This project uses the **Barrel Pattern** to simplify imports and organize modules.

## What is it?
A "barrel" is an `index.ts` file that re-exports modules from a directory. This allows consumers to import from the directory path rather than specific files.

## Project Rules

### 1. Create Barrels
Directories like `middlewares`, `utils`, and feature `modules` should have an `index.ts`.

**Example (`src/utils/index.ts`):**
```typescript
export * from "./handler";
export * from "./response";
export * from "./log";
```

### 2. Import from Barrels
Always import from the barrel (the directory) via the alias, rather than the specific file.

**✅ Correct:**
```typescript
import { createHandler } from "~/utils";
```

**❌ Incorrect:**
```typescript
import { createHandler } from "~/utils/handler";
// or
import { createHandler } from "../../utils/handler";
```

## Reference
- [Using Barrel Pattern in React TypeScript Projects](https://medium.com/@denisultanoglu/using-barrel-pattern-in-react-typescript-projects-e8e855730182)

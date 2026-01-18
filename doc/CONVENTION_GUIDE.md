# Convention Guide

This document outlines the coding standards, project structure, and best practices for the `web-mock` project. Adhering to these conventions ensures consistency and maintainability across the codebase.

## 1. Project Structure

The project follows a modular architecture where features are grouped by domain.

```
src/
├── middlewares/        # Hono middlewares (e.g., auth, logger)
├── modules/            # Feature modules (Domain Driven Design)
│   ├── users/          # Example module: Users
│   │   ├── controller.ts # Request handlers
│   │   ├── service.ts    # Business logic
│   │   ├── model.ts      # Data models/types
│   │   └── index.ts      # Routes definition
│   └── index.ts        # Exports all module routes
├── public/             # Static files (JSON mocks, assets) served by catch-all route
├── utils/              # Shared utilities (helpers, response formats)
├── index.ts            # Entry point
├── routes.ts           # Main application router
├── state.ts            # App state initialization (Config, DB)
└── types.ts            # Global type definitions
```

## 2. Naming Conventions

- **Files**: Use `snake_case` for variables and function names. Use `PascalCase` for classes and types. File names should generally be `snake_case` (e.g., `user_controller.ts`) or descriptive standard names like `controller.ts` within a module.
- **Directories**: Use `snake_case` for directory names (e.g., `user_content`).
- **Module Files**:
  - `controller.ts`: Contains the HTTP request handlers.
  - `service.ts`: Contains the business logic and data access.
  - `model.ts`: Contains interfaces and schemas.
  - `index.ts`: Exports the Hono router for the module.

## 3. Handler Pattern

We use a custom `createHandler` utility to standardize request handling and dependency injection.

### Usage

```typescript
import { createHandler, HandlerContext } from "~/utils";
import * as service from "./service";

export const getItems = createHandler(
  async ({ ctx, query, httpResponse }: HandlerContext) => {
    // Access parsed query params
    const page = Number(query.page) || 1;
    const items = await service.fetchAll(page);
    return httpResponse(items, "Items retrieved successfully");
  },
);
```

### Context Object

The `createHandler` provides a simplified `HandlerContext` object:

- `ctx`: The raw Hono context.
- `state`: The application state (config, db connection).
- `params`: Parsed route parameters.
- `query`: Parsed query string parameters.
- `body`: Parsed JSON body (safe access).
- `httpResponse`: Helper to return a standardized success response.
- `errorResponse`: Helper to return a standardized error response.

## 4. Response Format

All API responses must follow a standardized JSON envelope.

### Success Response

```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... },
  "meta": {                 // Optional: for pagination
    "page": 1,
    "limit": 10,
    "total": 100
  },
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Resource not found",
  "data": null, // Optional: validation errors details
}
```

Use the `httpResponse` and `errorResponse` helpers from `src/utils/response.ts` to generate these responses.

## 5. State Management

Application state (configuration, database connections, etc.) is initialized once in `src/state.ts` and injected into every request via middleware.

- **Accessing State**: Use `state` property in `HandlerContext`.
  ```typescript
  const myHandler = createHandler(({ state }) => {
    console.log(state.config.environment);
  });
  ```
- **Immutability**: The state object is frozen after initialization to prevent runtime modifications.

## 6. Static Mocking

For simple mock data that doesn't require logic, place files in `src/public`. The server includes a catch-all route that attempts to serve files from this directory mimicking the request path.

- **Request**: `GET /cms/footerConfig.json`
- **File**: `src/public/cms/footerConfig.json`
- **Response**: Content of the JSON file.

## 7. Logging

Use the built-in logger middleware. For manual logging, prefer using `console.log` or `console.error` with descriptive tags, e.g., `[MyModule] Message...`.

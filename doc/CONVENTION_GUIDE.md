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
│   │   ├── repository.ts # Data access layer
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
  - `service.ts`: Contains the business logic and orchestration.
  - `repository.ts`: Contains the data access logic (SQL/DB).
  - `model.ts`: Contains interfaces and schemas.
  - `index.ts`: Exports the Hono router for the module.

## 3. Handler Pattern

We use specialized handler utilities to standardize request handling, enforce type safety, and improve performance.

### Specialized Handlers

- **`createHandler`**: Use for requests that **do not** require a body (GET, DELETE, etc.). It skips body parsing entirely.
- **`createJsonHandler`**: Use for POST/PUT/PATCH requests expecting a JSON payload.
- **`createFormHandler`**: Use for requests expecting `multipart/form-data` or `application/x-www-form-urlencoded`.

### Usage Examples

**GET Request (No Body)**

```typescript
import { createHandler } from "~/utils";
import * as service from "./service";

export const getItems = createHandler(async ({ query, httpResponse }) => {
  // Access parsed query params
  const page = Number(query.page) || 1;
  const items = await service.fetchAll(page);
  return httpResponse(items, "Items retrieved successfully");
});
```

**POST Request (JSON Body)**

```typescript
import { createJsonHandler } from "~/utils";
import * as service from "./service";
import type { CreateItemPayload } from "./model";

export const createItem = createJsonHandler<CreateItemPayload>(
  async ({ body, httpResponse }) => {
    // 'body' is strictly typed as CreateItemPayload
    const newItem = await service.create(body);
    return httpResponse(newItem, "Item created", 201);
  },
);
```

### Context Object

The handlers provide a simplified `HandlerContext` object. **Note**: properties are context-aware.

- `state`: The application state (config, db connection).
- `log`: Application logger.
- `params`: Parsed route parameters.
- `query`: Parsed query string parameters.
- `body`: Parsed body (Available **only** in `createJsonHandler` and `createFormHandler`).
- `claim`: JWT claim if authenticated.
- `httpResponse`: Helper to return a standardized success response.
- `errorResponse`: Helper to return a standardized error response.

## 4. Response Format

All API responses must follow a standardized JSON envelope.

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {                 // Optional: for pagination
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Resource not found",
  "data": null // Optional: validation errors details
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

## Detail Project Architecture & Naming Conventions

This project follows a strict 4-layer architecture. To ensure code maintainability and easy debugging, we use a **"Verb Hierarchy"**. By looking at the function name, you should immediately know which layer of the application you are working in.

### The Core Concept: "The Verb Hierarchy"

| Layer          | Responsibility   | Naming Convention               | Primary Verbs                                |
| -------------- | ---------------- | ------------------------------- | -------------------------------------------- |
| **Controller** | HTTP Handling    | `[Verb][Entity]` or `[Verb]`    | `get`, `create`, `update`, `delete`, `login` |
| **Service**    | Business Logic   | `[Action][Entity]`              | `register`, `process`, `verify`, `sign`      |
| **Repository** | Data Access      | `[StorageOp][Entity][Criteria]` | `find...By...`, `save...`, `delete...`       |
| **Model**      | Type Definitions | `[Noun]`                        | N/A                                          |

---

### 1. 📦 Repository (`repository.ts`)

**Role:** The Librarian.
**Responsibility:** Dumb data access. No business logic allowed.

- **Return Type:** Returns `Promise<ResultType<T>>` (using our Result utility).
- **Convention:** Use **SQL/Storage verbs** + **Entity**.
- **Rules:**
- Never use "business" words like `register` or `process`.
- Use `save` for both Insert and Update operations (or `saveNew...`, `save...`).

**Examples:**

```typescript
// ✅ Good
findUserByEmail(state, email);
saveNewPost(state, payload);
deletePostById(state, id);

// ❌ Bad
createUser(user); // Implies logic
checkIfUserExists(email); // Too verbose
```

---

### 2. ⚙️ Service (`service.ts`)

**Role:** The Manager.
**Responsibility:** Business logic, validation, error handling, and orchestrating repositories.

- **Return Type:** Returns `ResultType<T>` or `Promise<ResultType<T>>`.
- **Convention:** Use **Action/Business verbs**.
- **Rules:**
- This is the only layer that should import `Result.chain` or business validation logic.
- Function names should describe the _intent_ of the user.

**Examples:**

```typescript
// ✅ Good
registerUser(params);
signToken(user, secret);
processOrder(orderId);

// ❌ Bad
saveUser(params); // That is a repository name
```

---

### 3. 🎮 Controller (`controller.ts`)

**Role:** The Interface / Waiter.
**Responsibility:** Parsing HTTP requests, reading headers, and sending JSON responses.

- **Return Type:** `Promise<Response>` (via `httpResponse` or `errorResponse`).
- **Convention:** Use **Handler verbs**.
- **Rules:**
- Controllers should be thin. They simply unwrap the `Result` from the Service or Repository.
- Use `createHandler` or `createJsonHandler`.

**Examples:**

```typescript
// ✅ Good
register(ctx);
getAllUsers(ctx);
createPost(ctx);

// ❌ Bad
saveUser(ctx); // Confusing with Repository
```

---

### 4. 📝 Model (`model.ts`)

**Role:** The Blueprint.
**Responsibility:** Defining the shape of data, DTOs (Data Transfer Objects), and Types.

- **Convention:** Use **Nouns**.

**Examples:**

```typescript
interface User { id: string; ... }      // Database Entity
interface CreateUserDTO { email: ... }  // API Payload
type UserResult = ResultType<User>;     // Return Type

```

---

### Full Flow Example

Here is how a single feature ("User Registration") flows through the naming conventions using our `Result` utility.

#### 1. Controller (`controller.ts`)

```typescript
import { createJsonHandler } from "~/utils";
import * as Service from "./service";

export const register = createJsonHandler(
  async ({ body, state, httpResponse, errorResponse }) => {
    // 1. Delegate to Service
    const result = await Service.registerUser(state, body);

    // 2. Unwrap Result
    if (result.ok) {
      return httpResponse(result.val, "User registered", 201);
    } else {
      // Error handling logic
      return errorResponse(result.err);
    }
  },
);
```

#### 2. Service (`service.ts`)

```typescript
import * as UserRepo from "./repository";
import { Result, Ok, Err } from "~/utils";

export const registerUser = async (state: AppState, dto: CreateUserDTO) => {
  // 1. Validation (Business Logic)
  if (dto.password.length < 8) return Err("Password too short");

  // 2. Check Existence (Call Repository)
  const existing = await UserRepo.findUserByEmail(state, dto.email);
  if (existing.ok) return Err("User already exists");

  // 3. Save (Call Repository)
  return await UserRepo.saveNewUser(state, dto);
};
```

#### 3. Repository (`repository.ts`)

```typescript
import { Result, Ok, Err } from "~/utils";
import { users } from "~/schemas/default";

export const findUserByEmail = async (state: AppState, email: string) => {
  // Wraps DB call in Result safety
  const result = await Result.async(
    state.db.select().from(users).where(eq(users.email, email)),
  );
  // ... check result.ok
  return Ok(result.val[0]);
};

export const saveNewUser = async (state: AppState, data: CreateUserPayload) => {
  const result = await Result.async(
    state.db.insert(users).values(data).returning(),
  );
  // ... check result.ok
  return Ok(result.val[0]);
};
```

#### 4. Model (model.ts)

```typescript
interface User { id: string; ... }      // Database Entity
interface CreateUserDTO { email: ... }  // API Payload
type UserResult = ResultType<User>;     // Return Type
```

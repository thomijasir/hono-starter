# Rust Grade Starter Pack Hono + Bun

![Preview of the project](preview.png)


> A robust, lightweight, and collaborative-ready backend starter pack built with [Hono](https://hono.dev/) and [Bun](https://bun.sh/).

## Background & Motivation

This starter pack was built with a singular mission: **to enforce Rust-grade security and strictness within the TypeScript ecosystem.**

Drawing from deep experience in Rust systems programming, this project translates core principles of safety, strictness, and reliability into a Bun + Hono environment. We aim to create a "super secure" backend foundation that minimizes runtime errors and enforces architectural discipline.

**Why this matters:**
This approach allows companies to leverage the vast pool of available JavaScript/TypeScript developers while maintaining an engineering standard typically reserved for systems languages like Rust. By following the rules and conventions of this starter pack, developers can build robust, enterprise-ready applications with the ease of TypeScript and the safety of Rust-inspired patterns.

This project is a modern backend boilerplate designed for speed, type safety, and maintainability. It leverages the performance of the Bun runtime and the standards-based approach of the Hono framework. The architecture follows a modular, domain-driven design suitable for scalable applications.

## Key Features

-   **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime & package manager.
-   **Framework**: [Hono](https://hono.dev/) - Ultrafast web framework on Web Standards.
-   **Language**: [TypeScript](https://www.typescriptlang.org/) - Strict type safety.
-   **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema validation.
-   **Architecture**: Modular/Domain-Driven Design (DDD).
-   **Utilities**: Standardized response envelopes, custom error handling, and structured logging.

## Getting Started

### Prerequisites

Ensure you have Bun installed:

```sh
curl -fsSL https://bun.sh/install | bash
```

### Installation

Install dependencies:

```sh
bun install
```

### Running the Project

**Development Mode:**

```sh
bun run dev
```
Runs the server with hot-reloading using the `.env.development` configuration.

**Staging Mode:**

```sh
bun run dev:staging
```

**Production Mode:**

```sh
bun run start
```

## Project Structure

```
src/
├── constants/          # Application constants (Env, Configs)
├── middlewares/        # Global middlewares (Auth, Logger, etc.)
├── model/              # Global models & types (AppState, Response)
├── modules/            # Feature modules (Domain Driven Design)
├── schema/             # Shared Zod schemas
├── services/           # Global services (Database, WebSocket)
├── utils/              # Shared utilities (Response, Handler, Logger)
├── main.ts             # Application entry point
├── routes.ts           # Main router & composition
└── state.ts            # Global application state initialization
```

## Documentation & Guides

Detailed documentation is available in the `doc/` directory:

-   [Architecture Overview](doc/ARCHITECTURE.md): High-level design, data flow, and components.
-   [Convention Guide](doc/CONVENTION_GUIDE.md): Coding standards, naming conventions, and best practices.
-   [Barrel Pattern Guide](doc/BARREL_PATTERN_GUIDE.md): Rules for using index files and imports.
-   [Rules](doc/RULES_GUIDE.md): Special instructions for AI agents working on this codebase.

## Development Workflows

-   **Linting**: `bun run lint`
-   **Formatting**: `bun run format`
-   **Testing**: `bun test`
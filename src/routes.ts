import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import path from "node:path";
import packageJSON from "../package.json" with { type: "json" };
import { logger } from "~/middlewares";
import type { AppState } from "~/model";
import {
  authRoutes,
  postRoutes,
  userRoutes,
  attachmentRoutes,
  chatRoutes,
  appClientRoutes,
  callRoutes,
  conversationRoutes,
  messageRoutes,
} from "~/modules";
import { createRouter, errorResponse, log } from "~/utils";

export const createApp = (state: AppState) => {
  const app = createRouter();

  // Inject State Middleware
  app
    .use(requestId())
    .use(logger)
    .use(cors())
    .use(async (c, next) => {
      // Context Registration
      // Set State To Context
      c.set("state", state);
      // Set Log To Context
      c.set("log", log);
      await next();
    });

  // Handle api unexpected error
  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return errorResponse(c, err.message, err.status);
    }
    if (err.message !== "") {
      return errorResponse(c, err.message, 500);
    }
    return errorResponse(c, "Internal Server Error", 500);
  });

  // Handle API 404 Not Found
  app.notFound((c) => {
    return errorResponse(c, "Not Found", 404);
  });

  // Serve Public Index
  app.get("/", () => {
    const filePath = path.join(process.cwd(), "public", "index.html");
    const file = Bun.file(filePath);
    return new Response(file);
  });

  // Mount modules
  // Note: If modules need type-safe access to 'state',
  // they should also be defined with Hono<{ Variables: Variables }>
  // or use the generic Handler type.
  app.route("/user", userRoutes());
  app.route("/post", postRoutes());
  app.route("/auth", authRoutes());
  app.route("/attachment", attachmentRoutes());
  app.route("/chat", chatRoutes());
  app.route("/app-client", appClientRoutes());
  app.route("/call", callRoutes());
  app.route("/conversation", conversationRoutes());
  app.route("/message", messageRoutes());

  // OpenAPI Docs Spec
  app.openAPIRegistry.registerComponent("securitySchemes", "PortalBearer", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  app.openAPIRegistry.registerComponent("securitySchemes", "ChatBearer", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Hono Starter API",
      description:
        "This starter pack was built with a singular mission: to enforce Rust-grade security and strictness within the TypeScript ecosystem",
      contact: {
        name: "Thomi Jasir",
        email: "thomijasir@gmail.com",
        url: "https://github.com/thomijasir",
      },
    },
  });

  // Scalar UI API Configuration
  app.get(
    "/spec",
    swaggerUI({
      url: "/openapi.json",
      filter: true, // Enable search bar
      // defaultModelsExpandDepth: -1, // hide schema
    }),
  );

  log.info(
    `Open API Documentation: http://localhost:${state.config.port}/openapi.json`,
  );
  log.info(
    `API spec and dashboard: http://localhost:${state.config.port}/spec`,
  );

  // Serve public fallback api
  app.all("*", async (c) => {
    try {
      const filePath = path.join(process.cwd(), "public", c.req.path);
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
    } catch (_e) {
      // File not found or not accessible
    }
    return errorResponse(c, "Not Found", 404);
  });

  return app;
};

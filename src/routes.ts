import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import path from "node:path";
import packageJSON from "../package.json" with { type: "json" };
import { logger } from "~/middlewares";
import type { AppState } from "~/model";
import { authRoutes, postRoutes, userRoutes } from "~/modules";
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

  // OpenAPI Docs Spec
  app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Hono Starter API",
    },
  });

  // Scalar UI API Configuration
  app.get(
    "/spec",
    Scalar({
      url: "/doc",
      theme: "kepler",
      layout: "classic",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
    }),
  );
  log.info(`Open API Documentation: http://localhost:${state.config.port}/doc`);
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

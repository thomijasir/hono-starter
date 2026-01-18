import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import path from "node:path";
import { logger } from "~/middlewares";
import type { AppState, Variables } from "~/model";
import { userRoutes, postRoutes } from "~/modules";
import { errorResponse } from "~/utils";

export const createApp = (state: AppState) => {
  const app = new Hono<{ Variables: Variables }>();

  // Inject State Middleware
  app
    .use(requestId())
    .use(logger())
    .use(cors())
    .use(async (c, next) => {
      // Set State To Context
      c.set("state", state);
      await next();
    });

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return errorResponse(c, err.message, err.status);
    }
    return errorResponse(c, "Internal Server Error", 500);
  });

  app.notFound((c) => {
    return errorResponse(c, "Not Found", 404);
  });

  app.get("/", async () => {
    const filePath = path.join(process.cwd(), "public", "index.html");
    const file = Bun.file(filePath);
    return new Response(file);
  });

  // Mount modules
  // Note: If modules need type-safe access to 'state',
  // they should also be defined with Hono<{ Variables: Variables }>
  // or use the generic Handler type.
  app.route("/user", userRoutes);
  app.route("/post", postRoutes);

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

import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import type { AppOpenApi } from "~/models";
import { errorResponse, Result } from "~/utils";

export const auth = createMiddleware<AppOpenApi>(async (c, next) => {
  const state = c.var.state;
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1]; // removes "Bearer "

  if (!token) {
    return errorResponse(
      c,
      "unauthorized",
      401,
      "Missing Authorization header",
    );
  }
  const result = await Result.async(
    verify(token, state.config.jwtSecret, "HS256"),
  );

  if (!result.ok) {
    return errorResponse(c, "unauthorized", 401, result.err);
  }

  c.set("jwtPayload", result.val);
  // no error continue
  return next();
});

import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import type { AppOpenApi } from "~/model";
import { errorResponse, Result } from "~/utils";

export const auth = createMiddleware<AppOpenApi>(async (c, next) => {
  const state = c.var.state;
  const jwtMiddleware = jwt({
    secret: state.config.jwtSecret,
    alg: "HS256",
  });
  const result = await Result.async(jwtMiddleware(c, next));

  if (result.ok) {
    return result.val;
  }
  return errorResponse(c, "unauthorized", 401);
});

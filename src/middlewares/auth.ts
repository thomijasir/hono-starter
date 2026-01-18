import type { MiddlewareHandler } from "hono";
import { jwt } from "hono/jwt";
import type { Variables } from "~/model";

export const auth: MiddlewareHandler<{ Variables: Variables }> = async (
  c,
  next,
) => {
  const state = c.var.state;
  const jwtMiddleware = jwt({
    secret: state.config.jwtSecret,
    alg: "HS256",
  });
  return jwtMiddleware(c, next);
};

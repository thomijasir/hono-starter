import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import type { Variables } from "~/model";

export const auth = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const state = c.var.state;
    const jwtMiddleware = jwt({
      secret: state.config.jwtSecret,
      alg: "HS256",
    });
    return jwtMiddleware(c, next);
  },
);

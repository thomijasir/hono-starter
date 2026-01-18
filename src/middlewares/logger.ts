import type { MiddlewareHandler } from "hono";
import { log } from "~/utils";

export const logger = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = Date.now();
    const { method, path } = c.req;

    await next();

    const end = Date.now();
    const status = c.res.status;
    const time = end - start;

    log.info(
      {
        method,
        path,
        status,
        time,
      },
      `${method} ${path}`,
    );
  };
};

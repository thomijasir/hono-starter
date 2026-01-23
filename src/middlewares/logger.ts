import { createMiddleware } from "hono/factory";
import { log } from "~/utils";

export const logger = createMiddleware(async (c, next) => {
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
});

import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Variables } from "./app_state";
import type { PaginationMeta } from "./response";

export interface HandlerContext<TBody = unknown, TQuery = Record<string, string | undefined>> {
  ctx: Context<{ Variables: Variables }>;
  state: Variables["state"];
  log: Variables["log"];
  params: Record<string, string>;
  query: TQuery;
  body: TBody;
  httpResponse: (
    data: unknown,
    message?: string,
    status?: ContentfulStatusCode,
    meta?: PaginationMeta,
  ) => Response;
  errorResponse: (
    message?: string,
    status?: ContentfulStatusCode,
    errors?: unknown,
  ) => Response;
}

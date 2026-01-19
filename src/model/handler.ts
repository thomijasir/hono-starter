import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AppState, Variables } from "./app_state";
import type { PaginationMeta } from "./response";

export interface HandlerContext {
  ctx: Context<{ Variables: Variables }>;
  state: AppState;
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
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

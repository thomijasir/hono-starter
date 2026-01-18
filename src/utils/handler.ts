import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { httpResponse, errorResponse  } from "./response";
import type { AppState, Variables, PaginationMeta } from "~/model";

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

export const createHandler = (
  handler: (ctx: HandlerContext) => Promise<Response> | Response,
) => {
  return async (ctx: Context<{ Variables: Variables }>) => {
    const params = ctx.req.param();
    const query = ctx.req.query();
    const state = ctx.get("state");
    let body: unknown = null;

    // specific content-type check to avoid parsing errors on GET requests or non-JSON bodies
    if (
      ctx.req.method !== "GET" &&
      ctx.req.header("Content-Type")?.includes("application/json")
    ) {
      try {
        body = await ctx.req.json();
      } catch (_: unknown) {
        // silent fail for body parsing, treating as null
        body = null;
      }
    }

    const wrappedHttpResponse = <T>(
      data: T,
      message?: string,
      status: ContentfulStatusCode = 200,
      meta?: PaginationMeta,
    ) => httpResponse(ctx, data, message, status, meta);

    const wrappedErrorResponse = (
      message?: string,
      status: ContentfulStatusCode = 500,
      errors?: unknown,
    ) => errorResponse(ctx, message, status, errors);

    return handler({
      ctx,
      state,
      params,
      query,
      body,
      httpResponse: wrappedHttpResponse,
      errorResponse: wrappedErrorResponse,
    });
  };
};

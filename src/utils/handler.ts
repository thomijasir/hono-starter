import { httpResponse, errorResponse } from "./response";
import type {
  ContentfulStatusCode,
  Context,
  HandlerContext,
  Variables,
  PaginationMeta,
} from "~/model";

export const createHandler = <
  TBody = unknown,
  TQuery = Record<string, string | undefined>
>(
  handler: (ctx: HandlerContext<TBody, TQuery>) => Promise<Response> | Response,
) => {
  return async (ctx: Context<{ Variables: Variables }>) => {
    const params = ctx.req.param();
    const query = ctx.req.query() as TQuery;
    const state = ctx.var.state;
    const log = ctx.var.log;
    let body = null as TBody;

    // specific content-type check to avoid parsing errors on GET requests or non-JSON bodies
    if (
      ctx.req.method !== "GET" &&
      ctx.req.header("Content-Type")?.includes("application/json")
    ) {
      try {
        body = await ctx.req.json();
      } catch (_: unknown) {
        // silent fail for body parsing, treating as null
        body = null as TBody;
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
      log,
      params,
      query,
      body,
      httpResponse: wrappedHttpResponse,
      errorResponse: wrappedErrorResponse,
    });
  };
};

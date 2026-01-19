import { httpResponse, errorResponse } from "./response";
import type {
  ContentfulStatusCode,
  Context,
  HandlerContext,
  Variables,
  PaginationMeta,
} from "~/model";

export const createHandler = (
  handler: (ctx: HandlerContext) => Promise<Response> | Response,
) => {
  return async (ctx: Context<{ Variables: Variables }>) => {
    const params = ctx.req.param();
    const query = ctx.req.query();
    const state = ctx.var.state;
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

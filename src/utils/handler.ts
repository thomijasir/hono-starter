import { httpResponse, errorResponse } from "./response";
import type {
  ContentfulStatusCode,
  Context,
  Variables,
  PaginationMeta,
} from "~/model";

interface HandlerContext<
  TBody = unknown,
  TClaim = unknown,
  TQuery = Record<string, string | undefined>,
> {
  // ctx: Context<{ Variables: Variables }>; // Global context dont expose on production only for testing and development
  state: Variables["state"];
  log: Variables["log"];
  params: Record<string, string>;
  query: TQuery;
  body: TBody;
  claim: TClaim | null;
  header: Record<string, string>;
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

export const createHandler = <
  TBody = unknown,
  TClaim = unknown,
  TQuery = Record<string, string | undefined>,
>(
  handler: (
    ctx: HandlerContext<TBody, TClaim, TQuery>,
  ) => Promise<Response> | Response,
) => {
  return async (ctx: Context<{ Variables: Variables }>) => {
    let body = null as TBody;

    if (ctx.req.method !== "GET") {
      const contentType = ctx.req.header("Content-Type");
      try {
        if (contentType?.includes("application/json")) {
          body = await ctx.req.json();
        } else if (
          contentType?.includes("multipart/form-data") ||
          contentType?.includes("application/x-www-form-urlencoded")
        ) {
          body = (await ctx.req.parseBody()) as TBody;
        }
      } catch {
        // Silently fail to null if parsing error occurs
        body = null as TBody;
      }
    }

    const wrappedHttpResponse = (
      data: unknown,
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
      // ctx, // Global context dont expose on production only for testing and development
      state: ctx.var.state,
      log: ctx.var.log,
      params: ctx.req.param(),
      query: ctx.req.query() as TQuery,
      body,
      claim: (ctx.var.jwtPayload as TClaim) ?? null,
      header: ctx.req.header(),
      httpResponse: wrappedHttpResponse,
      errorResponse: wrappedErrorResponse,
    });
  };
};

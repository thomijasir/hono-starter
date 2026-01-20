import { httpResponse, errorResponse } from "./response";
import type {
  ContentfulStatusCode,
  Context,
  Variables,
  PaginationMeta,
} from "~/model";

interface HandlerContext<TBody = unknown, TClaim = unknown, TQuery = Record<string, string | undefined>> {
  // ctx: Context<{ Variables: Variables }>; // Global context dont expose on production only for testing and development
  state: Variables["state"];
  log: Variables["log"];
  params: Record<string, string>;
  query: TQuery;
  body: TBody;
  claim: TClaim | null;
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
  TQuery = Record<string, string | undefined>
>(
  handler: (ctx: HandlerContext<TBody, TClaim, TQuery>) => Promise<Response> | Response,
) => {
  return async (ctx: Context<{ Variables: Variables }>) => {
    const params = ctx.req.param();
    const query = ctx.req.query() as TQuery;
    const state = ctx.var.state;
    const log = ctx.var.log;
    const jwtPayload = ctx.var.jwtPayload as TClaim;
    const claim = jwtPayload ?? null;
    let body = null as TBody;

    if (
      ctx.req.method !== "GET" &&
      ctx.req.header("Content-Type")?.includes("application/json")
    ) {
      try {
        body = await ctx.req.json();  
      } catch (_: unknown) {
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
      // ctx, // Global context dont expose on production only for testing and development
      state,
      log,
      params,
      query,
      body,
      claim,
      httpResponse: wrappedHttpResponse,
      errorResponse: wrappedErrorResponse,
    });
  };
};

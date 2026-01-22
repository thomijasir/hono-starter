import { httpResponse, errorResponse } from "./response";
import type {
  ContentfulStatusCode,
  Context,
  Variables,
  PaginationMeta,
} from "~/model";

/**
 * Interface representing the context provided to a request handler.
 *
 * @template TBody - The type of the request body. Defaults to `unknown`.
 * @template TClaim - The type of the JWT claim (payload). Defaults to `unknown`.
 * @template TQuery - The type of the query parameters. Defaults to `Record<string, string | undefined>`.
 */
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

const executeRequest = async <
  TBody,
  TClaim,
  TQuery = Record<string, string | undefined>,
>(
  ctx: Context<{ Variables: Variables }>,
  handler: (
    ctx: HandlerContext<TBody, TClaim, TQuery>,
  ) => Promise<Response> | Response,
  body: TBody,
) => {
  const wrappedHttpResponse = (
    data: unknown,
    message: string = "success",
    status: ContentfulStatusCode = 200,
    meta?: PaginationMeta,
  ) => httpResponse(ctx, data, message, status, meta);

  const wrappedErrorResponse = (
    message: string = "failed",
    status: ContentfulStatusCode = 500,
    errors?: unknown,
  ) => errorResponse(ctx, message, status, errors);

  return handler({
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

/**
 * Creates a standard request handler for routes that do not require valid body parsing (e.g. GET requests).
 *
 * @template TClaim - The type of the JWT claim (payload).
 * @template TQuery - The type of the query parameters.
 * @param {function(Omit<HandlerContext<null, TClaim, TQuery>, "body">): Promise<Response> | Response} handler - The function to handle the request.
 * @returns {function(Context<{ Variables: Variables }>): Promise<Response>} A Hono middleware function.
 */
export const createHandler = <
  TClaim = unknown,
  TQuery = Record<string, string | undefined>,
>(
  handler: (
    ctx: Omit<HandlerContext<null, TClaim, TQuery>, "body">,
  ) => Promise<Response> | Response,
) => {
  return async (ctx: Context<{ Variables: Variables }>) => {
    return executeRequest(ctx, handler, null);
  };
};

/**
 * Creates a request handler for routes that expect a JSON body.
 * It attempts to parse the request body as JSON. If parsing fails, the body is set to null.
 *
 * @template TBody - The expected type of the JSON body.
 * @template TClaim - The type of the JWT claim (payload).
 * @template TQuery - The type of the query parameters.
 * @param {function(HandlerContext<TBody, TClaim, TQuery>): Promise<Response> | Response} handler - The function to handle the request.
 * @returns {function(Context<{ Variables: Variables }>): Promise<Response>} A Hono middleware function.
 */
export const createJsonHandler = <
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
    try {
      body = await ctx.req.json();
    } catch {
      body = null as TBody;
    }
    return executeRequest(ctx, handler, body);
  };
};

/**
 * Creates a request handler for routes that expect form data.
 * It attempts to parse the request body as form data. If parsing fails, the body is set to null.
 *
 * @template TBody - The expected type of the form body.
 * @template TClaim - The type of the JWT claim (payload).
 * @template TQuery - The type of the query parameters.
 * @param {function(HandlerContext<TBody, TClaim, TQuery>): Promise<Response> | Response} handler - The function to handle the request.
 * @returns {function(Context<{ Variables: Variables }>): Promise<Response>} A Hono middleware function.
 */
export const createFormHandler = <
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
    try {
      body = (await ctx.req.parseBody()) as TBody;
    } catch {
      body = null as TBody;
    }
    return executeRequest(ctx, handler, body);
  };
};

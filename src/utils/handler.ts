import { Err, Ok } from "ts-results";
import type { Result } from "ts-results";
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

export const resultAsync = <T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> =>
  promise.then((data) => Ok(data)).catch((error: unknown) => Err(error as E));

export const result = <T, E = Error>(fn: () => T): Result<T, E> => {
  try {
    return Ok(fn());
  } catch (error) {
    return Err(error as E);
  }
};

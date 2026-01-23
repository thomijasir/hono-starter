import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiResponse, ErrorApiResponse, PaginationMeta } from "~/model";

/**
 * Standardized Success Response
 */
export const httpResponse = <T,>(
  ctx: Context,
  data: T,
  message: string = "Success",
  status: ContentfulStatusCode = 200,
  meta?: PaginationMeta,
) => {
  return ctx.json(
    {
      success: true,
      message,
      data,
      meta,
    } satisfies ApiResponse<T>,
    status,
  );
};

/**
 * Standardized Error Response
 */
export const errorResponse = (
  ctx: Context,
  message: string = "Error",
  status: ContentfulStatusCode = 500,
  errors: unknown = null,
) => {
  return ctx.json(
    {
      success: false,
      message,
      error: errors,
    } satisfies ErrorApiResponse,
    status,
  );
};

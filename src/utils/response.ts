import { z } from "@hono/zod-openapi";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiResponse, ErrorApiResponse, PaginationMeta } from "~/model";

/**
 * Standardized Success Response Schema Factory
 */
export const jsonResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "Success" }),
    data: dataSchema,
  });

/**
 * Standardized Success Response Schema With Pagination Factory
 */
export const jsonResponsePaginationSchema = <T extends z.ZodType>(
  dataSchema: T,
) =>
  z.object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: "Success" }),
    data: dataSchema,
    meta: z
      .object({
        page: z.number().openapi({ example: 1 }),
        limit: z.number().openapi({ example: 10 }),
        total: z.number().openapi({ example: 100 }),
        totalPages: z.number().optional().openapi({ example: 10 }),
      })
      .optional(),
  });

/**
 * Standardized Error Response Schema Factory
 */
export const jsonErrorResponseSchema = () =>
  z.object({
    success: z.boolean().openapi({ example: false }),
    message: z.string().openapi({ example: "Error" }),
    error: z.null().or(z.any()), // Allow null or any detailed error structure
  });

/**
 * Standardized Success Response
 */
export const httpResponse = <T>(
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

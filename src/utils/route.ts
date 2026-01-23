import { OpenAPIHono } from "@hono/zod-openapi";
import { jsonErrorResponseSchema } from "./response";
import type { AppOpenApi, z } from "~/model";

export const createRouter = () => {
  const routes = new OpenAPIHono<AppOpenApi>({ strict: true });
  return routes;
};

export const jsonContent = <T extends z.ZodType>(
  schema: T,
  description: string,
) => ({
  content: {
    "application/json": {
      schema,
    },
  },
  description,
});

export const jsonRequest = <T extends z.ZodType>(
  schema: T,
  description?: string,
) => ({
  body: {
    content: {
      "application/json": {
        schema,
      },
    },
    description,
  },
});

export const formRequest = <T extends z.ZodType>(
  schema: T,
  description?: string,
) => ({
  body: {
    content: {
      "multipart/form-data": {
        schema,
      },
    },
    description,
  },
});

export interface ResponseConfig {
  content: {
    "application/json": {
      schema: z.ZodType;
    };
  };
  description: string;
}

export const createResponses = (
  successSchema: z.ZodType,
  successDescription: string,
  successStatus: number = 200,
  customResponses: Record<
    number,
    { description: string; schema?: z.ZodType }
  > = {},
) => {
  const errorSchema = jsonErrorResponseSchema();

  const responses: Record<number, ResponseConfig> = {
    [successStatus]: jsonContent(successSchema, successDescription),
    400: jsonContent(errorSchema, "Validation error"),
    500: jsonContent(errorSchema, "Internal server error"),
  };

  for (const [status, config] of Object.entries(customResponses)) {
    responses[parseInt(status)] = jsonContent(
      config.schema ?? errorSchema,
      config.description,
    );
  }

  return responses;
};

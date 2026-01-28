import { z } from "zod";
import * as controller from "./controller";
import { CallSchema, CreateCallSchema, UpdateCallSchema } from "./model";
import { auth } from "~/middlewares";
import {
  createResponses,
  createRoute,
  createRouter,
  jsonRequest,
  jsonResponseSchema,
} from "~/utils";

export const callRoutes = () => {
  const callResponseSchema = jsonResponseSchema(CallSchema);

  return createRouter()
    .openapi(
      createRoute({
        method: "post",
        path: "/",
        middleware: [auth] as const,
        request: jsonRequest(CreateCallSchema),
        responses: createResponses(callResponseSchema, "Initiate call", 201),
        tags: ["Call"],
        security: [{ Bearer: [] }],
      }),
      controller.createCall,
    )
    .openapi(
      createRoute({
        method: "patch",
        path: "/{id}",
        middleware: [auth] as const,
        request: {
          params: z.object({ id: z.string() }),
          body: jsonRequest(UpdateCallSchema).body,
        },
        responses: createResponses(callResponseSchema, "Update call", 200, {
          404: { description: "Call not found" },
        }),
        tags: ["Call"],
        security: [{ Bearer: [] }],
      }),
      controller.updateCall,
    )
    .openapi(
      createRoute({
        method: "get",
        path: "/{id}",
        middleware: [auth] as const,
        request: {
          params: z.object({ id: z.string() }),
        },
        responses: createResponses(
          callResponseSchema,
          "Get call details",
          200,
          {
            404: { description: "Call not found" },
          },
        ),
        tags: ["Call"],
        security: [{ Bearer: [] }],
      }),
      controller.getCall,
    );
};

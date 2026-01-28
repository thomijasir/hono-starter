import { z } from "@hono/zod-openapi";
import { connect } from "./controller";
import { ConnectSchema } from "./model";
import { validator } from "~/middlewares";
import {
  createResponses,
  createRoute,
  createRouter,
  jsonRequest,
  jsonResponseSchema,
} from "~/utils";

export const chatRoutes = () => {
  return createRouter().openapi(
    createRoute({
      method: "post",
      path: "/connect",
      request: jsonRequest(ConnectSchema),
      responses: createResponses(
        jsonResponseSchema(
          z.object({ token: z.string().openapi({ example: "token..." }) }),
        ),
        "connect chat system",
        200,
      ),
      tags: ["Chat"],
    }),
    connect,
  );
};

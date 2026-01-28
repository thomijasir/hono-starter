import { z } from "zod";
import * as controller from "./controller";
import {
  CreateMessageSchema,
  MessageSchema,
  UpdateMessageSchema,
} from "./model";
import { auth } from "~/middlewares";
import {
  createResponses,
  createRoute,
  createRouter,
  jsonRequest,
  jsonResponseSchema,
} from "~/utils";

export const messageRoutes = () => {
  const messageResponseSchema = jsonResponseSchema(MessageSchema);
  const messageListResponseSchema = jsonResponseSchema(z.array(MessageSchema));

  return createRouter()
    .openapi(
      createRoute({
        method: "post",
        path: "/",
        middleware: [auth] as const,
        request: jsonRequest(CreateMessageSchema),
        responses: createResponses(messageResponseSchema, "Send message", 201),
        tags: ["Message"],
        security: [{ Bearer: [] }],
      }),
      controller.sendMessage,
    )
    .openapi(
      createRoute({
        method: "get",
        path: "/conversation/{conversationId}",
        middleware: [auth] as const,
        request: {
          params: z.object({ conversationId: z.string() }),
          query: z.object({
            page: z.string().optional(),
            limit: z.string().optional(),
          }),
        },
        responses: createResponses(
          messageListResponseSchema,
          "Get messages by conversation",
          200,
        ),
        tags: ["Message"],
        security: [{ Bearer: [] }],
      }),
      controller.listMessages,
    )
    .openapi(
      createRoute({
        method: "patch",
        path: "/{id}",
        middleware: [auth] as const,
        request: {
          params: z.object({ id: z.string() }),
          body: jsonRequest(UpdateMessageSchema).body,
        },
        responses: createResponses(
          messageResponseSchema,
          "Update message",
          200,
          {
            404: { description: "Message not found" },
          },
        ),
        tags: ["Message"],
        security: [{ Bearer: [] }],
      }),
      controller.updateMessage,
    );
};

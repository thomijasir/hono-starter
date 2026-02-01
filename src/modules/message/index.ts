import { z } from "zod";
import { listMessages, createMessage, updateMessage } from "./controller";
import {
  MessageSchema,
  RequestCreateMessageSchema,
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
        request: jsonRequest(RequestCreateMessageSchema),
        responses: createResponses(messageResponseSchema, "Send message", 201),
        tags: ["Message"],
        security: [{ ChatBearer: [] }],
      }),
      createMessage,
    )
    .openapi(
      createRoute({
        method: "get",
        path: "/conversation/{conversationId}",
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
      listMessages,
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
      updateMessage,
    );
};

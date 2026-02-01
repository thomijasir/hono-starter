import { z } from "zod";
import * as controller from "./controller";
import {
  ConversationSchema,
  RequestCreateConversationSchema,
  UpdateConversationSchema,
} from "./model";
import { auth } from "~/middlewares";
import {
  createResponses,
  createRoute,
  createRouter,
  jsonRequest,
  jsonResponseSchema,
} from "~/utils";

export const conversationRoutes = () => {
  const conversationResponseSchema = jsonResponseSchema(ConversationSchema);
  const conversationListResponseSchema = jsonResponseSchema(
    z.array(ConversationSchema),
  );

  return createRouter()
    .openapi(
      createRoute({
        method: "get",
        path: "/",
        middleware: [auth] as const,
        request: {
          query: z.object({
            page: z.string().optional(),
            limit: z.string().optional(),
          }),
        },
        responses: createResponses(
          conversationListResponseSchema,
          "Get all conversations",
          200,
        ),
        tags: ["Conversation"],
        security: [{ ChatBearer: [] }],
      }),
      controller.getAllConversations,
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
          conversationResponseSchema,
          "Get conversation by id",
          200,
          {
            404: {
              description: "Conversation not found",
            },
          },
        ),
        tags: ["Conversation"],
        security: [{ ChatBearer: [] }],
      }),
      controller.getConversation,
    )
    .openapi(
      createRoute({
        method: "post",
        path: "/",
        middleware: [auth] as const,
        request: jsonRequest(RequestCreateConversationSchema),
        responses: createResponses(
          conversationResponseSchema,
          "Create conversation",
          201,
        ),
        tags: ["Conversation"],
        security: [{ ChatBearer: [] }],
      }),
      controller.createConversation,
    )
    .openapi(
      createRoute({
        method: "patch",
        path: "/{id}",
        middleware: [auth] as const,
        request: {
          params: z.object({ id: z.string() }),
          body: jsonRequest(UpdateConversationSchema).body,
        },
        responses: createResponses(
          conversationResponseSchema,
          "Update conversation",
          200,
          {
            404: {
              description: "Conversation not found",
            },
          },
        ),
        tags: ["Conversation"],
        security: [{ ChatBearer: [] }],
      }),
      controller.updateConversation,
    )
    .openapi(
      createRoute({
        method: "delete",
        path: "/{id}",
        middleware: [auth] as const,
        request: {
          params: z.object({ id: z.string() }),
        },
        responses: createResponses(
          jsonResponseSchema(z.null()),
          "Delete conversation",
          200,
          {
            404: {
              description: "Conversation not found",
            },
          },
        ),
        tags: ["Conversation"],
        security: [{ ChatBearer: [] }],
      }),
      controller.deleteConversation,
    );
};

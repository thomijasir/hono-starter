import type { ConnectSignatureType } from "../chat/model";
import type {
  ConversationType,
  RequestCreateConversationType,
  UpdateConversationType,
} from "./model";
import * as service from "./service";
import { createHandler, createJsonHandler } from "~/utils";

export const getAllConversations = createHandler(
  async ({ query, state, httpResponse, errorResponse }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const result = await service.listConversations(state, page, limit);

    if (!result.ok) {
      return errorResponse(result.err);
    }

    const { conversations, total } = result.val;
    return httpResponse(
      conversations,
      "Conversations fetched successfully",
      200,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    );
  },
);

export const getConversation = createHandler(
  async ({ params, state, httpResponse, errorResponse }) => {
    const id = params.id;
    if (!id) return errorResponse("ID is required", 400);

    const result = await service.getConversation(state, id);

    if (!result.ok) {
      return errorResponse(result.err, 404);
    }

    return httpResponse(result.val);
  },
);

export const createConversation = createJsonHandler<
  RequestCreateConversationType,
  ConversationType,
  ConnectSignatureType
>(async ({ claim, body, state, httpResponse, errorResponse }) => {
  // TODO: for enhancement before create the conversation we have to check is user available in chat_user table or not if yes then proceed
  const result = await service.createConversationWithParticipants(
    state,
    body,
    claim,
  );

  if (!result.ok) {
    return errorResponse(result.err);
  }

  return httpResponse(result.val, "Conversation created successfully", 201);
});

export const updateConversation = createJsonHandler<
  UpdateConversationType,
  ConversationType
>(async ({ params, body, state, httpResponse, errorResponse }) => {
  const id = params.id;
  if (!id) return errorResponse("ID is required", 400);
  const result = await service.updateConversation(state, id, body);

  if (!result.ok) {
    // Simple error handling, could be more granular based on error type
    return errorResponse(result.err);
  }

  return httpResponse(
    result.val as ConversationType,
    "Conversation updated successfully",
  );
});

export const deleteConversation = createHandler(
  async ({ params, state, httpResponse, errorResponse }) => {
    const id = params.id;
    if (!id) return errorResponse("ID is required", 400);
    const result = await service.removeConversation(state, id);

    if (!result.ok) {
      return errorResponse(result.err);
    }

    return httpResponse(null, "Conversation deleted successfully");
  },
);

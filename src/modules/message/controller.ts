import type { ConnectSignatureType } from "../chat/model";
import type {
  CreateMessageType,
  Message,
  RequestCreateMessageType,
} from "./model";
import * as service from "./service";
import { createJsonHandler, createHandler } from "~/utils";

export const createMessage = createJsonHandler<
  RequestCreateMessageType,
  Message,
  ConnectSignatureType
>(async ({ body, claim, state, httpResponse, errorResponse }) => {
  const result = await service.sendMessage(state, claim, body);

  if (!result.ok) {
    return errorResponse(result.err);
  }

  return httpResponse(result.val, "Message sent successfully", 201);
});

export const listMessages = createHandler(
  async ({ params, query, state, httpResponse, errorResponse }) => {
    const conversationId = params.conversationId;
    if (!conversationId)
      return errorResponse("Conversation ID is required", 400);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const result = await service.getMessages(
      state,
      conversationId,
      page,
      limit,
    );

    if (!result.ok) {
      return errorResponse(result.err);
    }

    const { messages, total } = result.val;
    return httpResponse(messages, "Messages fetched successfully", 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  },
);

export const updateMessage = createJsonHandler<CreateMessageType, object>(
  ({ httpResponse }) => {
    // TODO: new feature for update message
    return httpResponse(
      { todo: "feature will develop" },
      "update message",
      200,
    );
  },
);

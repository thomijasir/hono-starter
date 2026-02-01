import type { ConnectSignatureType } from "../chat/model";
import type { RequestCreateMessageType } from "./model";
import {
  findMessagesByConversationId,
  saveNewMessage,
  updateMessage,
} from "./repository";
import type { AppState } from "~/models";
import { Err, generateUUID, Ok } from "~/utils";

export const sendMessage = async (
  state: AppState,
  claim: ConnectSignatureType,
  payload: RequestCreateMessageType,
) => {
  const newMessagePayload = {
    id: generateUUID(),
    senderId: claim.externalId,
    ...payload,
  };
  const result = await saveNewMessage(state, newMessagePayload);

  if (result.ok) {
    return Ok(result.val);
  }
  return Err(result.err);
};

export const getMessages = async (
  state: AppState,
  conversationId: string,
  page: number,
  limit: number,
) => {
  return await findMessagesByConversationId(state, conversationId, page, limit);
};

export const editMessage = async (
  state: AppState,
  id: string,
  payload: { content?: string; metadata?: Record<string, string> },
) => {
  // TODO: Verify senderId matches current user (Authorization)
  // For now, we assume controller/middleware handles basic auth checks,
  // but row-level security (is this MY message?) needs to be added here or in repo.
  return await updateMessage(state, id, payload);
};

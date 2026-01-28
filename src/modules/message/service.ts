import type { CreateMessageType } from "./model";
import * as Repository from "./repository";
import type { AppState } from "~/model";

export const sendMessage = async (
  state: AppState,
  payload: CreateMessageType,
) => {
  // Logic: verify sender is participant of conversation?
  // Skipping for now to keep it simple as requested
  return await Repository.saveNewMessage(state, payload);
};

export const getMessages = async (
  state: AppState,
  conversationId: string,
  page: number,
  limit: number,
) => {
  return await Repository.findMessagesByConversationId(
    state,
    conversationId,
    page,
    limit,
  );
};

export const editMessage = async (
  state: AppState,
  id: string,
  payload: { content?: string; metadata?: Record<string, any> },
) => {
  // TODO: Verify senderId matches current user (Authorization)
  // For now, we assume controller/middleware handles basic auth checks,
  // but row-level security (is this MY message?) needs to be added here or in repo.
  return await Repository.updateMessage(state, id, payload);
};

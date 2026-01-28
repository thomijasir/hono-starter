import type {
  CreateConversationPayload,
  UpdateConversationPayload,
} from "./model";
import * as Repository from "./repository";
import type { AppState } from "~/model";
import { Err } from "~/utils";

export const createConversation = async (
  state: AppState,
  payload: CreateConversationPayload,
) => {
  // Business logic validation could go here
  if (payload.type === "GROUP" && !payload.name) {
    // It's just a warning or logic, but for now we follow schema which makes name optional.
    // Maybe enforce name for groups?
  }

  if (
    payload.type === "DIRECT" &&
    payload.participants &&
    payload.participants.length !== 2
  ) {
    // Logic for direct message: exactly 2 participants?
    // Leaving loose for now as per minimal requirements
  }

  return await Repository.saveNewConversation(state, payload);
};

export const getConversation = async (state: AppState, id: string) => {
  return await Repository.findConversationById(state, id);
};

export const listConversations = async (
  state: AppState,
  page: number,
  limit: number,
) => {
  return await Repository.findAllConversations(state, page, limit);
};

export const updateConversation = async (
  state: AppState,
  id: string,
  payload: UpdateConversationPayload,
) => {
  const existing = await Repository.findConversationById(state, id);
  if (!existing.ok) return Err("Conversation not found");

  return await Repository.saveConversation(state, id, payload);
};

export const removeConversation = async (state: AppState, id: string) => {
  const existing = await Repository.findConversationById(state, id);
  if (!existing.ok) return Err("Conversation not found");

  return await Repository.deleteConversationById(state, id);
};

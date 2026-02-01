import type { ConnectSignatureType } from "../chat/model";
import type {
  CreateConversationType,
  RequestCreateConversationType,
  UpdateConversationType,
} from "./model";
import {
  deleteConversationById,
  findAllConversations,
  findConversationById,
  saveConversation,
  saveNewConversation,
  saveNewConversationWithParticipants,
} from "./repository";
import type { AppState } from "~/models";
import { Err, generateUUID, Ok } from "~/utils";

export const createConversation = async (
  state: AppState,
  payload: CreateConversationType,
) => {
  return await saveNewConversation(state, payload);
};

export const getConversation = async (state: AppState, id: string) => {
  return await findConversationById(state, id);
};

export const createConversationWithParticipants = async (
  state: AppState,
  payload: RequestCreateConversationType,
  claim: ConnectSignatureType,
) => {
  let conversationType = "DIRECT";
  if (payload.participants.length > 1) {
    conversationType = "GROUP";
  }
  const id = generateUUID();

  const result = await saveNewConversationWithParticipants(state, {
    id,
    appId: claim.appId,
    type: conversationType,
    name: payload.name,
    adminId: claim.externalId,
    participants: payload.participants,
  });

  if (!result.ok) {
    return Err(result.err);
  }

  return Ok(result.val);
};

export const listConversations = async (
  state: AppState,
  page: number,
  limit: number,
) => {
  return await findAllConversations(state, page, limit);
};

export const updateConversation = async (
  state: AppState,
  id: string,
  payload: UpdateConversationType,
) => {
  const existing = await findConversationById(state, id);
  if (!existing.ok) return Err("Conversation not found");

  return await saveConversation(state, id, payload);
};

export const removeConversation = async (state: AppState, id: string) => {
  const existing = await findConversationById(state, id);
  if (!existing.ok) return Err("Conversation not found");

  return await deleteConversationById(state, id);
};

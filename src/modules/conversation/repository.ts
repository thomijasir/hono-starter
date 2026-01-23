import { eq, and, exists, sql } from "drizzle-orm";
import type {
  CreateConversationPayload,
  UpdateConversationPayload,
} from "./model";
import type { AppState } from "~/model";
import type { ConversationModel } from "~/schemas/default";
import { conversation, participant } from "~/schemas/default";
import type { ResultType } from "~/utils";
import { Err, Ok, Result, generateUUID } from "~/utils";

export const findConversationById = async (
  state: AppState,
  id: string,
): Promise<ResultType<ConversationModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(conversation).where(eq(conversation.id, id)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  const found = result.val[0];
  if (!found) {
    return Err("Conversation not found");
  }

  return Ok(found);
};

export const findConversationsByAppId = async (
  state: AppState,
  appId: string,
): Promise<ResultType<ConversationModel[], string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(conversation).where(eq(conversation.appId, appId)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  return Ok(result.val);
};

export const findConversationsByUserId = async (
  state: AppState,
  userId: string,
): Promise<ResultType<ConversationModel[], string>> => {
  const { db } = state;

  // Select conversations where the user is a participant
  const result = await Result.async(
    db
      .select()
      .from(conversation)
      .where(
        exists(
          db
            .select()
            .from(participant)
            .where(
              and(
                eq(participant.conversationId, conversation.id),
                eq(participant.userId, userId),
              ),
            ),
        ),
      ),
  );

  if (!result.ok) {
    return Err("database error");
  }

  return Ok(result.val);
};

export const saveNewConversation = async (
  state: AppState,
  payload: CreateConversationPayload,
): Promise<ResultType<ConversationModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .insert(conversation)
      .values({
        ...payload,
        id: generateUUID(),
      })
      .returning(),
  );

  if (!result.ok) {
    return Err("failed insert conversation");
  }

  const created = result.val[0];
  if (!created) {
    return Err("failed insert conversation");
  }

  return Ok(created);
};

export const saveConversation = async (
  state: AppState,
  id: string,
  payload: UpdateConversationPayload,
): Promise<ResultType<ConversationModel, string>> => {
  const { db } = state;
  const changeSet = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  const result = await Result.async(
    db
      .update(conversation)
      .set(changeSet)
      .where(eq(conversation.id, id))
      .returning(),
  );

  if (!result.ok) {
    return Err("failed update conversation");
  }

  const updated = result.val[0];
  if (!updated) {
    return Err("failed update conversation");
  }

  return Ok(updated);
};

export const deleteConversationById = async (
  state: AppState,
  id: string,
): Promise<ResultType<void, string>> => {
  const { db } = state;
  const result = await Result.async(
    db.delete(conversation).where(eq(conversation.id, id)),
  );

  if (!result.ok) {
    return Err("failed delete conversation");
  }

  return Ok(undefined);
};

import { eq, sql } from "drizzle-orm";
import type {
  CreateConversationPayload,
  UpdateConversationPayload,
} from "./model";
import type { AppState } from "~/model";
import { conversations, participants } from "~/schemas/default";
import { Err, Ok, Result } from "~/utils";

export const findConversationById = async (state: AppState, id: string) => {
  const result = await Result.async(
    state.db.select().from(conversations).where(eq(conversations.id, id)),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  if (result.val.length === 0) {
    return Err("Conversation not found");
  }

  return Ok(result.val[0]);
};

export const findAllConversations = async (
  state: AppState,
  page: number = 1,
  limit: number = 10,
) => {
  const offset = (page - 1) * limit;

  const result = await Result.async(
    state.db.select().from(conversations).limit(limit).offset(offset),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  const total = await Result.async(
    state.db.select({ count: sql<number>`count(*)` }).from(conversations),
  );
  const totalCount = total.ok && total.val[0] ? total.val[0].count : 0;

  return Ok({ conversations: result.val, total: totalCount });
};

export const saveNewConversation = async (
  state: AppState,
  payload: CreateConversationPayload,
) => {
  const { participants: participantIds, ...conversationData } = payload;

  // Generate ID explicitly since we are using text primary key for conversations
  const id = crypto.randomUUID();

  // Transaction to create conversation and add participants
  const transactionResult = await Result.async(
    state.db.transaction(async (tx) => {
      const [newConversation] = await tx
        .insert(conversations)
        .values({ ...conversationData, id })
        .returning();

      if (participantIds && participantIds.length > 0 && newConversation) {
        await tx.insert(participants).values(
          participantIds.map((userId) => ({
            conversationId: newConversation.id,
            userId,
          })),
        );
      }

      if (!newConversation) return undefined;
      return newConversation;
    }),
  );

  if (!transactionResult.ok) {
    return Err(transactionResult.err);
  }

  if (!transactionResult.val) {
    return Err("Failed to create conversation");
  }

  return Ok(transactionResult.val);
};

export const saveConversation = async (
  state: AppState,
  id: string,
  payload: UpdateConversationPayload,
) => {
  const result = await Result.async(
    state.db
      .update(conversations)
      .set({ ...payload, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(conversations.id, id))
      .returning(),
  );

  if (!result.ok) return Err(result.err);
  if (result.val.length === 0) return Err("Conversation not found");

  return Ok(result.val[0]);
};

export const deleteConversationById = async (state: AppState, id: string) => {
  const result = await Result.async(
    state.db.delete(conversations).where(eq(conversations.id, id)),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  return Ok(null);
};

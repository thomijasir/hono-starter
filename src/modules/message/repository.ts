import { eq, sql } from "drizzle-orm";
import type { CreateMessageType } from "./model";
import type { AppState } from "~/models";
import { messages } from "~/schemas/default";
import { Err, Ok, Result } from "~/utils";

export const findMessageById = async (state: AppState, id: string) => {
  const result = await Result.async(
    state.db.select().from(messages).where(eq(messages.id, id)),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  if (result.val.length === 0) {
    return Err("Message not found");
  }

  return Ok(result.val[0]);
};

export const findMessagesByConversationId = async (
  state: AppState,
  conversationId: string,
  page: number = 1,
  limit: number = 20,
) => {
  const offset = (page - 1) * limit;

  const result = await Result.async(
    state.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(sql`${messages.createdAt} DESC`) // Newest first usually
      .limit(limit)
      .offset(offset),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  const total = await Result.async(
    state.db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(eq(messages.conversationId, conversationId)),
  );

  const totalCount = total.ok && total.val[0] ? total.val[0].count : 0;

  return Ok({ messages: result.val, total: totalCount });
};

export const saveNewMessage = async (
  state: AppState,
  payload: CreateMessageType,
) => {
  const result = await Result.async(
    state.db.insert(messages).values(payload).returning(),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  const newMessage = result.val[0];
  if (!newMessage) {
    return Err("message not created");
  }

  return Ok(newMessage);
};

export const updateMessage = async (
  state: AppState,
  id: string,
  payload: Partial<CreateMessageType>,
) => {
  const result = await Result.async(
    state.db
      .update(messages)
      .set(payload)
      // TODO: Add updatedAt column to messages table in schema
      .where(eq(messages.id, id))
      .returning(),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  if (result.val.length === 0) {
    return Err("Message not found");
  }

  return Ok(result.val[0]);
};

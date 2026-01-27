import { eq } from "drizzle-orm";
import type { CreateMessageType } from "./model";
import type { AppState } from "~/model";
import type { MessagesModel } from "~/schemas/default";
import { messages } from "~/schemas/default";
import type { ResultType } from "~/utils";
import { Err, Ok, Result, generateUUID } from "~/utils";

export const saveNewMessage = async (
  state: AppState,
  payload: CreateMessageType,
): Promise<ResultType<MessagesModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .insert(messages)
      .values({
        ...payload,
        id: generateUUID(),
      })
      .returning(),
  );

  if (!result.ok) {
    return Err("failed insert messages");
  }

  const created = result.val[0];
  if (!created) {
    return Err("failed insert messages");
  }

  return Ok(created);
};

export const findMessagesByConversationId = async (
  state: AppState,
  conversationId: string,
): Promise<ResultType<MessagesModel[], string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  return Ok(result.val);
};

export const deleteMessageById = async (
  state: AppState,
  id: string,
): Promise<ResultType<void, string>> => {
  const { db } = state;
  const result = await Result.async(
    db.delete(messages).where(eq(messages.id, id)),
  );

  if (!result.ok) {
    return Err("failed delete messages");
  }

  return Ok(undefined);
};

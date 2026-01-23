import { eq } from "drizzle-orm";
import type { CreateMessagePayload } from "./model";
import type { AppState } from "~/model";
import type { MessageModel } from "~/schemas/default";
import { message } from "~/schemas/default";
import type { ResultType } from "~/utils";
import { Err, Ok, Result, generateUUID } from "~/utils";

export const saveNewMessage = async (
  state: AppState,
  payload: CreateMessagePayload,
): Promise<ResultType<MessageModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .insert(message)
      .values({
        ...payload,
        id: generateUUID(),
      })
      .returning(),
  );

  if (!result.ok) {
    return Err("failed insert message");
  }

  const created = result.val[0];
  if (!created) {
    return Err("failed insert message");
  }

  return Ok(created);
};

export const findMessagesByConversationId = async (
  state: AppState,
  conversationId: string,
): Promise<ResultType<MessageModel[], string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(message).where(eq(message.conversationId, conversationId)),
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
    db.delete(message).where(eq(message.id, id)),
  );

  if (!result.ok) {
    return Err("failed delete message");
  }

  return Ok(undefined);
};

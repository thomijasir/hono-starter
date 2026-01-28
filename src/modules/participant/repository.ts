import { eq, and } from "drizzle-orm";
import type { AddParticipantType, UpdateParticipantType } from "./model";
import type { AppState } from "~/model";
import type { ParticipantsModel } from "~/schemas/default";
import { participants } from "~/schemas/default";
import type { ResultType } from "~/utils";
import { Err, Ok, Result, nowDate } from "~/utils";

export const addParticipant = async (
  state: AppState,
  payload: AddParticipantType,
): Promise<ResultType<ParticipantsModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .insert(participants)
      .values({
        ...payload,
        joinedAt: nowDate(),
      })
      .returning(),
  );

  if (!result.ok) {
    return Err("failed add participants");
  }

  const added = result.val[0];
  if (!added) {
    return Err("failed add participants");
  }

  return Ok(added);
};

export const findParticipantsByConversationId = async (
  state: AppState,
  conversationId: string,
): Promise<ResultType<ParticipantsModel[], string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .select()
      .from(participants)
      .where(eq(participants.conversationId, conversationId)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  return Ok(result.val);
};

export const findParticipantsByUserId = async (
  state: AppState,
  userId: string,
): Promise<ResultType<ParticipantsModel[], string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(participants).where(eq(participants.userId, userId)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  return Ok(result.val);
};

export const findParticipant = async (
  state: AppState,
  conversationId: string,
  userId: string,
): Promise<ResultType<ParticipantsModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.conversationId, conversationId),
          eq(participants.userId, userId),
        ),
      ),
  );

  if (!result.ok) {
    return Err("database error");
  }

  const found = result.val[0];
  if (!found) {
    return Err("participants not found");
  }

  return Ok(found);
};

export const updateParticipant = async (
  state: AppState,
  conversationId: string,
  userId: string,
  payload: UpdateParticipantType,
): Promise<ResultType<ParticipantsModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .update(participants)
      .set(payload)
      .where(
        and(
          eq(participants.conversationId, conversationId),
          eq(participants.userId, userId),
        ),
      )
      .returning(),
  );

  if (!result.ok) {
    return Err("failed update participants");
  }

  const updated = result.val[0];
  if (!updated) {
    return Err("failed update participants");
  }

  return Ok(updated);
};

export const removeParticipant = async (
  state: AppState,
  conversationId: string,
  userId: string,
): Promise<ResultType<void, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .delete(participants)
      .where(
        and(
          eq(participants.conversationId, conversationId),
          eq(participants.userId, userId),
        ),
      ),
  );

  if (!result.ok) {
    return Err("failed remove participants");
  }

  return Ok(undefined);
};

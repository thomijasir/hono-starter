import { eq, and } from "drizzle-orm";
import type { AddParticipantPayload, UpdateParticipantPayload } from "./model";
import type { AppState } from "~/model";
import type { ParticipantModel } from "~/schemas/default";
import { participant } from "~/schemas/default";
import type { ResultType } from "~/utils";
import { Err, Ok, Result, nowDate } from "~/utils";

export const addParticipant = async (
  state: AppState,
  payload: AddParticipantPayload,
): Promise<ResultType<ParticipantModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .insert(participant)
      .values({
        ...payload,
        joinedAt: nowDate(),
      })
      .returning(),
  );

  if (!result.ok) {
    return Err("failed add participant");
  }

  const added = result.val[0];
  if (!added) {
    return Err("failed add participant");
  }

  return Ok(added);
};

export const findParticipantsByConversationId = async (
  state: AppState,
  conversationId: string,
): Promise<ResultType<ParticipantModel[], string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .select()
      .from(participant)
      .where(eq(participant.conversationId, conversationId)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  return Ok(result.val);
};

export const findParticipantsByUserId = async (
  state: AppState,
  userId: string,
): Promise<ResultType<ParticipantModel[], string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(participant).where(eq(participant.userId, userId)),
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
): Promise<ResultType<ParticipantModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .select()
      .from(participant)
      .where(
        and(
          eq(participant.conversationId, conversationId),
          eq(participant.userId, userId),
        ),
      ),
  );

  if (!result.ok) {
    return Err("database error");
  }

  const found = result.val[0];
  if (!found) {
    return Err("Participant not found");
  }

  return Ok(found);
};

export const updateParticipant = async (
  state: AppState,
  conversationId: string,
  userId: string,
  payload: UpdateParticipantPayload,
): Promise<ResultType<ParticipantModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .update(participant)
      .set(payload)
      .where(
        and(
          eq(participant.conversationId, conversationId),
          eq(participant.userId, userId),
        ),
      )
      .returning(),
  );

  if (!result.ok) {
    return Err("failed update participant");
  }

  const updated = result.val[0];
  if (!updated) {
    return Err("failed update participant");
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
      .delete(participant)
      .where(
        and(
          eq(participant.conversationId, conversationId),
          eq(participant.userId, userId),
        ),
      ),
  );

  if (!result.ok) {
    return Err("failed remove participant");
  }

  return Ok(undefined);
};

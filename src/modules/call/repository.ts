import { eq } from "drizzle-orm";
import type { CreateCallType, UpdateCallType } from "./model";
import type { AppState } from "~/model";
import type { CallsModel } from "~/schemas/default";
import { calls } from "~/schemas/default";
import type { ResultType } from "~/utils";
import { Err, Ok, Result, generateUUID } from "~/utils";

export const saveNewCall = async (
  state: AppState,
  payload: CreateCallType,
): Promise<ResultType<CallsModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .insert(calls)
      .values({
        ...payload,
        id: generateUUID(),
      })
      .returning(),
  );

  if (!result.ok) {
    return Err("failed insert calls");
  }

  const created = result.val[0];
  if (!created) {
    return Err("failed insert calls");
  }

  return Ok(created);
};

export const findCallById = async (
  state: AppState,
  id: string,
): Promise<ResultType<CallsModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(calls).where(eq(calls.id, id)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  const found = result.val[0];
  if (!found) {
    return Err("calls not found");
  }

  return Ok(found);
};

export const findCallsByConversationId = async (
  state: AppState,
  conversationId: string,
): Promise<ResultType<CallsModel[], string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(calls).where(eq(calls.conversationId, conversationId)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  return Ok(result.val);
};

export const findCallsByCallerId = async (
  state: AppState,
  callerId: string,
): Promise<ResultType<CallsModel[], string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(calls).where(eq(calls.callerId, callerId)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  return Ok(result.val);
};

export const saveCall = async (
  state: AppState,
  id: string,
  payload: UpdateCallType,
): Promise<ResultType<CallsModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db.update(calls).set(payload).where(eq(calls.id, id)).returning(),
  );

  if (!result.ok) {
    return Err("failed update calls");
  }

  const updated = result.val[0];
  if (!updated) {
    return Err("failed update calls");
  }

  return Ok(updated);
};

export const deleteCallById = async (
  state: AppState,
  id: string,
): Promise<ResultType<void, string>> => {
  const { db } = state;
  const result = await Result.async(db.delete(calls).where(eq(calls.id, id)));

  if (!result.ok) {
    return Err("failed delete calls");
  }

  return Ok(undefined);
};

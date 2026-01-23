import { eq } from "drizzle-orm";
import type { CreateCallPayload, UpdateCallPayload } from "./model";
import type { AppState } from "~/model";
import type { CallModel } from "~/schemas/default";
import { call } from "~/schemas/default";
import type { ResultType } from "~/utils";
import { Err, Ok, Result, generateUUID } from "~/utils";

export const saveNewCall = async (
  state: AppState,
  payload: CreateCallPayload,
): Promise<ResultType<CallModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .insert(call)
      .values({
        ...payload,
        id: generateUUID(),
      })
      .returning(),
  );

  if (!result.ok) {
    return Err("failed insert call");
  }

  const created = result.val[0];
  if (!created) {
    return Err("failed insert call");
  }

  return Ok(created);
};

export const findCallById = async (
  state: AppState,
  id: string,
): Promise<ResultType<CallModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(call).where(eq(call.id, id)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  const found = result.val[0];
  if (!found) {
    return Err("Call not found");
  }

  return Ok(found);
};

export const findCallsByConversationId = async (
  state: AppState,
  conversationId: string,
): Promise<ResultType<CallModel[], string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(call).where(eq(call.conversationId, conversationId)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  return Ok(result.val);
};

export const findCallsByCallerId = async (
  state: AppState,
  callerId: string,
): Promise<ResultType<CallModel[], string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(call).where(eq(call.callerId, callerId)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  return Ok(result.val);
};

export const saveCall = async (
  state: AppState,
  id: string,
  payload: UpdateCallPayload,
): Promise<ResultType<CallModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db.update(call).set(payload).where(eq(call.id, id)).returning(),
  );

  if (!result.ok) {
    return Err("failed update call");
  }

  const updated = result.val[0];
  if (!updated) {
    return Err("failed update call");
  }

  return Ok(updated);
};

export const deleteCallById = async (
  state: AppState,
  id: string,
): Promise<ResultType<void, string>> => {
  const { db } = state;
  const result = await Result.async(db.delete(call).where(eq(call.id, id)));

  if (!result.ok) {
    return Err("failed delete call");
  }

  return Ok(undefined);
};

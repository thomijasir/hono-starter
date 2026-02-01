import { eq } from "drizzle-orm";
import type { CreateCallType, UpdateCallType } from "./model";
import type { AppState } from "~/models";
import { calls } from "~/schemas/default";
import { Err, Ok, Result } from "~/utils";

export const findCallById = async (state: AppState, id: string) => {
  const result = await Result.async(
    state.db.select().from(calls).where(eq(calls.id, id)),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  if (result.val.length === 0) {
    return Err("Call not found");
  }

  return Ok(result.val[0]);
};

export const saveNewCall = async (state: AppState, payload: CreateCallType) => {
  const id = crypto.randomUUID();
  const result = await Result.async(
    state.db
      .insert(calls)
      .values({ ...payload, id })
      .returning(),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  return Ok(result.val[0]);
};

export const saveCall = async (
  state: AppState,
  id: string,
  payload: UpdateCallType,
) => {
  const result = await Result.async(
    state.db.update(calls).set(payload).where(eq(calls.id, id)).returning(),
  );

  if (!result.ok) {
    return Err(result.err);
  }

  if (result.val.length === 0) {
    return Err("Call not found");
  }

  return Ok(result.val[0]);
};

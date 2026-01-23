import { eq } from "drizzle-orm";
import type { CreateAppClientPayload, UpdateAppClientPayload } from "./model";
import type { AppState } from "~/model";
import type { AppClientModel } from "~/schemas/default";
import { appClient } from "~/schemas/default";
import type { ResultType } from "~/utils";
import { Err, Ok, Result, generateUUID } from "~/utils";

export const findAppClientById = async (
  state: AppState,
  id: string,
): Promise<ResultType<AppClientModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(appClient).where(eq(appClient.id, id)),
  );

  if (!result.ok) {
    return Err("database error");
  }

  const client = result.val[0];
  if (!client) {
    return Err("App client not found");
  }

  return Ok(client);
};

export const findAllAppClients = async (
  state: AppState,
): Promise<ResultType<AppClientModel[], string>> => {
  const { db } = state;
  const result = await Result.async(db.select().from(appClient));

  if (!result.ok) {
    return Err("database error");
  }

  return Ok(result.val);
};

export const saveNewAppClient = async (
  state: AppState,
  payload: CreateAppClientPayload,
): Promise<ResultType<AppClientModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .insert(appClient)
      .values({
        ...payload,
        id: generateUUID,
      })
      .returning(),
  );

  if (!result.ok) {
    return Err("failed insert app client");
  }

  const client = result.val[0];
  if (!client) {
    return Err("failed insert app client");
  }

  return Ok(client);
};

export const saveAppClient = async (
  state: AppState,
  id: string,
  payload: UpdateAppClientPayload,
): Promise<ResultType<AppClientModel, string>> => {
  const { db } = state;
  const changeSet = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  const result = await Result.async(
    db.update(appClient).set(changeSet).where(eq(appClient.id, id)).returning(),
  );

  if (!result.ok) {
    return Err("failed update app client");
  }

  const updatedClient = result.val[0];
  if (!updatedClient) {
    return Err("failed update app client");
  }

  return Ok(updatedClient);
};

export const deleteAppClientById = async (
  state: AppState,
  id: string,
): Promise<ResultType<void, string>> => {
  const { db } = state;
  const result = await Result.async(
    db.delete(appClient).where(eq(appClient.id, id)),
  );

  if (!result.ok) {
    return Err("failed delete app client");
  }

  return Ok(undefined);
};

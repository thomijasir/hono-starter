import { eq } from "drizzle-orm";
import type { CreateAppClientType, UpdateAppClientType } from "./model";
import type { AppState } from "~/models";
import type { AppClientsModel } from "~/schemas/default";
import { appClients } from "~/schemas/default";
import type { ResultType } from "~/utils";
import { Err, Ok, Result, generateUUID } from "~/utils";

export const findAppClientById = async (
  state: AppState,
  id: string,
): Promise<ResultType<AppClientsModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db.select().from(appClients).where(eq(appClients.id, id)),
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
): Promise<ResultType<AppClientsModel[], string>> => {
  const { db } = state;
  const result = await Result.async(db.select().from(appClients));

  if (!result.ok) {
    return Err("database error");
  }

  return Ok(result.val);
};

export const saveNewAppClient = async (
  state: AppState,
  payload: CreateAppClientType,
): Promise<ResultType<AppClientsModel, string>> => {
  const { db } = state;
  const result = await Result.async(
    db
      .insert(appClients)
      .values({
        ...payload,
        id: generateUUID(),
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
  payload: UpdateAppClientType,
): Promise<ResultType<AppClientsModel, string>> => {
  const { db } = state;
  const changeSet = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  const result = await Result.async(
    db
      .update(appClients)
      .set(changeSet)
      .where(eq(appClients.id, id))
      .returning(),
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
    db.delete(appClients).where(eq(appClients.id, id)),
  );

  if (!result.ok) {
    return Err("failed delete app client");
  }

  return Ok(undefined);
};

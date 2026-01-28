import type { CreateAppClientType, UpdateAppClientType } from "./model";
import {
  findAllAppClients,
  saveAppClient,
  saveNewAppClient,
  deleteAppClientById,
} from "./repository";
import type { AppClientsModel } from "~/schemas/default";
import { createHandler, createJsonHandler } from "~/utils";

export const getAppClient = createHandler<AppClientsModel[]>(
  async ({ state, httpResponse, errorResponse }) => {
    const appClients = await findAllAppClients(state);
    if (!appClients.ok) {
      return errorResponse(appClients.err);
    }
    return httpResponse(appClients.val);
  },
);

export const createNewAppClient = createJsonHandler<CreateAppClientType>(
  async ({ body, state, httpResponse, errorResponse }) => {
    const appClient = await saveNewAppClient(state, body);
    if (!appClient.ok) {
      return errorResponse(appClient.err);
    }
    return httpResponse(appClient.val);
  },
);

export const updateAppClient = createJsonHandler<UpdateAppClientType>(
  async ({ params, body, state, httpResponse, errorResponse }) => {
    if (!params.id) {
      return errorResponse("params id required");
    }
    const appClient = await saveAppClient(state, params.id, body);
    if (!appClient.ok) {
      return errorResponse(appClient.err);
    }
    return httpResponse(appClient.val);
  },
);

export const deleteAppClient = createHandler(
  async ({ params, state, httpResponse, errorResponse }) => {
    if (!params.id) {
      return errorResponse("params id required");
    }
    const result = await deleteAppClientById(state, params.id);
    if (!result.ok) {
      return errorResponse(result.err);
    }
    return httpResponse(result.val);
  },
);

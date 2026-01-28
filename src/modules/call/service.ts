import type { CreateCallType } from "./model";
import * as Repository from "./repository";
import type { AppState } from "~/model";

export const initiateCall = async (
  state: AppState,
  payload: CreateCallType,
) => {
  // Logic: check if conversation exists?
  return await Repository.saveNewCall(state, payload);
};

export const endCall = async (state: AppState, id: string) => {
  return await Repository.saveCall(state, id, {
    status: "ENDED",
    endedAt: new Date().toISOString(),
  });
};

export const getCall = async (state: AppState, id: string) => {
  return await Repository.findCallById(state, id);
};

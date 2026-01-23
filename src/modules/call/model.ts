import type { CallModel } from "~/schemas/default";

export type CreateCallPayload = Omit<CallModel, "id" | "endedAt">;

export type UpdateCallPayload = Partial<Pick<CallModel, "endedAt" | "status">>;

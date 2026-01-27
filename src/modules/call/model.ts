import type { CallsModel } from "~/schemas/default";

export type CreateCallType = Omit<CallsModel, "id" | "endedAt">;

export type UpdateCallType = Partial<Pick<CallsModel, "endedAt" | "status">>;

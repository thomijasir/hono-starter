import type { AppClientModel } from "~/schemas/default";

export type CreateAppClientPayload = Omit<
  AppClientModel,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateAppClientPayload = Partial<CreateAppClientPayload>;

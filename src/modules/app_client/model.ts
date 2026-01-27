import type { AppClientsModel } from "~/schemas/default";

export type CreateAppClientType = Omit<
  AppClientsModel,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateAppClientType = Partial<CreateAppClientType>;

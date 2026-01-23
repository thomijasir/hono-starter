import type { MessageModel } from "~/schemas/default";

export type CreateMessagePayload = Omit<MessageModel, "id" | "createdAt">;

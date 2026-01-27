import type { MessagesModel } from "~/schemas/default";

export type CreateMessageType = Omit<MessagesModel, "id" | "createdAt">;

import type { ConversationModel } from "~/schemas/default";

export type CreateConversationPayload = Omit<
  ConversationModel,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateConversationPayload = Partial<CreateConversationPayload>;

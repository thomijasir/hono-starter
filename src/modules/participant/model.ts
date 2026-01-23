import type { ParticipantModel } from "~/schemas/default";

export type AddParticipantPayload = Pick<
  ParticipantModel,
  "conversationId" | "userId"
>;

export type UpdateParticipantPayload = Partial<
  Pick<ParticipantModel, "lastReadAt" | "lastReadMessageId">
>;

import type { ParticipantsModel } from "~/schemas/default";

export type AddParticipantType = Pick<
  ParticipantsModel,
  "conversationId" | "userId"
>;

export type UpdateParticipantType = Partial<
  Pick<ParticipantsModel, "lastReadAt" | "lastReadMessageId">
>;

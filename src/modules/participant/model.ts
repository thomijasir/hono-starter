import { z } from "@hono/zod-openapi";
import type { ParticipantsModel } from "~/schemas/default";

export const CreateParticipantSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  userId: z.string().min(1, "User ID is required"),
  lastReadAt: z.string().optional(),
  lastReadMessageId: z.string().nullable().optional(),
});

export type CreateParticipantSchema = z.infer<typeof CreateParticipantSchema>;

export const ParticipantSchema = z.object({
  id: z.string({ message: "Invalid ID format" }),
  conversationId: z.string().min(1, "Conversation ID is required"),
  userId: z.string().min(1, "User ID is required"),
  joinedAt: z
    .string()
    .optional()
    .default(() => new Date().toISOString()),
  lastReadAt: z.string().optional(),
  lastReadMessageId: z.string().nullable().optional(),
});

// Infer the TypeScript type from the schema
export type ParticipantType = z.infer<typeof ParticipantSchema>;

export type UpdateParticipantType = Partial<
  Pick<ParticipantsModel, "lastReadAt" | "lastReadMessageId">
>;

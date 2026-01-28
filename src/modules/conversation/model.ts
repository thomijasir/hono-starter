import { z } from "zod";
import type { ConversationModel } from "~/schemas/default";

export const CreateConversationSchema = z.object({
  appId: z.string(),
  type: z.enum(["DIRECT", "GROUP"]),
  name: z.string().optional(),
  adminId: z.string().optional(),
  participants: z.array(z.string()).optional(), // List of user IDs to add immediately
});

export const UpdateConversationSchema = z.object({
  name: z.string().optional(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  appId: z.string(),
  type: z.string(),
  name: z.string().nullable(),
  adminId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateConversationPayload = z.infer<
  typeof CreateConversationSchema
>;
export type UpdateConversationPayload = z.infer<
  typeof UpdateConversationSchema
>;
export type Conversation = ConversationModel;

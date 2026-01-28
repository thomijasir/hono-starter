import { z } from "zod";
import type { MessagesModel } from "~/schemas/default";

export const CreateMessageSchema = z.object({
  conversationId: z.string(),
  senderId: z.string(), // In real app, this might come from auth context, but schema allows validaton
  type: z.enum(["TEXT", "IMAGE", "DOCUMENT", "AUDIO", "CALL"]),
  content: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const UpdateMessageSchema = z.object({
  content: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  type: z.string(),
  content: z.string().nullable(),
  metadata: z.record(z.string(), z.any()).nullable(),
  createdAt: z.string(),
});

export type CreateMessageType = z.infer<typeof CreateMessageSchema>;
export type UpdateMessageType = z.infer<typeof UpdateMessageSchema>;
export type Message = MessagesModel;

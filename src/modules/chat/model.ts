import { z } from "zod";

export const ConnectSchema = z.object({
  appId: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().optional(),
  deviceToken: z.string().optional(),
  deviceType: z.enum(["android", "ios", "web"]).optional(),
});

export type ConnectPayload = z.infer<typeof ConnectSchema>;

export const CreateConversationSchema = z.object({
  type: z.enum(["DIRECT", "GROUP"]),
  participantIds: z.array(z.string()).min(1),
  name: z.string().optional(),
});

export type CreateConversationPayload = z.infer<typeof CreateConversationSchema>;

export const SendMessageSchema = z.object({
  type: z.enum(["TEXT", "IMAGE", "DOCUMENT", "AUDIO", "CALL"]),
  content: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type SendMessagePayload = z.infer<typeof SendMessageSchema>;

export const GetMessagesQuerySchema = z.object({
  limit: z.coerce.number().default(50),
  cursor: z.string().optional(),
});

export const AddParticipantSchema = z.object({
  userIds: z.array(z.string()).min(1),
});

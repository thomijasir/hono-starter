import { z } from "zod";

export const CreateConversationSchema = z.object({
  type: z.enum(["DIRECT", "GROUP"]),
  participantIds: z.array(z.string()).min(1),
  name: z.string().optional(),
});

export type CreateConversationPayload = z.infer<
  typeof CreateConversationSchema
>;

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

export type AddParticipantPayload = z.infer<typeof AddParticipantSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
];

export const UploadFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Max file size is 5MB.",
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: "Only .jpg, .png, .webp, .pdf and audio files are accepted.",
    }),
});

export type UploadFilePayload = z.infer<typeof UploadFileSchema>;

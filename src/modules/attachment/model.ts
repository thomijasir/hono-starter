import { z } from "@hono/zod-openapi";
import {
  ATTACHMENT_ACCEPTED_FILE_TYPES,
  ATTACHMENT_MAX_FILE_SIZE,
} from "~/constants";

export const AttachmentSchema = z.object({
  id: z.number(),
  userId: z.string(),
  filename: z.string(),
  path: z.string(),
  mimeType: z.string(),
  size: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UploadAttachmentSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= ATTACHMENT_MAX_FILE_SIZE, {
      message: "Max file size is 5MB.",
    })
    .refine((file) => ATTACHMENT_ACCEPTED_FILE_TYPES.includes(file.type), {
      message: "Only .jpg, .png, .webp, .pdf and audio files are accepted.",
    })
    .openapi({
      type: "string",
      format: "binary",
      description: "Select a file to upload (Max 5MB)",
    }),
});

export const GetAttachmentsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(), // search by filename
  type: z.string().optional(), // filter by mimeType
});

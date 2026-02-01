import { z } from "@hono/zod-openapi";

export const RequestCreateConversationSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long" })
      .max(50, { message: "Name must be at most 50 characters long" })
      .regex(/^[a-zA-Z\s-]+$/, {
        message: "Name must contain only letters, spaces, or hyphens",
      })
      .openapi({ example: "Thomi Jasir" }),
    participants: z.array(z.string()),
  })
  .openapi("RequestCreateConversationSchema");

export type RequestCreateConversationType = z.infer<
  typeof RequestCreateConversationSchema
>;

export const CreateConversationSchema = z.object({
  id: z.string(),
  appId: z.string(),
  type: z.string(),
  name: z.string(),
  adminId: z.string().optional(),
  participants: z.array(z.string()),
});

export type CreateConversationType = z.infer<typeof CreateConversationSchema>;

export const UpdateConversationSchema = z.object({
  name: z.string().optional(),
});

export type UpdateConversationType = z.infer<typeof UpdateConversationSchema>;

export const ConversationSchema = z.object({
  id: z.string(),
  appId: z.string(),
  type: z.string(),
  name: z.string().nullable(),
  adminId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ConversationType = z.infer<typeof ConversationSchema>;

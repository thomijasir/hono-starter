import { z } from "zod";

export const CreatePostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export const UpdatePostSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
});

export type CreatePostPayload = z.infer<typeof CreatePostSchema>;
export type UpdatePostPayload = z.infer<typeof UpdatePostSchema>;

export const GetPostParamSchema = z.object({
  id: z.coerce.number(),
});

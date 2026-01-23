import { z } from "@hono/zod-openapi";

export const PostSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    title: z.string().openapi({ example: "My First Post" }),
    content: z.string().openapi({ example: "Hello World content" }),
    authorId: z.number().openapi({ example: 1 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
  })
  .openapi("Post");

export const CreatePostSchema = z
  .object({
    title: z.string().min(1).openapi({ example: "My New Post" }),
    content: z.string().min(1).openapi({ example: "Content of the post" }),
  })
  .openapi("CreatePostRequest");

export const UpdatePostSchema = z
  .object({
    title: z.string().min(1).optional().openapi({ example: "Updated Title" }),
    content: z
      .string()
      .min(1)
      .optional()
      .openapi({ example: "Updated Content" }),
  })
  .openapi("UpdatePostRequest", {
    example: {
      title: "Updated Title",
      content: "Updated Content",
    },
  });

export type CreatePostPayload = z.infer<typeof CreatePostSchema>;
export type UpdatePostPayload = z.infer<typeof UpdatePostSchema>;

export const GetPostParamSchema = z.object({
  id: z.coerce
    .number()
    .openapi({ param: { name: "id", in: "path" }, example: 1 }),
});

export const GetPostsQuerySchema = z.object({
  page: z.coerce.number().optional().openapi({ example: 1 }),
  limit: z.coerce.number().optional().openapi({ example: 10 }),
});

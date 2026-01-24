import { z } from "@hono/zod-openapi";

export const PostSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    title: z.string().openapi({ example: "My First Post" }),
    content: z.string().openapi({ example: "Hello World content" }),
    tags: z.string().min(1).openapi({ example: "finance, web, technology" }),
    authorId: z.number().openapi({ example: 1 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
  })
  .openapi("PostSchema");

export type PostType = z.infer<typeof PostSchema>;

export const CreatePostSchema = z
  .object({
    title: z.string().min(1).openapi({ example: "My New Post" }),
    tags: z.string().min(1).openapi({ example: "finance, web, technology" }),
    content: z.string().min(1).openapi({ example: "Content of the post" }),
  })
  .openapi("CreatePostSchema");

export type CreatePostType = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = z
  .object({
    title: z.string().min(1).optional().openapi({ example: "Updated Title" }),
    tags: z.string().min(1).openapi({ example: "finance, web, technology" }),
    content: z
      .string()
      .min(1)
      .optional()
      .openapi("UpdatePostSchema", { example: "Updated Content" }),
  })
  .openapi("UpdatePostSchema", {
    example: {
      title: "Updated Title",
      tags: "markets, business, insider",
      content: "Updated Content",
    },
  });

export type UpdatePostType = z.infer<typeof UpdatePostSchema>;

export const GetPostParamSchema = z.object({
  id: z.coerce.number().openapi("GetPostParamSchema", {
    param: { name: "id", in: "path" },
    example: 1,
  }),
});

export const GetPostsQuerySchema = z.object({
  page: z.coerce.number().optional().openapi({ example: 1 }),
  limit: z.coerce.number().optional().openapi({ example: 10 }),
});

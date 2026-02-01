import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.string().openapi({ example: 1 }),
    name: z.string().openapi({ example: "John Doe" }),
    email: z.email().openapi({ example: "john@example.com" }),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("UserSchema");

export type UserType = z.infer<typeof UserSchema>;

export const GetUserParamSchema = z.object({
  id: z.coerce
    .string()
    .openapi({ param: { name: "id", in: "path" }, example: 1 }),
});

export const CreateUserSchema = z
  .object({
    name: z.string().openapi({ example: "John Doe" }),
    email: z.email().openapi({ example: "john@example.com" }),
    password: z.string().openapi({ example: "password123" }),
  })
  .openapi("CreateUserSchema");

export type CreateUserType = z.infer<typeof CreateUserSchema>;

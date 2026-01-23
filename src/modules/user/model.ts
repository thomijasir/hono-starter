import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: "John Doe" }),
    email: z.email().openapi({ example: "john@example.com" }),
  })
  .openapi("User");

export type User = z.infer<typeof UserSchema>;

export const GetUserParamSchema = z.object({
  id: z.coerce
    .number()
    .openapi({ param: { name: "id", in: "path" }, example: 1 }),
});

export const CreateUserSchema = z
  .object({
    name: z.string().openapi({ example: "John Doe" }),
    email: z.email().openapi({ example: "john@example.com" }),
    password: z.string().openapi({ example: "password123" }),
  })
  .openapi("CreateUserRequest");

export type CreateUserPayload = z.infer<typeof CreateUserSchema>;

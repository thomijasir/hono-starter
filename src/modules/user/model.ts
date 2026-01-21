import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const GetUserParamSchema = z.object({
  id: z.coerce.number(),
});

export const UserCreateSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
});

export type UserCreatePayload = z.infer<typeof UserCreateSchema>;

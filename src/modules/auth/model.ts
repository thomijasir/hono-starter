import { z } from "@hono/zod-openapi";

export const LoginSchema = z.object({
  email: z.email().openapi({
    example: "john@example.com",
    description: "User email address",
  }),
  password: z.string().min(1).openapi({
    example: "password123",
    description: "User password",
  }),
}).openapi("LoginSchema");

export const RegisterSchema = z.object({
  name: z.string().min(1).openapi({
    example: "John Doe",
    description: "User full name",
  }),
  email: z.email().openapi({
    example: "john@example.com",
    description: "User email address",
  }),
  password: z.string().min(8).openapi({
    example: "password123",
    description: "User password (min 8 chars)",
  }),
}).openapi("RegisterSchema");

export const AuthResponseSchema = z.object({
  token: z.string().openapi({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT Bearer token",
  }),
}).openapi("AuthResponseSchema");

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export type LoginPayload = z.infer<typeof LoginSchema>;
export type RegisterPayload = z.infer<typeof RegisterSchema>;


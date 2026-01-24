import { z } from "@hono/zod-openapi";

export const JWTAuthDataSchema = z.object({
  id: z.string().openapi({ example: "aabsd-sds34234-23sf..." }),
  name: z.string().openapi({ example: "John Doe" }),
  email: z.email().openapi({ example: "john@example.com" }),
  iat: z.number(),
  exp: z.number(),
});

export type JWTAuthDataType = z.infer<typeof JWTAuthDataSchema>;

export const LoginSchema = z
  .object({
    email: z.email().openapi({
      example: "john@example.com",
      description: "User email address",
    }),
    password: z.string().min(1).openapi({
      example: "password123",
      description: "User password",
    }),
  })
  .openapi("LoginSchema");

export type LoginType = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
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
  })
  .openapi("RegisterSchema");

export type RegisterType = z.infer<typeof RegisterSchema>;

export const AuthResponseSchema = z
  .object({
    token: z.string().openapi({
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      description: "JWT Bearer token",
    }),
  })
  .openapi("AuthResponseSchema");

export type AuthResponseType = z.infer<typeof AuthResponseSchema>;

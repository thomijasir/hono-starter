/* eslint-disable */
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),
  PORT: z.coerce.number().default(3099),
  DB_URL: z.string().default("sqlite.db"),
  DB_DRIVER: z.enum(["SQLITE", "PGSQL", "MYSQL"]).default("SQLITE"),
  JWT_SECRET: z.string().default("hono-secret-starter-pack"),
  PASSWORD_SALT: z.string().default("salt"),
  USE_HTTPS: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  LIVEKIT_URL: z.string().optional(),
});

export const ENVIRONMENT = envSchema.parse(process.env);

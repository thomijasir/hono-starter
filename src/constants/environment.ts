/* eslint-disable */
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),
  PORT: z.coerce.number().default(3090),
  DB_URL: z.string().default("pgsql//"),
  DB_DRIVER: z.enum(["SQLITE", "PGSQL", "MYSQL"]).default("SQLITE"),
  JWT_SECRET: z.string().default("hono-secret-starter-pack"),
  USE_HTTPS: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
});

export const ENVIRONMENT = envSchema.parse(process.env);

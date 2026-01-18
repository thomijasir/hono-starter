export const ENVIRONMENT = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "3090", 10),
  DB_URL: process.env.DB_URL ?? "postgres://localhost:5432/mydb",
  JWT_SECRET: process.env.JWT_SECRET ?? "starter-secret-hono",
  USE_HTTPS: process.env.USE_HTTPS === "true",
};

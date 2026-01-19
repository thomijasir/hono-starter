import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite", // 'mysql' | 'sqlite' | 'turso' | postgresql
  schema: "./src/schemas/default.ts",
  casing: "snake_case",
  dbCredentials: {
    // For mysql and postgres put your database url here
    url: "file:./sqlite.db",
  },
});

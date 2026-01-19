import type { Database } from "~/services";
import type { LogType } from "~/utils";

export interface AppConfig {
  environment: string;
  port: number;
  dbUrl: string;
  useHttps: boolean;
  jwtSecret: string;
  dbDriver: "SQLITE" | "PGSQL" | "MYSQL";
}

export interface AppState {
  config: AppConfig;
  db: Database;
  // Add Redis or other stateful services here
  // redis: RedisConnection;
}

// Hono Variables definition
export interface Variables {
  state: AppState;
  log: LogType;
}

import type { DrizzleDBSqlite, DBSqliteService } from "~/services";
import type { LogType } from "~/utils";

export interface AppConfig {
  environment: string;
  port: number;
  dbUrl: string;
  useHttps: boolean;
  jwtSecret: string;
  passwordSalt: string;
  dbDriver: "SQLITE" | "PGSQL" | "MYSQL";
}

export interface AppState {
  config: AppConfig;
  db: DrizzleDBSqlite;
  dbClient: DBSqliteService;
  // Add Redis or other stateful services here
  // redis: RedisConnection;
}

// Hono Variables definition
export interface Variables {
  state: AppState;
  log: LogType;
}

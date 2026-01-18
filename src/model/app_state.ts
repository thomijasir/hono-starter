import type { LogType } from "~/utils";

export interface AppConfig {
  environment: string;
  port: number;
  dbUrl: string;
  useHttps: boolean;
  jwtSecret: string;
}

export interface DatabaseConnection {
  query: (sql: string) => Promise<unknown>;
  disconnect: () => Promise<void>;
}

export interface AppState {
  config: AppConfig;
  db: DatabaseConnection;
  // Add Redis or other stateful services here
  // redis: RedisConnection;
}

// Hono Variables definition
export interface Variables {
  state: AppState;
  log: LogType;
}

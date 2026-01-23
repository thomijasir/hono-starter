import type { DrizzleDBSqlite, DBSqliteService } from "~/services";
import type { LogType } from "~/utils";

/**
 * Interface representing the application configuration.
 */
export interface AppConfig {
  /** The current environment (e.g., development, production). */
  environment: string;
  /** The port the application is running on. */
  port: number;
  /** The database connection URL. */
  dbUrl: string;
  /** Whether detailed debug logging is enabled. */
  useHttps: boolean;
  /** The secret key used for JWT signing. */
  jwtSecret: string;
  /** The salt used for password hashing. */
  passwordSalt: string;
  /** The database driver to use. */
  dbDriver: "SQLITE" | "PGSQL" | "MYSQL";
}

/**
 * Interface representing the global application state.
 */
export interface AppState {
  /** The application configuration. */
  config: AppConfig;
  /** The Drizzle ORM database instance. */
  db: DrizzleDBSqlite;
  /** The database service client. */
  dbClient: DBSqliteService;
  // Add Redis or other stateful services here
  // redis: RedisConnection;
}

// Hono Variables definition
/**
 * Interface representing the Hono variables containing the application state and logger.
 */
export interface Variables {
  /** The application state. */
  state: AppState;
  /** The logger instance. */
  log: LogType;
}

export interface AppOpenApi {
  Variables: Variables;
}

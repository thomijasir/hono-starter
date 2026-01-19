import { ENVIRONMENT } from "~/constants";
import type { AppState } from "~/model";
import { DBSqliteService } from "~/services";
import { log } from "~/utils";

// Simulate loading configuration from file/env
const loadConfig = () => {
  return {
    environment: ENVIRONMENT.NODE_ENV,
    port: ENVIRONMENT.PORT,
    dbUrl: ENVIRONMENT.DB_URL,
    useHttps: ENVIRONMENT.USE_HTTPS,
    jwtSecret: ENVIRONMENT.JWT_SECRET,
    passwordSalt: ENVIRONMENT.PASSWORD_SALT,
    dbDriver: ENVIRONMENT.DB_DRIVER,
  };
};

export const initializeState = async (): Promise<AppState> => {
  log.info("Starting Application Initialization...");

  const config = loadConfig();
  // Create Pool Connection and client for database
  const dbClient = new DBSqliteService(config.dbUrl);
  const db = dbClient.db;

  // Freeze the state object to prevent modifications at runtime if desired
  // though TypeScript readonly properties are usually enough for compile time safety
  const state: AppState = {
    config,
    db,
    dbClient,
  };

  log.info("Application State Initialized.");
  return Promise.resolve(Object.freeze(state));
};


import { ENVIRONMENT } from "~/constants";
import type { AppState } from "~/model";
import { Database } from "~/services";
import { log } from "~/utils";

// Simulate loading configuration from file/env
const loadConfig = () => {
  return {
    environment: ENVIRONMENT.NODE_ENV,
    port: ENVIRONMENT.PORT,
    dbUrl: ENVIRONMENT.DB_URL,
    useHttps: ENVIRONMENT.USE_HTTPS,
    jwtSecret: ENVIRONMENT.JWT_SECRET,
    dbDriver: ENVIRONMENT.DB_DRIVER,
  };
};

export const initializeState = async (): Promise<AppState> => {
  log.info("Starting Application Initialization...");

  const config = loadConfig();
  const db = new Database(config.dbDriver, config.dbUrl);

  // Freeze the state object to prevent modifications at runtime if desired
  // though TypeScript readonly properties are usually enough for compile time safety
  const state: AppState = {
    config,
    db,
  };

  log.info("Application State Initialized.");
  return Promise.resolve(Object.freeze(state));
};


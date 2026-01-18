import { ENVIRONMENT } from "~/constants";
import type { AppState, DatabaseConnection } from "~/model";
// Simulate loading configuration from file/env
const loadConfig = () => {
  return {
    environment: ENVIRONMENT.NODE_ENV,
    port: ENVIRONMENT.PORT,
    dbUrl: ENVIRONMENT.DB_URL,
    useHttps: ENVIRONMENT.USE_HTTPS,
    jwtSecret: ENVIRONMENT.JWT_SECRET,
  };
};

// Simulate a Database Connection Pool
const createDbConnection = async (url: string): Promise<DatabaseConnection> => {
  // eslint-disable-next-line no-console
  console.log(`[System] Initializing Database Connection Pool to ${url}...`);

  // Simulate async connection delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // eslint-disable-next-line no-console
  console.log(`[System] Database Connected.`);

  return {
    query: (sql: string) => {
      // eslint-disable-next-line no-console
      console.log(`[DB Query]: ${sql}`);
      return Promise.resolve([{ id: 1, result: "mock result" }]);
    },
    disconnect: () => {
      // eslint-disable-next-line no-console
      console.log(`[System] Database Disconnected.`);
      return Promise.resolve();
    },
  };
};

export const initializeState = async (): Promise<AppState> => {
  // eslint-disable-next-line no-console
  console.log("[System] Starting Application Initialization...");

  const config = loadConfig();
  const db = await createDbConnection(config.dbUrl);

  // Freeze the state object to prevent modifications at runtime if desired
  // though TypeScript readonly properties are usually enough for compile time safety
  const state: AppState = {
    config,
    db,
  };

  // eslint-disable-next-line no-console
  console.log("[System] Application State Initialized.");
  return Object.freeze(state);
};

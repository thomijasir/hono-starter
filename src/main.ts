import { createApp } from "~/routes";
import { initializeState } from "~/state";
import { log } from "~/utils";

const startServer = async () => {
  try {
    // 1. Initialize State (DB, Config, etc.) - This runs once!
    const state = await initializeState();

    // 2. Create the Hono App with the initialized state
    const app = createApp(state);

    const { port, useHttps } = state.config;

    if (useHttps) {
      // HTTPS Server
      Bun.serve({
        fetch: app.fetch,
        port: port, // e.g., 3001
        tls: {
          key: Bun.file("certs/key.pem"),
          cert: Bun.file("certs/cert.pem"),
        },
      });
      log.info(`HTTPS Server is running on https://localhost:${port}`);
    } else {
      // HTTP Server
      Bun.serve({
        fetch: app.fetch,
        port: port, // e.g., 3000
      });
      log.info(`HTTP Server is running on http://localhost:${port}`);
    }
    log.info(`Environment: ${state.config.environment}`);
  } catch (err) {
    log.error("FAILED_TO_START_SERVER", err);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
};

void startServer();

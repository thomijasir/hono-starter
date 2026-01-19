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

    let server;
    if (useHttps) {
      // HTTPS Server
      server = Bun.serve({
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
      server = Bun.serve({
        fetch: app.fetch,
        port: port, // e.g., 3000
      });
      log.info(`HTTP Server is running on http://localhost:${port}`);
    }
    log.info(`Environment: ${state.config.environment}`);

    let isShuttingDown = false;

    const shutdown = async () => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      log.info("Gracefully shutting down...");
      await server.stop();
      await state.dbClient.close();
      log.info("Server and Database closed. Exiting process.");
      // eslint-disable-next-line n/no-process-exit
      process.exit(0);
    };

    process.on("SIGINT", () => {
      void shutdown();
    });
    process.on("SIGTERM", () => {
      void shutdown();
    });
  } catch (err) {
    log.error("FAILED_TO_START_SERVER", err);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
};

void startServer();

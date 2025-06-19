import http from "http";
import { closeSocket, initSocket } from "@config/socket";
import env from "@config/env";
import { closeRabbitMQ, initRabbitMQ } from "@config/rabbitmq";
import { connectMongo, disconnectMongo } from "@config/mongodb";
import { startEmailConsumer } from "@consumers/emailConsumer";
import logger from "@utils/logger";
import app from "src/app";

const server = http.createServer(app);

const PORT = env.port;

server.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}...`);

  try {
    initSocket(server);
    await initRabbitMQ();
    await connectMongo();
    await startEmailConsumer();
  } catch (err) {
    logger.error("Startup error:", err);
    process.exit(1);
  }
});

process.on("unhandledRejection", async (reason, promise) => {
  logger.error("Unhandled Rejection:" + reason);
  await shutdown();
});

process.on("uncaughtException", async (error) => {
  logger.error("Uncaught Exception:", error);
  shutdown();
});

const shutdown = async () => {
  logger.info("🛑 Shutdown signal received. Shutting down gracefully...");

  server.close(async () => {
    logger.info("🧱 HTTP server closed.");

    try {
      await disconnectMongo();
      await closeRabbitMQ();
      closeSocket();
      logger.info("✅ All services terminated.");
    } catch (err) {
      logger.error("Error during shutdown:", err);
    }

    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

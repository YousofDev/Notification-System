import logger from "@utils/logger";
import dotenv from "dotenv";

dotenv.config();

const env = {
  environment: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  logLevel: process.env.LOG_LEVEL || "info",
  corsOrigins:
    process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:4000",

  smtp: {
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE || "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },

  apiKeys: process.env.API_KEYS ? process.env.API_KEYS.split(",") : [],
  mongoUri:
    process.env.MONGO_URI || "mongodb://localhost:27017/notifications_db",
  rabbitmqUri: process.env.RABBITMQ_URI || "amqp://guest:guest@localhost:5672",
  queueNames: {
    email: process.env.RABBITMQ_EMAIL_QUEUE || "email_notifications_queue",
    websocket:
      process.env.RABBITMQ_WEBSOCKET_QUEUE || "websocket_notifications_queue",
  },

  emailRateLimit: {
    max: parseInt(process.env.EMAIL_RATE_LIMIT_MAX || "100"),
    windowMs: parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW_MS || "60000"),
  },
  websocketRateLimit: {
    max: parseInt(process.env.WS_RATE_LIMIT_MAX || "500"),
    windowMs: parseInt(process.env.WS_RATE_LIMIT_WINDOW_MS || "60000"),
  },

  deadLetterQueues: {
    email: process.env.RABBITMQ_DLQ_EMAIL || "email_notifications_queue.dlq",
    websocket:
      process.env.RABBITMQ_DLQ_WEBSOCKET || "websocket_notifications_queue.dlq",
  },
  deadLetterExchanges: {
    email: process.env.RABBITMQ_DLX_EMAIL || "dlx.email",
    websocket: process.env.RABBITMQ_DLX_WEBSOCKET || "dlx.websocket",
  },
};

if (env.environment === "production" && !env.smtp.user) {
  logger.warn(
    "SMTP_USER is not set in production environment. Email sending might fail."
  );
}

if (env.apiKeys.length === 0) {
  logger.warn(
    "No API_KEYS are configured. API authentication will not be secure."
  );
}

export default env;

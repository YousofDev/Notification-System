import amqp from "amqplib";
import env from "@config/env";
import logger from "@utils/logger";

let channel: amqp.Channel;
let connection: any;
let isRabbitConnected = false;

/**
 * Initializes RabbitMQ connection and declares required queues,
 * including Dead-Letter Queues (DLQs) for handling failed notifications.
 */
export async function initRabbitMQ(): Promise<void> {
  connection = await amqp.connect(env.rabbitmqUri);
  channel = await connection.createChannel();

  isRabbitConnected = true;

  connection.on("close", () => {
    isRabbitConnected = false;
    logger.warn("🐇 RabbitMQ connection closed");
  });

  connection.on("error", (err: any) => {
    isRabbitConnected = false;
    logger.error("🐇 RabbitMQ error:", err);
  });

  // Declare Dead-Letter Queues
  await channel.assertQueue("email_notifications_dlq", { durable: true });
  await channel.assertQueue("websocket_notifications_dlq", { durable: true });

  // Declare Main Queues with DLQ routing
  await channel.assertQueue("email_notifications", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "", // default exchange
      "x-dead-letter-routing-key": "email_notifications_dlq",
    },
  });

  await channel.assertQueue("websocket_notifications", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": "websocket_notifications_dlq",
    },
  });

  logger.info("📦 RabbitMQ connected and queues initialized");
}

/**
 * Returns the shared channel instance.
 */
export function getChannel(): amqp.Channel {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  return channel;
}

export async function closeRabbitMQ(): Promise<void> {
  await channel?.close();
  await connection?.close();
  logger.info("🐇 RabbitMQ connection closed.");
}

export function isRabbitMQHealthy(): boolean {
  return isRabbitConnected && channel && channel.connection !== null;
}

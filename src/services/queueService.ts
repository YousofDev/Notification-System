import { getChannel, isRabbitMQHealthy } from "@config/rabbitmq";
import { Notification } from "@models/Notification";
import logger from "@utils/logger";

type RetryOptions = {
  maxRetries: number;
  retryDelayMs: number;
};

const DEFAULT_RETRY_OPTS: RetryOptions = {
  maxRetries: 3,
  retryDelayMs: 1000,
};

const retryTimeouts: NodeJS.Timeout[] = [];

/**
 * Publish a message to a RabbitMQ queue.
 */
export async function publishToQueue(
  queue: string,
  payload: object,
  retryAttempt: number = 0
): Promise<void> {
  const channel = getChannel();

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
    headers: {
      "x-retry-attempt": retryAttempt,
    },
  });

  logger.info(
    `📤 Published to ${queue}${retryAttempt > 0 ? ` (retry #${retryAttempt})` : ""}`,
    payload
  );
}

/**
 * Consume messages from a RabbitMQ queue with retry and DLQ support.
 */
export async function consumeFromQueue(
  queue: string,
  handler: (data: any) => Promise<void>,
  retryOptions: RetryOptions = DEFAULT_RETRY_OPTS
): Promise<string> {
  const channel = getChannel();

  const { consumerTag } = await channel.consume(queue, async (msg) => {
    if (!msg) return;

    const content = JSON.parse(msg.content.toString());
    const headers = msg.properties.headers || {};
    const attempts = headers["x-retry-attempt"] || 0;

    const nextAttempt = attempts + 1;

    try {
      await handler(content);
      channel.ack(msg);
    } catch (err) {
      logger.error(
        `❌ Handler failed for ${queue} (attempt #${nextAttempt}):`,
        err instanceof Error ? { message: err.message, stack: err.stack } : err
      );

      if (nextAttempt <= retryOptions.maxRetries) {
        const delay = retryOptions.retryDelayMs * 2 ** (nextAttempt - 1);

        logger.warn(
          `⚠️ Retrying message (${nextAttempt}/${retryOptions.maxRetries}) after ${delay}ms`,
          {
            requestId: content.requestId || "unknown",
            notificationType:
              content.templateName || content.event || "unknown",
            apiKey: content.apiKey || "unknown",
          }
        );

        // Acknowledge original message so it's not reprocessed
        channel.ack(msg);

        const timeout = setTimeout(() => {
          if (isRabbitMQHealthy()) {
            try {
              publishToQueue(queue, content, nextAttempt);
            } catch (e) {
              logger.warn("Retry failed due to closed channel or other error", {
                error: (e as Error).message,
              });
            }
          } else {
            logger.warn("❌ Retry aborted: channel already closed.");
          }
        }, delay);

        retryTimeouts.push(timeout);
      } else {
        logger.error("💀 Message rejected after max retries", {
          requestId: content.requestId || "unknown",
          apiKey: content.apiKey || "unknown",
          notificationType: content.templateName || content.event || "unknown",
          target: content.to || content.userId || "unknown",
          payload: JSON.stringify(content),
          queue,
        });

        await Notification.updateOne(
          { to: content.to, subject: content.subject },
          {
            $set: { status: "failed_dlq", updatedAt: new Date() },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        );

        // Nack without requeue to send to DLQ
        channel.nack(msg, false, false);
      }
    }
  });

  return consumerTag;
}

/**
 * Clear any scheduled retry timeouts (used in tests/shutdown).
 */
export function clearRetryTimeouts(): void {
  retryTimeouts.forEach(clearTimeout);
  retryTimeouts.length = 0;
}

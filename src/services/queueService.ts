import { getChannel } from "@config/rabbitmq";
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

export async function publishToQueue(
  queue: string,
  payload: object
): Promise<void> {
  const channel = getChannel();
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  });
  logger.info(`📤 Published to ${queue}:`, payload);
}

export async function consumeFromQueue(
  queue: string,
  handler: (data: any) => Promise<void>,
  retryOptions: RetryOptions = DEFAULT_RETRY_OPTS
): Promise<void> {
  const channel = getChannel();

  await channel.consume(queue, async (msg) => {
    if (!msg) return;

    const content = JSON.parse(msg.content.toString());
    const headers = msg.properties.headers || {};
    const attempts = headers["x-retry-attempt"] || 0;

    try {
      await handler(content);
      channel.ack(msg);
    } catch (err) {
      logger.error(`❌ Handler failed for ${queue}:`, err);

      if (attempts < retryOptions.maxRetries) {
        const delay = retryOptions.retryDelayMs * 2 ** attempts;

        logger.warn(
          `⚠️ Retry ${attempts + 1}/${retryOptions.maxRetries} for ${queue}`,
          {
            requestId: content.requestId || "unknown",
            notificationType:
              content.templateName || content.event || "unknown",
            apiKey: content.apiKey || "unknown",
          }
        );

        setTimeout(() => {
          channel.sendToQueue(queue, msg.content, {
            persistent: true,
            headers: { "x-retry-attempt": attempts + 1 },
          });
        }, delay);
      } else {
        // Final retry failed — log before DLQ
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
          { $set: { status: "failed_dlq" } }
        );

        channel.nack(msg, false, false); // DLQ
      }
    }
  });
}

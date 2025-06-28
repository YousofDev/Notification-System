import { getChannel } from "@config/rabbitmq";
import { consumeFromQueue } from "@services/queueService";
import { sendEmailNotification } from "@services/emailService";
import { Notification } from "@models/Notification";
import logger from "@utils/logger";

let consumerTag: string | null = null;

/**
 * Starts consuming email notifications from RabbitMQ.
 * Called on app startup or in test setup.
 */
export async function startEmailConsumer(): Promise<void> {
  consumerTag = await consumeFromQueue("email_notifications", async (data) => {
    const context = {
      to: data.to,
      subject: data.subject,
      template: data.templateName,
    };

    logger.info("📥 Received email notification", context);

    try {
      await sendEmailNotification(
        data.to,
        data.subject,
        data.templateName,
        data.data
      );

      await Notification.updateOne(
        { to: data.to, subject: data.subject },
        {
          $set: { status: "sent", updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );

      logger.info("✅ Email sent and status updated", context);
    } catch (err) {
      await Notification.updateOne(
        { to: data.to, subject: data.subject },
        {
          $set: { status: "failed", updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );

      logger.error("❌ Email send failed", {
        ...context,
        error: err instanceof Error ? err.message : String(err),
      });

      throw err; // important to let queueService retry
    }
  });
}

/**
 * Stops the email notification consumer (e.g., in tests or shutdown).
 */
export async function stopEmailConsumer(): Promise<void> {
  if (!consumerTag) return;

  const channel = getChannel();
  await channel.cancel(consumerTag);
  logger.info("🛑 Stopped email consumer");
  consumerTag = null;
}

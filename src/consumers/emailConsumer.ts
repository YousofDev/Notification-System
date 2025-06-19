import { consumeFromQueue } from "@services/queueService";
import { sendEmailNotification } from "@services/emailService";
import { Notification } from "@models/Notification";

export async function startEmailConsumer() {
  await consumeFromQueue("email_notifications", async (data) => {
    try {
      await sendEmailNotification(
        data.to,
        data.subject,
        data.templateName,
        data.data
      );

      await Notification.updateOne(
        { to: data.to, subject: data.subject },
        { $set: { status: "sent" } }
      );
    } catch (err) {
      await Notification.updateOne(
        { to: data.to, subject: data.subject },
        { $set: { status: "failed" } }
      );
      throw err;
    }
  });
}

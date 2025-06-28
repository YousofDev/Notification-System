import { Notification } from "@models/Notification";
import { publishToQueue } from "@services/queueService";
import logger from "@utils/logger";

type EmailPayload = {
  to: string;
  subject: string;
  templateName: string;
  data: Record<string, any>;
};

type WebSocketPayload = {
  userId: string;
  event: string;
  data: Record<string, any>;
};

export const notificationService = {
  async sendEmail(payload: EmailPayload): Promise<void> {
    await Notification.create({
      type: "email",
      to: payload.to,
      subject: payload.subject,
      templateName: payload.templateName,
      data: payload.data,
      status: "queued",
    });

    await publishToQueue("email_notifications", payload);

    logger.info("📨 Queued email notification", {
      notificationType: "email",
    });
  },

  async sendWebSocket(payload: WebSocketPayload): Promise<void> {
    await Notification.create({
      type: "websocket",
      to: payload.userId,
      subject: payload.event,
      data: payload.data,
      status: "queued",
    });

    await publishToQueue("websocket_notifications", payload);

    logger.info("📡 Queued websocket notification", {
      notificationType: "websocket",
    });
  },
};

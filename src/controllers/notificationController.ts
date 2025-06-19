import { Request, Response } from "express";
import { EmailNotificationSchema } from "@validators/emailSchema";
import { publishToQueue } from "@services/queueService";
import { WebSocketNotificationSchema } from "@validators/websocketSchema";
import { Notification } from "@models/Notification";
import { sanitizeInput } from "@config/sanitize";
import logger from "@utils/logger";

export const sendEmailHandler = async (req: Request, res: Response) => {
  try {
    const validated = EmailNotificationSchema.parse(sanitizeInput(req.body));

    // Save to MongoDb
    await Notification.create({
      type: "email",
      to: validated.to,
      subject: validated.subject,
      templateName: validated.templateName,
      data: validated.data,
      status: "queued",
    });

    // Publish to email queue
    await publishToQueue("email_notifications", validated);

    logger.info("Queued email notification", {
      requestId: req.requestId!,
      apiKey: req.apiKey!,
      notificationType: "email",
    });

    res.status(202).json({ message: "Email notification queued" });
  } catch (err: any) {
    logger.error("❌ Email API error: "+ err.message);
    res.status(400).json({ error: err.message });
  }
};

export const sendWebSocketHandler = async (req: Request, res: Response) => {
  try {
    const validated = WebSocketNotificationSchema.parse(
      sanitizeInput(req.body)
    );

    // Save to MongoDb
    await Notification.create({
      type: "websocket",
      to: validated.userId,
      subject: validated.event,
      data: validated.data,
      status: "queued",
    });

    // Publish to websocket queue
    await publishToQueue("websocket_notifications", validated);

    logger.info("Queued websocket notification", {
      requestId: req.requestId!,
      apiKey: req.apiKey!,
      notificationType: "websocket",
    });

    res.status(202).json({ message: "WebSocket notification queued" });
  } catch (err: any) {
    logger.error("❌ WS Validation error: "+err.message);
    res.status(400).json({ error: err.message });
  }
};

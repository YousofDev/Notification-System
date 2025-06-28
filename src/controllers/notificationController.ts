import { Request, Response } from "express";
import { EmailNotificationSchema } from "@validators/emailSchema";
import { WebSocketNotificationSchema } from "@validators/websocketSchema";
import { sanitizeInput } from "@config/sanitize";
import { notificationService } from "@services/notificationService";
import logger from "@utils/logger";

export const sendEmailHandler = async (req: Request, res: Response) => {
  try {
    const validated = EmailNotificationSchema.parse(sanitizeInput(req.body));
    await notificationService.sendEmail(validated);
    res.status(202).json({ message: "Email notification queued" });
  } catch (err: any) {
    logger.error("❌ Email API error: " + err.message);
    res.status(400).json({ error: err.message });
  }
};

export const sendWebSocketHandler = async (req: Request, res: Response) => {
  try {
    const validated = WebSocketNotificationSchema.parse(
      sanitizeInput(req.body)
    );
    await notificationService.sendWebSocket(validated);
    res.status(202).json({ message: "WebSocket notification queued" });
  } catch (err: any) {
    logger.error("❌ WS API error: " + err.message);
    res.status(400).json({ error: err.message });
  }
};

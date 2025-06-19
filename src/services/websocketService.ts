import { getIO } from "@config/socket";
import logger from "@utils/logger";

type WebSocketNotificationPayload = {
  userId: string;
  event: string;
  data: any;
};

export function sendWebSocketNotification(
  payload: WebSocketNotificationPayload
): void {
  const io = getIO();

  // Emit to a specific user room
  io.to(payload.userId).emit(payload.event, payload.data);

  logger.info(`📨 Sent WS notification to user ${payload.userId}`);
}

export function broadcastWebSocketNotification(event: string, data: any): void {
  const io = getIO();

  // Emit to all clients
  io.emit(event, data);

  logger.info(`📢 Broadcasted WS event "${event}"`);
}

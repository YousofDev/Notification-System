import { z } from "zod";

export const WebSocketNotificationSchema = z.object({
  userId: z.string().min(1),
  event: z.string().min(1),
  data: z.record(z.any()),
});

export type WebSocketNotificationInput = z.infer<
  typeof WebSocketNotificationSchema
>;

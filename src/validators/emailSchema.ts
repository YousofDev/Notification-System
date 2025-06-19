import { z } from "zod";

export const EmailNotificationSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  templateName: z.string().min(1),
  data: z.record(z.any()),
});

export type EmailNotificationInput = z.infer<typeof EmailNotificationSchema>;

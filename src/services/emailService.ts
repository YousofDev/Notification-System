import nodemailer from "nodemailer";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import env from "@config/env";
import { EmailNotificationSchema } from "@validators/emailSchema";
import logger from "@utils/logger";

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

export async function sendEmailNotification(
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
): Promise<void> {
  EmailNotificationSchema.parse({ to, subject, templateName, data });

  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    `${templateName}.ejs`
  );

  const html = await ejs.renderFile(templatePath, data).catch((err) => {
    logger.error("EJS Render Error: ", err);
    throw new Error("Template rendering failed");
  });

  await transporter.sendMail({
    from: env.smtp.user,
    to,
    subject,
    html,
  });
}

export function listTemplates(): string[] {
  const dir = path.join(__dirname, "..", "templates");
  return fs.readdirSync(dir).map((f) => f.replace(".ejs", ""));
}

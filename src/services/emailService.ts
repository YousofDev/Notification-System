import nodemailer from "nodemailer";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import env from "@config/env";
import { EmailNotificationSchema } from "@validators/emailSchema";
import logger from "@utils/logger";

/**
 * Setup nodemailer transporter.
 */
const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

/**
 * Dynamically resolves template path in runtime-safe way.
 * Works in both dev and production (dist).
 */
function resolveTemplatePath(templateName: string): string {
  const base = path.resolve(__dirname, "..", "templates");
  const filePath = path.join(base, `${templateName}.ejs`);

  if (!fs.existsSync(filePath)) {
    logger.error("🚫 Template file not found: " + filePath);
    throw new Error("Template not found: " + templateName);
  }

  return filePath;
}

/**
 * Sends an email using EJS template and SMTP transport.
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
): Promise<void> {
  EmailNotificationSchema.parse({ to, subject, templateName, data });

  const templatePath = resolveTemplatePath(templateName);

  try {
    const html = await ejs.renderFile(templatePath, { ...data });
    await transporter.sendMail({
      from: env.smtp.user,
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.error("🛑 EJS Render Error:", {
      templatePath,
      errorMessage: error.message,
      stack: error.stack,
    });
  }
}

/**
 * Lists available templates (strips `.ejs`).
 */
export function listTemplates(): string[] {
  const dir = path.join(__dirname, "..", "templates");

  if (!fs.existsSync(dir)) {
    logger.warn("⚠️ Templates directory missing: " + dir);
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".ejs"))
    .map((f) => f.replace(".ejs", ""));
}

import rateLimit from "express-rate-limit";
import env from "@config/env";

export const rateLimiter = (type: "email" | "websocket") => {
  const config = type === "email" ? env.emailRateLimit : env.websocketRateLimit;

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    keyGenerator: (req): string => {
      const apiKey = req.headers["x-api-key"];
      return typeof apiKey === "string" ? apiKey : req.ip || "unknown-ip";
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: `Rate limit exceeded for ${type} notifications.`,
      });
    },
  });
};

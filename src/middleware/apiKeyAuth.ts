import { Request, Response, NextFunction } from "express";
import env from "@config/env";
import logger from "@utils/logger";

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    logger.warn("Authentication failed: No API key provided.", { ip: req.ip });
    res.status(401).json({ message: "Unauthorized: No API key provided." });
    return;
  }

  // Check if the provided API key is in our list of authorized keys
  if (!env.apiKeys.includes(apiKey)) {
    logger.warn("Authentication failed: Invalid API key.", {
      ip: req.ip,
      providedApiKey: apiKey,
    });
    res.status(403).json({ message: "Forbidden: Invalid API key." });
    return;
  }

  logger.info("API key authenticated successfully.", { ip: req.ip });
  next(); // API key is valid, proceed to the next middleware/route handler
};

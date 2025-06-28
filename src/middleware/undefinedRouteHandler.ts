import { Request, Response } from "express";
import logger from "@utils/logger";

/**
 * Catch-all handler for undefined routes (404 Not Found).
 * Must be registered after all route handlers.
 */
export function undefinedRouteHandler(req: Request, res: Response): void {
  const message = `❌ Route ${req.method} ${req.originalUrl} Not Found`;
  logger.warn(message);
  res.status(404).json({ error: message });
}

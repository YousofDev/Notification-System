import { Request, Response, NextFunction } from "express";
import env from "@config/env";
import logger from "@utils/logger";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = res.statusCode === 200 ? 500 : res.statusCode;

  const errorResponse =
    env.environment === "production"
      ? { error: "Internal Server Error" }
      : { error: err.message };

  logger.error("❌ Error: ", {
    errorMessage: err.message,
    stack: err.stack,
  });

  res.status(status).json(errorResponse);
}

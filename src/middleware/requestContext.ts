import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

export function attachRequestContext(req: Request, _res: Response, next: NextFunction) {
  req.requestId = uuidv4();
  req.apiKey = req.headers["x-api-key"] as string || "anonymous";
  next();
}

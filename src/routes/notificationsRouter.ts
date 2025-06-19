import { Router } from "express";
import {
  sendEmailHandler,
  sendWebSocketHandler,
} from "@controllers/notificationController";
import { rateLimiterFactory } from "@middleware/rateLimiter";

const router = Router();

router.post("/email", rateLimiterFactory("email"), sendEmailHandler);

router.post(
  "/websocket",
  rateLimiterFactory("websocket"),
  sendWebSocketHandler
);

export default router;

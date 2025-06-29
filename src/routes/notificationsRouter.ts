import { Router } from "express";
import {
  sendEmailHandler,
  sendWebSocketHandler,
} from "@controllers/notificationController";
import { rateLimiter } from "@middleware/rateLimiter";

const router = Router();

router.post("/email", rateLimiter("email"), sendEmailHandler);

router.post("/websocket", rateLimiter("websocket"), sendWebSocketHandler);

export default router;

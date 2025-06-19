import { Router } from "express";
import mongoose from "mongoose";
import { isRabbitMQHealthy } from "@config/rabbitmq";
import { getQueueStatus } from "@services/queueMetrics";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rabbitConnected = isRabbitMQHealthy();
    const mongoConnected = mongoose.connection.readyState === 1;

    const mongoPool = {
      state: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };

    let queues = {};
    if (rabbitConnected) {
      queues = {
        email: await getQueueStatus("email_notifications"),
        websocket: await getQueueStatus("websocket_notifications"),
        dlq_email: await getQueueStatus("email_notifications_dlq"),
        dlq_websocket: await getQueueStatus("websocket_notifications_dlq"),
      };
    }

    res.status(rabbitConnected && mongoConnected ? 200 : 503).json({
      status: rabbitConnected && mongoConnected ? "ok" : "fail",
      rabbitmq: rabbitConnected ? "connected" : "disconnected",
      mongodb: mongoConnected ? "connected" : "disconnected",
      mongoPool,
      queues,
    });
  } catch (err) {
    res.status(503).json({ status: "fail", error: "Health check failed" });
  }
});

export default router;

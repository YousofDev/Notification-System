import { Server } from "socket.io";
import http from "http";
import env from "@config/env";
import logger from "@utils/logger";

const allowedOrigins = env.corsOrigins?.split(",") || [];

let io: Server;

export function initSocket(server: http.Server): void {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const { userId, token } = socket.handshake.query;
    if (!userId || !token) {
      return next(new Error("Authentication failed"));
    }
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;

    socket.join(userId);
    logger.info(`🔐 User ${userId} connected with socket ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info("❌ WebSocket disconnected: " + socket.id);
    });
  });
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function closeSocket(): void {
  io?.close();
  logger.info("🔌 Socket.IO closed.");
}

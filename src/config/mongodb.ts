import mongoose from "mongoose";
import env from "@config/env";
import logger from "@utils/logger";

export async function connectMongo() {
  if (env.environment !== "production") {
    mongoose.set("debug", (collection, method, query, doc, options) => {
      logger.info(`📦 MongoDB ${collection}.${method}`, {
        query,
        doc,
        options,
      });
    });
  }

  await mongoose.connect(env.mongoUri);
  logger.info("📚 Connected to MongoDB");

  mongoose.connection.on("connected", () => {
    logger.info("✅ MongoDB connected");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("⚠️ MongoDB disconnected");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("❌ MongoDB error:", err);
  });
}

export async function disconnectMongo() {
  await mongoose.connection.close();
  logger.info("📚 MongoDB connection closed.");
}

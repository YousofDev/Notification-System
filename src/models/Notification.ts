import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["email", "websocket"],
      required: true,
      index: true,
    },
    to: { type: String, required: true, index: true },
    subject: { type: String },
    templateName: { type: String },
    data: { type: Object },
    status: {
      type: String,
      enum: ["queued", "sent", "failed", "failed_dlq"],
      default: "queued",
    },
  },
  { timestamps: true }
);

// Index for sorting by time
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model("Notification", NotificationSchema);

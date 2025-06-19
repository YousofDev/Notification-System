import cors from "cors";
import env from "@config/env";

const allowedOrigins = env.corsOrigins?.split(",") || [];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ Not allowed by CORS"));
    }
  },
  credentials: true,
};

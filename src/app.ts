import express from "express";
import cors from "cors";
import { corsOptions } from "@config/cors";
import { attachRequestContext } from "@middleware/requestContext";
import { requestLogger } from "@middleware/requestLogger";
import { errorHandler } from "@middleware/errorHandler";
import notificationsRouter from "@routes/notificationsRouter";
import healthRouter from "@routes/healthRouter";
import { apiKeyAuth } from "@middleware/apiKeyAuth";
import { undefinedRouteHandler } from "@middleware/undefinedRouteHandler";

const app = express();
app.use(express.json());
app.use(requestLogger);
app.use(attachRequestContext);
app.use(cors(corsOptions));

app.use("/health", healthRouter);
app.use(apiKeyAuth);
app.use("/api/v1/notifications", notificationsRouter);

app.use(undefinedRouteHandler);
app.use(errorHandler);

export default app;

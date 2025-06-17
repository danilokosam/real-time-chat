import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/api.js";
import { CORS_ORIGIN } from "./utils/constants.js";
import { errorHandler } from "./middlewares/errorHandler.js"

const app = express();

// Apply middleware
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Cookie"],
    methods: ["GET", "POST"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(errorHandler);

// Mount API routes
app.use("/api", apiRoutes);

export default app;

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/api.js";
import { CORS_ORIGIN } from "./utils/constants.js";

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

// Mount API routes
app.use("/api", apiRoutes);

export default app;

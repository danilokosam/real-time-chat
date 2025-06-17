import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3001;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

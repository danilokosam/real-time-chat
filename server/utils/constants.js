import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3001;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
export const SECRET_ACCESS_TOKEN = process.env.SECRET_ACCESS_TOKEN || 'secret1'
export const SECRET_REFRESH_TOKEN = process.env.SECRET_REFRESH_TOKEN || 'secret2'
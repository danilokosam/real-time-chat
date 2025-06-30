import jwt from "jsonwebtoken";
import { SECRET_ACCESS_TOKEN, SECRET_REFRESH_TOKEN } from "./constants.js";

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, SECRET_ACCESS_TOKEN, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, SECRET_REFRESH_TOKEN, { expiresIn: "7d" });
};

export const verify = (token, type) => {
  const secret = type === "access" ? SECRET_ACCESS_TOKEN : SECRET_REFRESH_TOKEN;
  return jwt.verify(token, secret);
};

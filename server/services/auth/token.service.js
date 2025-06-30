import { v4 as uuidv4 } from "uuid";
import * as jwtUtils from "../../utils/jwt.utils.js";
import AppError from "../../utils/appError.js";

export const generateTokens = async (user) => {
  const accessToken = jwtUtils.generateAccessToken({
    id: user.userID,
    username: user.username,
  });

  const refreshToken = jwtUtils.generateRefreshToken({
    id: user.userID,
    username: user.username,
  });

  const sessionToken = uuidv4();

  return { accessToken, refreshToken, sessionToken };
};

export const verifyRefreshToken = async (refreshToken) => {
  try {
    return jwtUtils.verify(refreshToken, "refresh");
  } catch (error) {
    throw new AppError("The JWT expired", 401);
  }
};

export const verifyAccessToken = (token) => {
  try {
    return jwtUtils.verify(token, "access");
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Token expired", 401);
    }
    throw new AppError("Invalid token", 401);
  }
};

export const verifyAccessTokenFromCookies = (cookies) => {
  const accessToken = cookies?.accessToken;
  if (!accessToken || typeof accessToken !== "string") {
    throw new AppError("No access token provided or invalid", 401);
  }
  return verifyAccessToken(accessToken);
};

// import * as jwt from "jsonwebtoken";
// import AppError from "../utils/appError.js";
// import { SECRET_ACCESS_TOKEN } from "../utils/constants.js";

// export const authHandler = (req, res, next) => {
//   const accessToken = req.cookies?.accessToken;

//   if (!accessToken || typeof accessToken !== "string") {
//     throw new AppError("No access token provided or invalid", 401);
//   }

//   try {
//     const payload = jwt.verify(accessToken, SECRET_ACCESS_TOKEN);
//     req.user = payload;
//     next();
//   } catch (error) {
//     console.error("Error verifying access token:", error);
//     if (error.name === "TokenExpiredError") {
//       throw new AppError("Access token expired", 401);
//     }
//     throw new AppError("Invalid access token", 401);
//   }
// };
import { verifyAccessTokenFromCookies } from "../services/auth/token.service.js";

export const authHandler = (req, res, next) => {
  try {
    const payload = verifyAccessTokenFromCookies(req.cookies);
    req.user = payload;
    next();
  } catch (error) {
    logger.error(`Error verifying access token: ${error.message}`);
    next(error);
  }
};

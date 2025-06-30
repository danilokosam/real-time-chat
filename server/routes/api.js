// import express from "express";
// import { v4 as uuidv4 } from "uuid";
// import { login, logout, register } from "../services/authService.js";
// import { authHandler } from "../middlewares/authHandler.js";
// import AppError from "../utils/appError.js";

// const router = express.Router();

// // POST /api/login - Handle user login
// router.post("/login", async (req, res, next) => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password) {
//       throw new AppError("Username and password are required", 400);
//     }

//     const { accessToken, refreshToken, sessionToken } = await login(
//       username,
//       password
//     );

//     // Set session cookie
//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: false, // Set to true in production with HTTPS
//       sameSite: "strict",
//       maxAge: 15 * 60 * 1000, // 15 minutes
//     });
//     console.log(`Set accessToken cookie: ${accessToken}`);

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: false, // Set to true in production with HTTPS
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });
//     console.log(`Set refreshToken cookie: ${refreshToken}`);

//     res.cookie("sessionToken", sessionToken, {
//       httpOnly: true,
//       secure: false, // Set to true in production with HTTPS
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches refreshToken
//     });
//     console.log(`Set sessionToken cookie: ${sessionToken}`);

//     res.status(200).json({
//       message: "Login successful",
//       sessionToken,
//       username,
//     });
//   } catch (err) {
//     next(err);
//   }
// });

// router.post("/register", async (req, res, next) => {
//   try {
//     const userData = req.body;
//     if (!userData.username || !userData.password || !userData.email) {
//       throw new AppError("Username, password, and email are required", 400);
//     }

//     const response = await register(userData);

//     res.cookie("accessToken", response.accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 15 * 60 * 1000,
//     });

//     res.cookie("refreshToken", response.refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.cookie("sessionToken", response.sessionToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     console.log("User registered", { username: userData.username });

//     res.status(201).json({
//       message: "User registered successfully",
//       sessionToken: response.sessionToken,
//       username: userData.username,
//     });
//   } catch (err) {
//     next(err);
//   }
// });

// router.post("/logout", authHandler, async (req, res, next) => {
//   try {
//     const refreshToken = req.cookies?.refreshToken;
//     const sessionToken = req.cookies?.sessionToken;
//     if (!refreshToken || !sessionToken) {
//       throw new AppError("Refresh token or session token missing", 401);
//     }

//     const response = await logout(refreshToken, sessionToken);
//     res
//       .clearCookie("accessToken")
//       .clearCookie("refreshToken")
//       .clearCookie("sessionToken")
//       .json(response);

//     logger.info("User logged out", { userId: req.user.id });
//   } catch (err) {
//     next(err);
//   }
// });

// // GET /api/test-cookie - Test cookie receipt
// router.get("/test-cookie", (req, res) => {
//   const accessToken = req.cookies?.accessToken || "none";
//   console.log(`GET /api/test-cookie received, accessToken: ${accessToken}`);
//   res.json({ accessToken });
// });

// export default router;

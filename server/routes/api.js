import express from "express";
import { v4 as uuidv4 } from "uuid";
import { login, logout, register } from "../services/authService.js";
import { authHandler } from "../middlewares/authHandler.js"

const router = express.Router();

// POST /api/login - Handle user login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { accessToken, refreshToken } = login(username, password)

    // Set session cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    console.log(`Set accessToken cookie: ${accessToken}`);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    console.log(`Set accessToken cookie: ${accessToken}`);

    res.status(201).json({ message: "Login successful" });
  } catch (err) {
    next(err)
  }
});

router.post('/register', (req, res, next) => {
  try {
    const userData = req.body
    const response = register(userData)
    res.status(201).json(response)
  } catch (err) {
    next(err)
  }
})

router.delete('/logout', authHandler, (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken
    const response = logout(refreshToken)
    res.clearCookie('accessToken').clearCookie('refreshToken').json(response)
  } catch (err) {
    next(err)
  }
})

// GET /api/test-cookie - Test cookie receipt
router.get("/test-cookie", (req, res) => {
  const accessToken = req.user || "none"
  console.log(`GET /api/test-cookie received, sessionToken: ${accessToken}`);
  res.json({ accessToken });
});

export default router;

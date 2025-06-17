import express from "express";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import { CORS_ORIGIN } from "../utils/constants.js";

const router = express.Router();

// POST /api/login - Handle user login
router.post("/login", async (req, res) => {
  const { userName } = req.body;
  console.log(`POST /api/login received for username: ${userName}`);
  if (!userName) {
    console.log("Username is required");
    return res.status(400).json({ error: "Username is required" });
  }

  // Validate username
  if (
    userName.length < 3 ||
    userName.length > 20 ||
    !/^[a-zA-Z0-9 ]+$/.test(userName)
  ) {
    console.log("Invalid username");
    return res.status(400).json({ error: "Invalid username" });
  }

  // Check if username is taken
  const existingUser = await User.findOne({ username: userName });
  if (existingUser) {
    console.log(`Username ${userName} already taken`);
    return res.status(409).json({ error: "Username already taken" });
  }

  // Generate new userID and sessionToken
  const newUserID = uuidv4();
  const newSessionToken = uuidv4();
  console.log(
    `Generated userID: ${newUserID}, sessionToken: ${newSessionToken}`
  );

  // Create new user
  await User.create({
    userID: newUserID,
    socketID: null,
    username: userName,
    connected: false,
    sessionToken: newSessionToken,
    createdAt: new Date(),
  });

  // Set session cookie
  res.cookie("sessionToken", newSessionToken, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  console.log(`Set sessionToken cookie: ${newSessionToken}`);

  res.status(200).json({ message: "Login successful" });
});

// GET /api/test-cookie - Test cookie receipt
router.get("/test-cookie", (req, res) => {
  const sessionToken = req.cookies?.sessionToken || "none";
  console.log(`GET /api/test-cookie received, sessionToken: ${sessionToken}`);
  res.json({ sessionToken });
});

// GET /api - Simple test endpoint
router.get("/", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});

export default router;

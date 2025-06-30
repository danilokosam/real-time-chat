import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authHandler } from "../middlewares/authHandler.js";

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authHandler, authController.logout);
router.get("/test-cookie", authController.testCookie);

export default router;

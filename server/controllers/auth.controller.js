import * as authService from "../services/auth/auth.service.js";
import AppError from "../utils/appError.js";

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { accessToken, refreshToken, sessionToken } = await authService.login(
      username,
      password
    );

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log(`Set accessToken cookie 🐦: ${accessToken}`);
    console.log(`Set refreshToken cookie ❤️‍🔥: ${refreshToken}`);
    console.log(`Set sessionToken cookie 🎉: ${sessionToken}`);

    res.status(200).json({
      message: "Login successful ✅✅",
      sessionToken,
      username,
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const userData = req.body;
    const { accessToken, refreshToken, sessionToken } =
      await authService.register(userData);

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log("User registered successfully 🤑🤑", {
      username: userData.username,
    });

    res.status(201).json({
      message: "User registered successfully ✅",
      sessionToken,
      username: userData.username,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken, sessionToken } = req.cookies;
    if (!refreshToken || !sessionToken) {
      throw new AppError("Refresh token or session token missing", 401);
    }

    const response = await authService.logout(refreshToken, sessionToken);

    // Clear cookies
    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .clearCookie("sessionToken");

    console.log("User logged out 👋", { userId: req.user?.id });

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const testCookie = (req, res) => {
  const accessToken = req.cookies?.accessToken || "none";
  console.log(`GET /api/test-cookie received, accessToken ➡️: ${accessToken}`);
  res.json({ accessToken });
};

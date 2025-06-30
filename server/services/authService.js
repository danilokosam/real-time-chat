import { v4 as uuidv4 } from "uuid";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateJwtTokens.js";
import * as jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import UserModel from "../models/User.js";
import * as bcrypt from "bcrypt";
import {
  SECRET_REFRESH_TOKEN,
  SECRET_ACCESS_TOKEN,
} from "../utils/constants.js";

export const login = async (username, password) => {
  if (
    !username ||
    typeof username !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    throw new AppError("Invalid username or password", 400);
  }

  const user = await UserModel.findOne({ username });
  if (!user) {
    throw new AppError("The user not found", 404);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Incorrect Credentials", 401);
  }

  const accessToken = generateAccessToken({
    id: user.userID,
    username: user.username,
  });

  const refreshToken = generateRefreshToken({
    id: user.userID,
    username: user.username,
  });
  const sessionToken = uuidv4(); // Generate new sessionToken

  // Update user with new sessionToken and refreshToken
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  const updatedUser = await UserModel.findOneAndUpdate(
    { userID: user.userID },
    { sessionToken, refreshToken: hashedRefreshToken },
    { new: true }
  );

  if (!updatedUser) {
    throw new AppError("Failed to update user session", 500);
  }

  return { accessToken, refreshToken, sessionToken };
};

export const register = async (userData) => {
  if (!userData.username || !userData.password || !userData.email) {
    throw new AppError("Username, password, and email are required", 400);
  }

  const userAlreadyExists = await UserModel.findOne({
    username: userData.username,
  });
  if (userAlreadyExists) {
    throw new AppError("The user already exists", 409); // 409 Conflict for duplicates
  }

  // Validate username
  if (
    userData.username.length < 3 ||
    userData.username.length > 20 ||
    !/^[a-zA-Z0-9 ]+$/.test(userData.username)
  ) {
    throw new AppError("Invalid Username", 400);
  }

  // Validate password
  if (
    userData.password.length < 8 ||
    !/[A-Z]/.test(userData.password) ||
    !/[0-9]/.test(userData.password)
  ) {
    throw new AppError(
      "Password must be at least 8 characters long and include an uppercase letter and a number",
      400
    );
  }

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    throw new AppError("Invalid email format", 400);
  }

  const newUserID = uuidv4();
  const newSessionToken = uuidv4();
  const hashPassword = await bcrypt.hash(userData.password, 10);
  const newUser = {
    ...userData,
    password: hashPassword,
    sessionToken: newSessionToken,
    userID: newUserID,
  };

  try {
    const createdUser = await UserModel.create(newUser);
    if (!createdUser) {
      throw new AppError("Failed to create user", 500);
    }

    const accessToken = generateAccessToken({
      id: newUser.userID,
      username: newUser.username,
    });

    const refreshToken = generateRefreshToken({
      id: newUser.userID,
      username: newUser.username,
    });

    await UserModel.findOneAndUpdate(
      {
        userID: newUser.userID,
      },
      {
        refreshToken: await bcrypt.hash(refreshToken, 10),
      }
    );
    return { accessToken, refreshToken, sessionToken: newSessionToken };
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("The user already exists", 409);
    }
    console.error("Error creating user:", error);
    throw new AppError("Failed to create user", 500);
  }
};

export const logout = async (refreshToken, sessionToken) => {
  if (!sessionToken || typeof sessionToken !== "string") {
    throw new AppError("Invalid session token", 400);
  }

  const user = await UserModel.findOne({ sessionToken });
  if (!user || !(await bcrypt.compare(refreshToken, user.refreshToken))) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    jwt.verify(refreshToken, SECRET_REFRESH_TOKEN);
  } catch (error) {
    throw new AppError("The JWT expired", 401);
  }

  const updatedUser = await UserModel.findOneAndUpdate(
    { sessionToken },
    { refreshToken: null, sessionToken: null },
    { new: true }
  );

  if (!updatedUser) {
    throw new AppError("Failed to logout", 500);
  }

  return { message: "Logout successfully" };
};

export const verifyToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new AppError("Invalid token", 400);
  }
  console.log("Verifying token:", token); // Add this
  console.log("Using SECRET_ACCESS_TOKEN:", SECRET_ACCESS_TOKEN); // Add this
  try {
    return jwt.verify(token, SECRET_ACCESS_TOKEN);
  } catch (error) {
    console.error("JWT verify error:", error.message); // Add this
    if (error.name === "TokenExpiredError") {
      throw new AppError("Token expired", 401);
    }
    throw new AppError("Invalid token", 401);
  }
};

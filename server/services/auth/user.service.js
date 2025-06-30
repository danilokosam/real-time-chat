import { v4 as uuidv4 } from "uuid";
import User from "../../models/User.js";
import * as bcryptUtils from "../../utils/bcrypt.utils.js";
import AppError from "../../utils/appError.js";

export const findUserByUsername = async (username) => {
  return await User.findOne({ username });
};

export const findUserBySessionToken = async (sessionToken) => {
  return await User.findOne({ sessionToken });
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcryptUtils.compare(password, hashedPassword);
};

export const verifyRefreshToken = async (refreshToken, hashedRefreshToken) => {
  return await bcryptUtils.compare(refreshToken, hashedRefreshToken);
};

export const createUser = async (userData) => {
  const newUserID = uuidv4();
  const newSessionToken = uuidv4();
  const hashPassword = await bcryptUtils.hash(userData.password);

  const newUser = {
    ...userData,
    password: hashPassword,
    sessionToken: newSessionToken,
    userID: newUserID,
  };

  try {
    return await User.create(newUser);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("The user already exists", 409);
    }
    throw new AppError("Failed to create user", 500);
  }
};

export const updateUserTokens = async (userID, refreshToken, sessionToken) => {
  const hashedRefreshToken = await bcryptUtils.hash(refreshToken);
  const updatedUser = await User.findOneAndUpdate(
    { userID },
    { sessionToken, refreshToken: hashedRefreshToken },
    { new: true }
  );
  if (!updatedUser) throw new AppError("Failed to update user session", 500);
  return updatedUser;
};

export const clearUserTokens = async (sessionToken) => {
  const updatedUser = await User.findOneAndUpdate(
    { sessionToken },
    { refreshToken: null, sessionToken: null },
    { new: true }
  );
  if (!updatedUser) throw new AppError("Failed to logout", 500);
  return updatedUser;
};

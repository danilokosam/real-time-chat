import * as userService from "./user.service.js";
import * as tokenService from "./token.service.js";
import * as validationService from "./validation.service.js";
import AppError from "../../utils/appError.js";

export const login = async (username, password) => {
  validationService.validateLoginInput(username, password);

  const user = await userService.findUserByUsername(username);
  if (!user) throw new AppError("The user not found", 404);

  const isMatch = await userService.verifyPassword(password, user.password);
  if (!isMatch) {
    throw new AppError("Incorrect Credentials", 401);
  }

  const { accessToken, refreshToken, sessionToken } =
    await tokenService.generateTokens(user);
  await userService.updateUserTokens(user.userID, refreshToken, sessionToken);

  return { accessToken, refreshToken, sessionToken };
};

export const register = async (userData) => {
  validationService.validateRegisterInput(userData);

  const userExists = await userService.findUserByUsername(userData.username);
  if (userExists) {
    throw new AppError("Username already exists", 409);
  }
  const newUser = await userService.createUser(userData);
  const { accessToken, refreshToken, sessionToken } =
    await tokenService.generateTokens(newUser);
  await userService.updateUserTokens(
    newUser.userID,
    refreshToken,
    sessionToken
  );

  return { accessToken, refreshToken, sessionToken };
};

export const logout = async (refreshToken, sessionToken) => {
  validationService.validateLogoutInput(sessionToken);

  const user = await userService.findUserBySessionToken(sessionToken);
  if (
    !user ||
    !(await userService.verifyRefreshToken(refreshToken, user.refreshToken))
  ) {
    throw new AppError("Unauthorized", 401);
  }

  await tokenService.verifyRefreshToken(refreshToken);
  await userService.clearUserTokens(sessionToken);

  return { message: "Logout successfully" };
};

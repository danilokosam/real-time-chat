import AppError from "../../utils/appError.js";

export const validateLoginInput = (username, password) => {
  if (
    !username ||
    typeof username !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    throw new AppError("Invalid username or password", 400);
  }
};

export const validateRegisterInput = (userData) => {
  if (!userData.username || !userData.password || !userData.email) {
    throw new AppError("Username, password, and email are required", 400);
  }

  if (
    userData.username.length < 3 ||
    userData.username.length > 20 ||
    !/^[a-zA-Z0-9 ]+$/.test(userData.username)
  ) {
    throw new AppError("Invalid Username", 400);
  }

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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    throw new AppError("Invalid email format", 400);
  }
};

export const validateLogoutInput = (sessionToken) => {
  if (!sessionToken || typeof sessionToken !== "string") {
    throw new AppError("Invalid session token", 400);
  }
};

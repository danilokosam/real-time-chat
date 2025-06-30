// import cookie from "cookie";
// import { verifyToken } from "../services/authService.js";

// // Socket.IO middleware to parse cookies and authenticate user
// export const cookieMiddleware = async (socket, next) => {
//   const rawCookies = socket.request.headers.cookie || "none";
//   console.log(`Socket.IO incoming cookies: ${rawCookies}`);

//   if (rawCookies === "none") {
//     socket.request.cookies = {};
//     return next(new Error("No cookies provided"));
//   }

//   // Parse cookies
//   const parsedCookies = cookie.parse(rawCookies);
//   socket.request.cookies = parsedCookies;
//   console.log(`Parsed cookies for socket: ${JSON.stringify(parsedCookies)}`);

//   const accessToken = parsedCookies.accessToken;
//   if (!accessToken) {
//     return next(new Error("No access token provided"));
//   }

//   try {
//     const payload = await verifyToken(accessToken);
//     socket.userID = payload.userID;
//     console.log(
//       `Authenticated socket ${socket.id} for userID ${socket.userID}`
//     );
//     next();
//   } catch (error) {
//     console.error(`Authentication error: ${error.message}`);
//     next(new Error("Invalid access token"));
//   }
// };
import { parseCookies, getAccessToken } from "../utils/cookie.utils.js";
import { verifyAccessTokenFromCookies } from "../services/auth/token.service.js";

export const cookieMiddleware = async (socket, next) => {
  const rawCookies = socket.request.headers.cookie || "none";
  console.log(`Socket.IO incoming cookies: ${rawCookies}`);

  // Parse cookies even if none are provided
  const parsedCookies = parseCookies(rawCookies);
  socket.request.cookies = parsedCookies;
  console.log(`Parsed cookies for socket: ${JSON.stringify(parsedCookies)}`);

  // Try to authenticate if accessToken is present
  const accessToken = getAccessToken(parsedCookies);
  if (accessToken) {
    try {
      const payload = await verifyAccessTokenFromCookies(parsedCookies);
      socket.userID = payload.id;
      console.log(
        `Authenticated socket ${socket.id} for userID ${socket.userID}`
      );
    } catch (error) {
      console.error(`Authentication error: ${error.message}`);
      socket.userID = null;
    }
  } else {
    console.log("No access token provided");
    socket.userID = null;
  }

  next();
};

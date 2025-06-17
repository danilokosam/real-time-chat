import cookie from "cookie";

// Socket.IO middleware to parse cookies from incoming connections
export const cookieMiddleware = (socket, next) => {
  const rawCookies = socket.request.headers.cookie || "none";
  console.log(`Socket.IO incoming cookies: ${rawCookies}`);

  if (rawCookies !== "none") {
    const parsedCookies = cookie.parse(rawCookies);
    socket.request.cookies = parsedCookies;
    console.log(`Parsed cookies for socket: ${JSON.stringify(parsedCookies)}`);
  } else {
    socket.request.cookies = {};
  }

  next();
};

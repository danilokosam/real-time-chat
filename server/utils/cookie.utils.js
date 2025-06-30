import cookie from "cookie";

export const parseCookies = (rawCookies) => {
  return rawCookies && rawCookies !== "none" ? cookie.parse(rawCookies) : {};
};

export const getAccessToken = (cookies) => {
  return cookies?.accessToken;
};

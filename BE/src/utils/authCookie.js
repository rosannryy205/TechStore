const AUTH_COOKIE_NAME = "auth_token";

const getAuthCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
};

module.exports = { AUTH_COOKIE_NAME, getAuthCookieOptions, clearAuthCookie };

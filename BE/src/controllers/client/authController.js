const authService = require("../../services/client/authService");
const {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  clearAuthCookie,
} = require("../../utils/authCookie");

/**
 * POST /api/auth/login
 * Body: { email, password }
 * - Set JWT vào cookie httpOnly: auth_token
 */
const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const { token, user } = await authService.loginService({ email, password });

    res.cookie(AUTH_COOKIE_NAME, token, {
      ...getAuthCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (đồng bộ với JWT_EXPIRES_IN)
    });

    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/auth/logout
 * - Clear auth_token cookie
 */
const logoutController = async (req, res, next) => {
  try {
    clearAuthCookie(res);

    return res.status(200).json({ success: true });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/auth/me
 * - requireAuth middleware attach req.user.id
 */
const meController = async (req, res, next) => {
  try {
    const user = await authService.meService({ userId: req.user.id });
    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    // Trạng thái có thể thay đổi sau truy vấn của requireAuth.
    if (error.statusCode === 401 || error.code === "ACCOUNT_LOCKED") {
      clearAuthCookie(res);
    }
    return next(error);
  }
};

module.exports = {
  loginController,
  logoutController,
  meController,
};


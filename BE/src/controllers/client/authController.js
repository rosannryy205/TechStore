const authService = require("../../services/client/authService");

/**
 * POST /api/auth/login
 * Body: { email, password }
 * - Set JWT vào cookie httpOnly: auth_token
 */
const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const { token, user } = await authService.loginService({ email, password });

    // Cookie options
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: isProd, // production cần https
      sameSite: isProd ? "none" : "lax",
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
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

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
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  loginController,
  logoutController,
  meController,
};


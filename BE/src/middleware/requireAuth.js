const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const rejectSession = (res, shouldClearCookie) => {
  if (shouldClearCookie) {
    // Đồng bộ cờ cookie với login/logout trong authController.
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
  }
  return res.status(401).json({ success: false, message: "Unauthorized" });
};

const requireAuth = async (req, res, next) => {
  const token = req.cookies?.auth_token;
  if (!token) return rejectSession(res, false);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return rejectSession(res, true);
  }

  if (!Number.isSafeInteger(payload?.userId) || payload.userId < 1) {
    return rejectSession(res, true);
  }

  try {
    const user = await User.findByPk(payload.userId, {
      attributes: ["id", "role", "status"],
    });
    if (!user || user.status !== 1) return rejectSession(res, true);

    req.user = { id: user.id, role: user.role, status: user.status };
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = requireAuth;

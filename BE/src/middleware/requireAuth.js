const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const assertActiveAccount = require("../utils/assertActiveAccount");
const { AUTH_COOKIE_NAME, clearAuthCookie } = require("../utils/authCookie");

const requireAuth = async (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    clearAuthCookie(res);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!Number.isSafeInteger(payload?.userId) || payload.userId <= 0) {
    clearAuthCookie(res);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const user = await User.findByPk(payload.userId, {
      attributes: ["id", "role", "status"],
    });

    assertActiveAccount(user);
    req.user = { id: user.id, role: user.role, status: user.status };
    return next();
  } catch (error) {
    if (error.statusCode === 401 || error.code === "ACCOUNT_LOCKED") {
      clearAuthCookie(res);
    }
    return next(error);
  }
};

module.exports = requireAuth;

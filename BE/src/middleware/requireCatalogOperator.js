const User = require("../models/userModel");

// Chạy sau requireAuth; luôn đọc quyền hiện tại, không tin role/status trong JWT.
module.exports = async function requireCatalogOperator(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "role", "status"],
    });

    if (!user || user.status !== 1 || !["admin", "staff"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Bạn không có quyền thực hiện thao tác này.",
      });
    }

    req.user.role = user.role;
    req.user.status = user.status;
    return next();
  } catch (error) {
    return next(error);
  }
};

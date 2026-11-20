const User = require("../models/userModel");

const denyAccess = (res, message) => res.status(403).json({ success: false, message });

const createAdminGuard = ({
  requiresActiveStatus = false,
  forbiddenMessage = "Forbidden: Admin access required",
} = {}) =>
  async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: requiresActiveStatus ? ["id", "role", "status"] : ["id", "role"],
      });

      if (!user || user.role !== "admin") {
        return denyAccess(res, forbiddenMessage);
      }
      if (requiresActiveStatus && user.status !== 1) {
        return denyAccess(res, "Tài khoản đã bị khóa");
      }

      req.user.role = user.role;
      return next();
    } catch (error) {
      // Giữ contract lỗi của các tuyến review đang dùng guard mặc định.
      return requiresActiveStatus ? next(error) : denyAccess(res, forbiddenMessage);
    }
  };

module.exports = createAdminGuard;

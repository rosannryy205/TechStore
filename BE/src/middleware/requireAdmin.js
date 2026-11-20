// Chạy sau requireAuth, dùng quyền đã đọc từ DB cho request hiện tại.
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin" || req.user.status !== 1) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    });
  }
  return next();
};

module.exports = requireAdmin;

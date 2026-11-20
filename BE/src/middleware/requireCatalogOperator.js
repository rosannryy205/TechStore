// Chạy sau requireAuth, dùng quyền đã đọc từ DB cho request hiện tại.
const requireCatalogOperator = (req, res, next) => {
  const user = req.user;
  if (user?.status !== 1 || !["admin", "staff"].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Bạn không có quyền thực hiện thao tác này.",
    });
  }
  return next();
};

module.exports = requireCatalogOperator;

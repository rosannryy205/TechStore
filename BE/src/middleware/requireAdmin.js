const createAdminGuard = require("./createAdminGuard");

// Chạy sau requireAuth để sử dụng req.user.id.
const requireAdmin = createAdminGuard();

module.exports = requireAdmin;

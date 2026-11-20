const createAdminGuard = require("./createAdminGuard");

const requireActiveAdmin = createAdminGuard({
  requiresActiveStatus: true,
  forbiddenMessage: "Access denied. Admin only",
});

module.exports = requireActiveAdmin;

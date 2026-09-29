const express = require("express");
const router = express.Router();

const requireAuth = require("../../middleware/requireAuth");
const { loginLimiter } = require("../../middleware/rateLimiter");
const {
  loginController,
  logoutController,
  meController,
} = require("../../controllers/client/authController");
const {
  loginRules,
  handleValidationErrors,
} = require("../../validators/authValidators");

// Auth APIs
router.post(
  "/login",
  loginLimiter,
  loginRules(),
  handleValidationErrors,
  loginController,
);
router.post("/logout", logoutController);
router.get("/me", requireAuth, meController);

module.exports = router;

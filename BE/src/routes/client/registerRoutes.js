const express = require("express");
const router = express.Router();
const {
  registerUser,
  sendVerificationCode,
} = require("../../controllers/client/registerController");
const {
  sendCodeRules,
  registerRules,
  handleValidationErrors,
} = require("../../validators/authValidators");

// Gửi OTP xác minh email
router.post(
  "/send-code",
  sendCodeRules(),
  handleValidationErrors,
  sendVerificationCode,
);

// Tạo tài khoản sau khi xác minh (server tự verify lại theo Option B)
router.post("/", registerRules(), handleValidationErrors, registerUser);

module.exports = router;

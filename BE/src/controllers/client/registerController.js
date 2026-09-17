const {
  registerUser,
  sendVerificationCode,
} = require("../../services/client/registerService");

/**
 * Controller gửi OTP xác minh email.
 * Nhận body: { email }
 */
const sendVerificationCodeController = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    await sendVerificationCode({ email });

    res.status(200).json({ success: true, message: "Verification code sent" });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller đăng ký tài khoản mới.
 * Nhận body: { email, password, code }
 */
const registerUserController = async (req, res, next) => {
  try {
    const { email, password, code } = req.body || {};

    const result = await registerUser({ email, password, code });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser: registerUserController,
  sendVerificationCode: sendVerificationCodeController,
};


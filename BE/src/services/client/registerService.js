const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

// Model người dùng
const User = require("../../models/userModel");
const EmailVerificationCode = require("../../models/emailVerificationCodeModel");

const { sendVerificationEmail } = require("./emailService");

const randomDigits10 = () => {
  // Tạo chuỗi số random độ dài đúng 10 chữ số
  const max = 10 ** 10;
  const n = Math.floor(Math.random() * max);
  return String(n).padStart(10, "0");
};

const randomOtp6 = () => {
  const max = 10 ** 6;
  const n = Math.floor(Math.random() * max);
  return String(n).padStart(6, "0");
};

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const validateRegisterInput = ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = typeof password === "string" ? password : "";

  if (!normalizedEmail) return { ok: false, message: "Email is required" };
  if (!normalizedPassword) return { ok: false, message: "Password is required" };
  if (normalizedPassword.length < 6)
    return { ok: false, message: "Password must be at least 6 characters" };

  return { ok: true, data: { email: normalizedEmail, password: normalizedPassword } };
};

const validateOtpInput = ({ email, code }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedCode = typeof code === "string" ? code.trim() : "";

  if (!normalizedEmail) return { ok: false, message: "Email is required" };
  if (!normalizedCode) return { ok: false, message: "Verification code is required" };
  if (!/^\d{6}$/.test(normalizedCode))
    return { ok: false, message: "Verification code must be 6 digits" };

  return { ok: true, data: { email: normalizedEmail, code: normalizedCode } };
};

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);

/**
 * Send verification OTP code to email.
 */
const sendVerificationCode = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    const err = new Error("Email is required");
    err.statusCode = 400;
    throw err;
  }

  const otp = randomOtp6();
  const otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  // Hash OTP để lưu DB
  const otpHash = await bcrypt.hash(otp, 10);

  // Tạo OTP mới: xóa OTP cũ chưa used để tránh nhiễu
  await EmailVerificationCode.destroy({
    where: {
      email: { [Op.eq]: normalizedEmail },
      used_at: null,
    },
  });

  await EmailVerificationCode.create({
    email: normalizedEmail,
    code_hash: otpHash,
    expires_at: otpExpiresAt,
  });

  await sendVerificationEmail({ toEmail: normalizedEmail, code: otp });

  return { sent: true };
};

/**
 * Verify OTP code.
 */
const verifyVerificationCode = async ({ email, code }) => {
  const validation = validateOtpInput({ email, code });
  if (!validation.ok) {
    const err = new Error(validation.message);
    err.statusCode = 400;
    throw err;
  }

  const { email: normalizedEmail, code: normalizedCode } = validation.data;

  const record = await EmailVerificationCode.findOne({
    where: {
      email: { [Op.eq]: normalizedEmail },
      used_at: null,
      expires_at: { [Op.gt]: new Date() },
    },
    order: [["created_at", "DESC"]],
  });

  if (!record) {
    const err = new Error("Verification code is invalid or expired");
    err.statusCode = 400;
    throw err;
  }

  const isMatch = await bcrypt.compare(normalizedCode, record.code_hash);
  if (!isMatch) {
    const err = new Error("Verification code is invalid");
    err.statusCode = 400;
    throw err;
  }

  record.used_at = new Date();
  await record.save();

  return { verified: true };
};

/**
 * Register a new user after OTP verification (Option B).
 * Input: { email, password, code }
 */
const registerUser = async ({ email, password, code }) => {
  const validation = validateRegisterInput({ email, password });
  if (!validation.ok) {
    const err = new Error(validation.message);
    err.statusCode = 400;
    throw err;
  }

  const { email: normalizedEmail, password: rawPassword } = validation.data;

  // Verify OTP inside backend (Option B)
  await verifyVerificationCode({ email: normalizedEmail, code });

  // Check duplicate email
  const existing = await User.findOne({
    where: {
      email: { [Op.eq]: normalizedEmail },
    },
    attributes: ["id"],
  });

  if (existing) {
    const err = new Error("Email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  const randomName = `user${randomDigits10()}`;

  const createdUser = await User.create({
    email: normalizedEmail,
    name: randomName,
    password: hashedPassword,
  });

  return createdUser.toJSON();
};

module.exports = {
  registerUser,
  sendVerificationCode,
  verifyVerificationCode,
};


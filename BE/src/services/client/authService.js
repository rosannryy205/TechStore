const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../../models/userModel");
const { toPrivateUser, USER_PRIVATE_FIELDS } = require("../../utils/userSerializer");

const buildJwt = ({ userId }) => {
  // JWT đặt trong cookie httpOnly nên client không đọc được token.
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign({ userId }, secret, { expiresIn });
};

/**
 * loginService
 * - Validate email/password
 * - Sign JWT
 */
const loginService = async ({ email, password }) => {
  // Email/password đã được validate bởi express-validator ở router
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    where: { email: normalizedEmail },
    attributes: [...USER_PRIVATE_FIELDS, "password"],
  });

  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = buildJwt({ userId: user.id });

  return {
    token,
    user: toPrivateUser(user),
  };
};

/**
 * meService
 * - Lấy user theo id từ req.user
 */
const meService = async ({ userId }) => {
  const user = await User.findByPk(userId, {
    attributes: [...USER_PRIVATE_FIELDS],
  });

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return toPrivateUser(user);
};

module.exports = {
  loginService,
  meService,
};

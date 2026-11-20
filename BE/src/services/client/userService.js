const User = require("../../models/userModel");
const { toPrivateUser, USER_PRIVATE_FIELDS } = require("../../utils/userSerializer");

const getAllUsers = async () => {
  const users = await User.findAll({
    attributes: [...USER_PRIVATE_FIELDS],
  });

  return users.map(toPrivateUser);
};

/**
 * updateProfile
 * - Cập nhật thông tin cá nhân của user (không cho phép sửa email)
 * @param {number} userId
 * @param {Object} data - { name, phone, address }
 * @returns {Promise<Object>} user object (without password)
 */
const updateProfile = async (userId, data) => {
  const { name, phone, address } = data || {};

  const user = await User.findByPk(userId, { attributes: ["id"] });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  // Chỉ cập nhật các field được phép
  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (phone !== undefined) updateData.phone = phone.trim();
  if (address !== undefined) updateData.address = address.trim();

  if (Object.keys(updateData).length > 0) {
    await User.update(updateData, { where: { id: userId } });
  }

  const updatedUser = await User.findByPk(userId, {
    attributes: [...USER_PRIVATE_FIELDS],
  });

  return toPrivateUser(updatedUser);
};

module.exports = {
  getAllUsers,
  updateProfile,
};

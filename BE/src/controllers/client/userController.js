const { getAllUsers, updateProfile } = require("../../services/client/userService");

const getAllUsersController = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile
 * - Cập nhật thông tin cá nhân (name, phone, address)
 * - Email không được phép chỉnh sửa
 */
const updateProfileController = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body || {};
    const user = await updateProfile(req.user.id, { name, phone, address });
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getAllUsers: getAllUsersController,
  updateProfile: updateProfileController,
};

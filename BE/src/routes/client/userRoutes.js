const express = require("express");
const router = express.Router();
const { getAllUsers, updateProfile } = require("../../controllers/client/userController");
const requireAuth = require("../../middleware/requireAuth");

// Định nghĩa route để lấy tất cả người dùng
router.get("/", getAllUsers);

// PUT /api/users/profile — Cập nhật thông tin cá nhân (yêu cầu đăng nhập)
router.put("/profile", requireAuth, updateProfile);

// Xuất router để sử dụng trong app.js
module.exports = router;

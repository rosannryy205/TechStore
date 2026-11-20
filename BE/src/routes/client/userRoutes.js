const express = require("express");
const { getAllUsers, updateProfile } = require("../../controllers/client/userController");
const requireAuth = require("../../middleware/requireAuth");
const requireActiveAdmin = require("../../middleware/requireActiveAdmin");

const router = express.Router();

router.get("/", requireAuth, requireActiveAdmin, getAllUsers);

// PUT /api/users/profile — Cập nhật thông tin cá nhân (yêu cầu đăng nhập)
router.put("/profile", requireAuth, updateProfile);

// Xuất router để sử dụng trong app.js
module.exports = router;

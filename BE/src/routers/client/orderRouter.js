const express = require("express");
const router = express.Router();

const requireAuth = require("../../middleware/requireAuth");
const {
  createOrderController,
  getMyOrdersController,
  cancelOrderController,
} = require("../../controllers/client/orderController");
const {
  createOrderRules,
  handleValidationErrors,
} = require("../../validators/orderValidators");

// POST /api/orders — Tạo đơn hàng (yêu cầu đăng nhập)
router.post(
  "/",
  requireAuth,
  createOrderRules(),
  handleValidationErrors,
  createOrderController,
);

// GET /api/orders/my-orders — Lấy danh sách đơn hàng của user (yêu cầu đăng nhập)
router.get("/my-orders", requireAuth, getMyOrdersController);

// PUT /api/orders/:id/cancel — Hủy đơn hàng (chỉ khi pending) (yêu cầu đăng nhập)
router.put("/:id/cancel", requireAuth, cancelOrderController);

module.exports = router;

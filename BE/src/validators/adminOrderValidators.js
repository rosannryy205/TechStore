const { body, param, query, validationResult } = require("express-validator");
const { STATUSES } = require("../services/orderStatusService");

const idRule = () => param("id").isInt({ min: 1 }).toInt();
const statusRules = () => [idRule(), body("expected_status").isIn(STATUSES), body("target_status").isIn(["confirmed", "processing", "shipping"])];
const cancelRules = (operator = false) => [
  idRule(), body("request_id").isString().isLength({ min: 8, max: 64 }).matches(/^[a-zA-Z0-9_-]+$/),
  body("expected_status").isIn(STATUSES),
  operator ? body("reason").isString().trim().isLength({ min: 1, max: 1000 }) : body("reason").optional().isString().trim().isLength({ max: 1000 }),
];
const listRules = () => [
  query("*").custom((value) => typeof value === "string").withMessage("Query phải là giá trị đơn."),
  query("page").optional().isInt({ min: 1, max: 1000000 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 8 }).toInt(),
  query("status").optional().isIn(["all", ...STATUSES]),
  query("search").optional().isString().trim().isLength({ max: 100 }),
  query("paymentMethod").optional().isIn(["all", "cod", "vnpay", "momo"]),
  query("paymentStatus").optional().isIn(["all", "pending", "paid", "failed"]),
  query("dateRange").optional().isIn(["all", "today", "7days", "30days"]),
  query("sortBy").optional().isIn(["newest", "oldest", "total_desc", "total_asc"]),
];
const bulkRules = () => [
  body("target_status").isIn(["confirmed", "processing"]),
  body("orders").isArray({ min: 1, max: 8 }).custom((orders) => new Set(orders.map((item) => String(item.id))).size === orders.length),
  body("orders.*.id").isInt({ min: 1 }).toInt(), body("orders.*.expected_status").isIn(STATUSES),
];
const validate = (req, res, next) => validationResult(req).isEmpty() ? next() : res.status(400).json({ success: false, message: "Dữ liệu yêu cầu đơn hàng không hợp lệ.", code: "VALIDATION_ERROR" });
module.exports = { idRule, statusRules, cancelRules, listRules, bulkRules, validate };

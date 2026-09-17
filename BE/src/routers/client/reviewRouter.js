const express = require("express");
const router = express.Router();

const requireAuth = require("../../middleware/requireAuth");
const requireAdmin = require("../../middleware/requireAdmin");
const upload = require("../../middleware/upload");
const {
  getReviewsController,
  createReviewController,
  createReplyController,
  updateStatusController,
  likeReviewController,
} = require("../../controllers/client/reviewController");
const {
  getReviewsRules,
  createReviewRules,
  createReplyRules,
  updateStatusRules,
  likeReviewRules,
  handleValidationErrors,
} = require("../../validators/reviewValidators");

// Lấy danh sách review theo sản phẩm (công khai).
router.get(
  "/",
  getReviewsRules(),
  handleValidationErrors,
  getReviewsController,
);

// Tạo review mới: bắt buộc đăng nhập + cho phép upload media.
router.post(
  "/",
  requireAuth,
  upload.array("media", 5),
  createReviewRules(),
  handleValidationErrors,
  createReviewController,
);

// Admin trả lời review.
router.post(
  "/:id/replies",
  requireAuth,
  requireAdmin,
  createReplyRules(),
  handleValidationErrors,
  createReplyController,
);

// Admin duyệt / từ chối review.
router.put(
  "/:id/status",
  requireAuth,
  requireAdmin,
  updateStatusRules(),
  handleValidationErrors,
  updateStatusController,
);

// Thích review.
router.post(
  "/:id/like",
  requireAuth,
  likeReviewRules(),
  handleValidationErrors,
  likeReviewController,
);

module.exports = router;

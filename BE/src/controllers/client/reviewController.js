const reviewService = require("../../services/client/reviewService");

/**
 * GET /api/reviews?productId=
 * - Công khai: ai cũng xem được.
 */
const getReviewsController = async (req, res, next) => {
  try {
    const { productId } = req.query;
    const data = await reviewService.getReviewsByProduct({
      productId: Number(productId),
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/reviews
 * - Bắt buộc đăng nhập (requireAuth).
 * - Body: { productId, productVariantId?, rating, title?, content }
 * - Media: upload.array("media", 5) đính kèm.
 */
const createReviewController = async (req, res, next) => {
  try {
    const { productId, productVariantId, rating, title, content } = req.body;

    const review = await reviewService.createReview({
      userId: req.user.id,
      productId: Number(productId),
      productVariantId: productVariantId ? Number(productVariantId) : null,
      rating: Number(rating),
      title: title || "",
      content,
      media: req.files || [],
    });

    return res.status(201).json({ success: true, data: review });
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/reviews/:id/replies
 * - Bắt buộc admin (requireAuth + requireAdmin).
 */
const createReplyController = async (req, res, next) => {
  try {
    const reply = await reviewService.addReply({
      reviewId: Number(req.params.id),
      replierId: req.user.id,
      content: req.body.content,
    });

    return res.status(201).json({ success: true, data: reply });
  } catch (err) {
    return next(err);
  }
};

/**
 * PUT /api/reviews/:id/status
 * - Bắt buộc admin (requireAuth + requireAdmin).
 */
const updateStatusController = async (req, res, next) => {
  try {
    const review = await reviewService.updateReviewStatus({
      reviewId: Number(req.params.id),
      status: req.body.status,
    });

    return res.status(200).json({ success: true, data: review });
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /api/reviews/:id/like
 * - Bắt buộc đăng nhập (requireAuth).
 */
const likeReviewController = async (req, res, next) => {
  try {
    const result = await reviewService.toggleLike({
      reviewId: Number(req.params.id),
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getReviewsController,
  createReviewController,
  createReplyController,
  updateStatusController,
  likeReviewController,
};

const path = require("path");
const {
  sequelize,
  Review,
  ReviewMedia,
  ReviewReplies,
  User,
  Product,
  ProductVariant,
  Order,
  OrderItem,
} = require("../../models");

// Lấy URL tĩnh cho media (đồng bộ với thư mục uploads).
const mediaUrl = (filename) => `/uploads/reviews/${path.basename(filename)}`;

/**
 * Lấy danh sách review của 1 sản phẩm.
 * - Trả về cả review "approved" và "pending".
 * - Review "pending" có cờ isPending=true để FE hiển thị mờ.
 * - Chỉ lấy cột cần thiết để tối ưu truy vấn.
 */
async function getReviewsByProduct({ productId }) {
  const reviews = await Review.findAll({
    where: { product_id: productId },
    attributes: [
      "id",
      "product_id",
      "product_variant_id",
      "user_id",
      "order_id",
      "rating",
      "title",
      "content",
      "is_verified_purchase",
      "status",
      "like_count",
      "created_at",
    ],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "avatar"],
      },
      {
        model: ReviewMedia,
        as: "media",
        attributes: ["id", "media_type", "url", "sort_order"],
      },
      {
        model: ReviewReplies,
        as: "replies",
        attributes: ["id", "replier_id", "content", "created_at"],
        include: [
          {
            model: User,
            as: "replier",
            attributes: ["id", "name", "avatar"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Map sang dạng FE cần, thêm cờ isPending và chuẩn hóa media/replies.
  return reviews.map((r) => {
    const plain = r.get({ plain: true });
    return {
      id: plain.id,
      productId: plain.product_id,
      productVariantId: plain.product_variant_id,
      user: plain.user,
      rating: plain.rating,
      title: plain.title || "",
      content: plain.content,
      hasPurchased: !!plain.is_verified_purchase,
      status: plain.status,
      isPending: plain.status === "pending",
      likeCount: plain.like_count,
      createdAt: plain.created_at,
      media: (plain.media || []).map((m) => ({
        id: m.id,
        type: m.media_type,
        url: m.url,
      })),
      replies: (plain.replies || []).map((rep) => ({
        id: rep.id,
        user: rep.replier,
        content: rep.content,
        createdAt: rep.created_at,
      })),
    };
  });
}

/**
 * Tạo review mới + media đính kèm.
 * - Mặc định status = "pending" chờ admin duyệt.
 * - Dùng transaction để đảm bảo tạo review + media thành công/rollback chung.
 */
async function createReview({
  userId,
  productId,
  productVariantId,
  rating,
  title,
  content,
  media = [],
}) {
  return sequelize.transaction(async (t) => {
    // Kiểm tra sản phẩm tồn tại.
    const product = await Product.findByPk(productId, {
      attributes: ["id"],
      transaction: t,
    });
    if (!product) {
      const err = new Error("Sản phẩm không tồn tại");
      err.statusCode = 404;
      throw err;
    }

    // Kiểm tra user đã mua sản phẩm (bất kỳ variant nào).
    const purchased = await hasPurchasedProductProduct(userId, productId, t);

    const review = await Review.create(
      {
        product_id: productId,
        product_variant_id: productVariantId || null,
        user_id: userId,
        order_id: null,
        rating,
        title: title || "",
        content,
        is_verified_purchase: purchased,
        status: "pending",
        like_count: 0,
      },
      { transaction: t },
    );

    // Tạo media nếu có.
    if (media.length > 0) {
      const mediaRows = media.map((item, idx) => ({
        review_id: review.id,
        media_type: item.mimetype.startsWith("video") ? "video" : "image",
        url: mediaUrl(item.filename),
        sort_order: idx,
      }));
      await ReviewMedia.bulkCreate(mediaRows, { transaction: t });
    }

    return review.get({ plain: true });
  });
}

/**
 * Helper: kiểm tra user đã mua sản phẩm hay không (trong transaction).
 * - Duyệt qua OrderItem -> ProductVariant -> Product để xác định sản phẩm.
 */
async function hasPurchasedProductProduct(userId, productId, t) {
  // Tìm order đã completed của user.
  const orders = await Order.findAll({
    where: { user_id: userId, order_status: "completed" },
    attributes: ["id"],
    transaction: t,
  });

  if (orders.length === 0) return false;

  const orderIds = orders.map((o) => o.id);

  // Tìm order_item thuộc các order này, và biến thể thuộc sản phẩm yêu cầu.
  const item = await OrderItem.findOne({
    where: { order_id: orderIds },
    attributes: ["id"],
    include: [
      {
        model: ProductVariant,
        as: "variant",
        attributes: ["id"],
        where: { product_id: productId },
        required: true,
      },
    ],
    transaction: t,
  });

  return !!item;
}

/**
 * Admin trả lời review.
 */
async function addReply({ reviewId, replierId, content }) {
  const review = await Review.findByPk(reviewId, { attributes: ["id"] });
  if (!review) {
    const err = new Error("Review không tồn tại");
    err.statusCode = 404;
    throw err;
  }

  const reply = await ReviewReplies.create({
    review_id: reviewId,
    replier_id: replierId,
    content,
  });

  return reply.get({ plain: true });
}

/**
 * Admin duyệt / từ chối review.
 */
async function updateReviewStatus({ reviewId, status }) {
  const review = await Review.findByPk(reviewId, { attributes: ["id"] });
  if (!review) {
    const err = new Error("Review không tồn tại");
    err.statusCode = 404;
    throw err;
  }

  review.status = status;
  await review.save({ fields: ["status"] });

  return review.get({ plain: true });
}

/**
 * Tăng/giảm like_count của review.
 * - Giữ đơn giản: tăng 1 mỗi lần gọi (không dùng bảng like riêng).
 */
async function toggleLike({ reviewId }) {
  const review = await Review.findByPk(reviewId, {
    attributes: ["id", "like_count"],
  });
  if (!review) {
    const err = new Error("Review không tồn tại");
    err.statusCode = 404;
    throw err;
  }

  review.like_count = (review.like_count || 0) + 1;
  await review.save({ fields: ["like_count"] });

  return { id: review.id, likeCount: review.like_count };
}

module.exports = {
  getReviewsByProduct,
  createReview,
  addReply,
  updateReviewStatus,
  toggleLike,
};

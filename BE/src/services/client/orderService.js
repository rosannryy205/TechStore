/**
 * Order Service
 * - Xử lý logic tạo đơn hàng
 * - Transaction đảm bảo tính toàn vẹn dữ liệu
 * - Validate stock server-side, không tin tưởng FE
 */
const {
  sequelize,
  Order,
  OrderItem,
  ProductVariant,
  Product,
  CartItem,
  Cart,
} = require("../../models");
const cartService = require("./cartService");

/**
 * createOrder
 * - Tạo đơn hàng từ giỏ hàng của user
 * - Transaction: tạo order → tạo order_items → trừ stock → xóa cart_items
 *
 * @param {Object} params
 * @param {number} params.userId - ID người dùng
 * @param {Object} params.shippingInfo - { receiver_name, receiver_phone, receiver_email, address }
 * @param {string} params.paymentMethod - 'cod' | 'vnpay' | 'momo'
 * @param {string} [params.note] - Ghi chú đơn hàng
 * @returns {Promise<Object>} { order, items }
 */
async function createOrder({
  userId,
  shippingInfo,
  paymentMethod = "cod",
  note = "",
}) {
  // shippingInfo đã được validate bởi express-validator ở router
  const { receiver_name, receiver_phone, receiver_email, address } =
    shippingInfo || {};

  return sequelize
    .transaction(async (t) => {
      // ─── Lấy cart của user ───
      const cart = await Cart.findOne({
        where: { user_id: userId },
        attributes: ["id"],
        transaction: t,
      });

      if (!cart) {
        const err = new Error("Cart not found");
        err.statusCode = 404;
        throw err;
      }

      // ─── Lấy cart items kèm variant & product info ───
      const cartItems = await CartItem.findAll({
        where: { cart_id: cart.id },
        attributes: ["product_variant_id", "quantity"],
        include: [
          {
            model: ProductVariant,
            as: "variant",
            attributes: ["id", "product_id", "price", "sale_price", "stock"],
          },
        ],
        transaction: t,
      });

      if (!cartItems || cartItems.length === 0) {
        const err = new Error("Your cart is empty");
        err.statusCode = 400;
        throw err;
      }

      // ─── Kiểm tra stock & tính giá từng item ───
      const orderItemsData = [];
      let subtotal = 0;

      for (const item of cartItems) {
        const variant = item.variant;
        const quantity = Number(item.quantity);

        if (!variant) {
          const err = new Error(
            `Product variant (ID: ${item.product_variant_id}) no longer exists`,
          );
          err.statusCode = 400;
          throw err;
        }

        // Giá tại thời điểm mua: ưu tiên sale_price nếu có
        const unitPrice =
          Number(variant.sale_price) > 0
            ? Number(variant.sale_price)
            : Number(variant.price);

        if (Number(variant.stock) < quantity) {
          const err = new Error(
            `Insufficient stock for variant ID ${variant.id}. Available: ${variant.stock}, requested: ${quantity}`,
          );
          err.statusCode = 400;
          throw err;
        }

        const total = unitPrice * quantity;
        subtotal += total;

        orderItemsData.push({
          product_variant_id: variant.id,
          price: unitPrice,
          quantity: quantity,
          total: total,
        });
      }

      // ─── Tạo Order ───
      const order = await Order.create(
        {
          user_id: userId,
          receiver_name: receiver_name.trim(),
          receiver_phone: receiver_phone.trim(),
          receiver_email: (receiver_email || "").trim() || null,
          address: address.trim(),
          subtotal: subtotal,
          shipping_fee: 0, // FREE shipping
          discount_amount: 0, // Chưa có discount system
          total_amount: subtotal, // subtotal + shipping - discount
          payment_method: paymentMethod,
          payment_status: "pending",
          order_status: "pending",
          note: note.trim() || null,
        },
        { transaction: t },
      );

      // ─── Tạo Order Items ───
      const orderItems = orderItemsData.map((item) => ({
        ...item,
        order_id: order.id,
      }));

      await OrderItem.bulkCreate(orderItems, { transaction: t });

      // ─── Trừ stock từng variant ───
      for (const item of cartItems) {
        const variant = item.variant;
        const quantity = Number(item.quantity);

        await ProductVariant.update(
          {
            stock: sequelize.literal(`stock - ${quantity}`),
            sold_count: sequelize.literal(`sold_count + ${quantity}`),
          },
          {
            where: { id: variant.id },
            transaction: t,
          },
        );
      }

      // ─── Xóa toàn bộ cart_items của user ───
      await CartItem.destroy({
        where: { cart_id: cart.id },
        transaction: t,
      });

      // ─── Chỉ return order.id — fetch chi tiết sẽ thực hiện sau transaction ───
      return order.id;
    })
    .then(async (orderId) => {
      // ─── Fetch order NGOÀI transaction để nested include hoạt động ───
      const createdOrder = await Order.findByPk(orderId, {
        attributes: [
          "id",
          "order_code",
          "user_id",
          "receiver_name",
          "receiver_phone",
          "receiver_email",
          "address",
          "subtotal",
          "shipping_fee",
          "discount_amount",
          "total_amount",
          "payment_method",
          "payment_status",
          "order_status",
          "note",
          "created_at",
        ],
        include: [
          {
            model: OrderItem,
            as: "items",
            attributes: [
              "id",
              "product_variant_id",
              "price",
              "quantity",
              "total",
            ],
            include: [
              {
                model: ProductVariant,
                as: "variant",
                attributes: ["id", "product_id", "color", "ram", "storage"],
                include: [
                  {
                    model: Product,
                    as: "product",
                    attributes: ["id", "name", "slug"],
                  },
                ],
              },
            ],
          },
        ],
      });

      return createdOrder.get({ plain: true });
    });
}

/**
 * getOrdersByUser
 * - Lấy tất cả đơn hàng của user hiện tại
 * @param {number} userId
 * @returns {Promise<Array>} array of orders with items
 */
async function getOrdersByUser(userId) {
  const orders = await Order.findAll({
    where: { user_id: userId },
    attributes: [
      "id",
      "order_code",
      "receiver_name",
      "receiver_phone",
      "receiver_email",
      "address",
      "subtotal",
      "shipping_fee",
      "discount_amount",
      "total_amount",
      "payment_method",
      "payment_status",
      "order_status",
      "note",
      "created_at",
    ],
    include: [
      {
        model: OrderItem,
        as: "items",
        attributes: ["id", "product_variant_id", "price", "quantity", "total"],
        include: [
          {
            model: ProductVariant,
            as: "variant",
            attributes: ["id", "product_id", "color", "ram", "storage"],
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["id", "name", "slug"],
              },
            ],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return orders.map((o) => o.get({ plain: true }));
}

/**
 * cancelOrder
 * - Hủy đơn hàng nếu đang ở trạng thái "pending"
 * - Khôi phục stock cho từng variant
 * @param {number} orderId
 * @param {number} userId
 * @returns {Promise<Object>} updated order
 */
async function cancelOrder({ orderId, userId }) {
  return sequelize.transaction(async (t) => {
    const order = await Order.findOne({
      where: { id: orderId, user_id: userId },
      attributes: ["id", "order_status", "payment_status"],
      transaction: t,
    });

    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      throw err;
    }

    if (order.order_status !== "pending") {
      const err = new Error(
        `Cannot cancel order in "${order.order_status}" status. Only pending orders can be cancelled.`,
      );
      err.statusCode = 400;
      throw err;
    }

    // Lấy order items để khôi phục stock
    const orderItems = await OrderItem.findAll({
      where: { order_id: orderId },
      attributes: ["product_variant_id", "quantity"],
      transaction: t,
    });

    // Khôi phục stock cho từng variant
    for (const item of orderItems) {
      await ProductVariant.update(
        {
          stock: sequelize.literal(`stock + ${Number(item.quantity)}`),
          sold_count: sequelize.literal(
            `sold_count - ${Number(item.quantity)}`,
          ),
        },
        {
          where: { id: item.product_variant_id },
          transaction: t,
        },
      );
    }

    // Cập nhật trạng thái đơn hàng
    order.order_status = "cancelled";
    await order.save({ transaction: t, fields: ["order_status"] });

    return order.get({ plain: true });
  });
}

module.exports = {
  createOrder,
  getOrdersByUser,
  cancelOrder,
};

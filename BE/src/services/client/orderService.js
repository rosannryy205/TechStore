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
  VariantAttributeValue,
  VariantAttribute,
  OrderStatusHistory,
} = require("../../models");
const cartService = require("./cartService");
const {
  flattenAttributes,
  buildAttributeInclude,
} = require("../../utils/variantHelper");

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
            attributes: ["id", "product_id", "price", "sale_price", "stock", "status"],
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["id", "name", "status"],
                required: false,
              },
            ],
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

        if (variant.status === 0 || (variant.product && variant.product.status === 0)) {
          const err = new Error(
            `Sản phẩm "${variant.product?.name || variant.id}" đã ngừng kinh doanh. Vui lòng xóa khỏi giỏ hàng.`,
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
                attributes: ["id", "product_id"],
                include: [
                  ...buildAttributeInclude({
                    VariantAttributeValue,
                    VariantAttribute,
                  }),
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

      const plain = createdOrder.get({ plain: true });
      plain.order_code = plain.order_code || `TS-${plain.id}`;
      // Flatten variant attributes cho backward compatibility
      if (plain.items) {
        for (const item of plain.items) {
          if (item.variant) flattenAttributes(item.variant);
        }
      }
      return plain;
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
      "cancellation_reason",
      "cancelled_at",
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
            attributes: ["id", "product_id"],
            include: [
              ...buildAttributeInclude({
                VariantAttributeValue,
                VariantAttribute,
              }),
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

  const history = orders.length ? await OrderStatusHistory.findAll({ where: { order_id: orders.map((order) => order.id) }, attributes: ["order_id", "to_status", "created_at"], order: [["id", "DESC"]], raw: true }) : [];
  return orders.map((o) => {
    const plain = o.get({ plain: true });
    plain.order_code = plain.order_code || `TS-${plain.id}`;
    plain.status_changed_at = history.find((entry) => entry.order_id === plain.id && entry.to_status === plain.order_status)?.created_at || null;
    // Flatten variant attributes cho backward compatibility
    if (plain.items) {
      for (const item of plain.items) {
        if (item.variant) flattenAttributes(item.variant);
      }
    }
    return plain;
  });
}

/**
 * cancelOrder
 * - Hủy đơn hàng nếu đang ở trạng thái "pending"
 * - Khôi phục stock cho từng variant
 * @param {number} orderId
 * @param {number} userId
 * @returns {Promise<Object>} updated order
 */
async function cancelOrder({ orderId, userId, expectedStatus, requestId, reason }) {
  // Dùng chung quy tắc với quản trị, nhưng giới hạn khách chỉ hủy đơn của mình tại Pending.
  return require("../orderStatusService").cancelOrder({ orderId, actorId: userId, expectedStatus, requestId, reason });
}

module.exports = {
  createOrder,
  getOrdersByUser,
  cancelOrder,
};

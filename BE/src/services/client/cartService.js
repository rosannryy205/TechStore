const {
  sequelize,
  Cart,
  CartItem,
  ProductVariant,
  Product,
} = require("../../models");

/**
 * getOrCreateCartByUser
 * - Nếu user chưa có cart => tạo mới
 * - Tối ưu: chỉ dùng select theo user_id, không lấy dữ liệu thừa
 */
async function getOrCreateCartByUser(userId, t) {
  const [cart] = await Cart.findOrCreate({
    where: { user_id: userId },
    defaults: { user_id: userId },
    transaction: t,
  });

  return cart;
}

/**
 * addToCart
 * - Bắt buộc có auth (req.user.id)
 * - Nếu cart chưa tồn tại => tạo cart
 * - Nếu item đã tồn tại => tăng quantity
 * - Tối ưu query: chỉ select cột cần thiết
 */
async function addToCart({ userId, productId, variantId, quantity = 1 }) {
  // quantity đã được validate bởi express-validator ở router
  const qty = Number(quantity);

  return sequelize.transaction(async (t) => {
    // validate variant tồn tại + trạng thái (nếu cần)
    const variant = await ProductVariant.findOne({
      where: { id: variantId, product_id: productId },
      attributes: ["id", "price", "sale_price", "stock"],
      transaction: t,
    });

    if (!variant) {
      const err = new Error("Variant not found");
      err.statusCode = 404;
      throw err;
    }

    // tạo/get cart
    const cart = await getOrCreateCartByUser(userId, t);

    // cộng dồn nếu item đã có
    const [item, created] = await CartItem.findOrCreate({
      where: { cart_id: cart.id, product_variant_id: variantId },
      defaults: {
        cart_id: cart.id,
        // CartItem model hiện không có product_id field trong schema,
        // nên không set product_id tại đây.
        product_variant_id: variantId,
        quantity: qty,
      },
      transaction: t,
    });

    // findOrCreate trả item hiện tại nếu đã tồn tại
    // Khi đó cần cộng thêm quantity
    if (!created) {
      item.quantity = item.quantity + qty;
      await item.save({ transaction: t, fields: ["quantity"] });
    }

    // Lấy lại cart để FE render (thông tin tối thiểu cần thiết)
    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.id },
      attributes: ["product_variant_id", "quantity"],
      include: [
        // NOTE: CartItem chỉ có product_variant_id trong schema.
        // Vì vậy KHÔNG include Product trực tiếp với alias "product" (chưa có association CartItem->Product).
        // Lấy thông tin sản phẩm thông qua ProductVariant.
        {
          model: ProductVariant,
          as: "variant",
          attributes: [
            "id",
            "product_id",
            "price",
            "sale_price",
            "stock",
            "color",
            "ram",
            "storage",
          ],

          // Nếu cần thông tin Product cho FE, có thể lấy nested qua association sẵn có:
          // ProductVariant.belongsTo(Product, as: "product_variants")
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name", "id"],
              required: false,
            },
          ],
        },
      ],

      order: [["created_at", "DESC"]],
      transaction: t,
    });

    // Đồng bộ contract cho FE: FE đang map `it.variant_id`
    const mappedItems = cartItems.map((it) => {
      const plain = it.get({ plain: true });
      return {
        ...plain,
        // Contract cho FE: FE cần `variant.product_id` khi map.
        // Đồng thời giữ `variant_id` ở cấp item.
        variant_id: it.product_variant_id,
      };
    });

    return {
      cart: {
        id: cart.id,
        user_id: cart.user_id,
        items: mappedItems,
      },
    };
  });
}

/**
 * getCart
 * - Lấy cart của user hiện tại
 * - Chỉ lấy dữ liệu cần hiển thị ở FE
 */
async function getCartByUser(userId) {
  const cart = await Cart.findOne({
    where: { user_id: userId },
    attributes: ["id", "user_id"],
  });

  if (!cart) {
    return { cart: null, items: [] };
  }

  const cartItems = await CartItem.findAll({
    where: { cart_id: cart.id },
    attributes: ["product_variant_id", "quantity"],
    include: [
      // NOTE: CartItem chỉ có product_variant_id trong schema.
      // Vì vậy KHÔNG include Product trực tiếp với alias "product" (chưa có association CartItem->Product).
      // Lấy thông tin sản phẩm thông qua ProductVariant.
      {
        model: ProductVariant,
        as: "variant",
        attributes: [
          "id",
          "product_id",
          "price",
          "sale_price",
          "stock",
          "color",
          "ram",
          "storage",
        ],

        include: [
          {
            model: Product,
            as: "product",
            attributes: ["name", "id"],
            required: false,
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Đồng bộ contract cho FE: FE đang map `it.variant_id`
  const mappedItems = cartItems.map((it) => {
    const plain = it.get({ plain: true });
    return {
      ...plain,
      variant_id: it.product_variant_id,
    };
  });

  return {
    cart: {
      id: cart.id,
      user_id: cart.user_id,
    },
    items: mappedItems,
  };
}

/**
 * updateCartItemQuantity
 * - SET quantity chính xác (không cộng dồn)
 * - Dùng cho nút tăng/giảm ở FE
 */
async function updateCartItemQuantity({ userId, variantId, quantity }) {
  // quantity đã được validate bởi express-validator ở router
  const qty = Number(quantity);

  return sequelize.transaction(async (t) => {
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

    const item = await CartItem.findOne({
      where: { cart_id: cart.id, product_variant_id: variantId },
      transaction: t,
    });

    if (!item) {
      const err = new Error("Cart item not found");
      err.statusCode = 404;
      throw err;
    }

    item.quantity = qty;
    await item.save({ transaction: t, fields: ["quantity"] });

    return { success: true, variantId, quantity: qty };
  });
}

/**
 * removeCartItem
 * - Xóa 1 item khỏi cart
 */
async function removeCartItem({ userId, variantId }) {
  return sequelize.transaction(async (t) => {
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

    const deleted = await CartItem.destroy({
      where: { cart_id: cart.id, product_variant_id: variantId },
      transaction: t,
    });

    if (deleted === 0) {
      const err = new Error("Cart item not found");
      err.statusCode = 404;
      throw err;
    }

    return { success: true, variantId };
  });
}

module.exports = {
  addToCart,
  getCartByUser,
  updateCartItemQuantity,
  removeCartItem,
};

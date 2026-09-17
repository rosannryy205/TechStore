const cartService = require("../../services/client/cartService");

// POST /api/cart/items
// Body: { productId, variantId, quantity }
const addCartItemController = async (req, res, next) => {
  try {
    const { productId, variantId, quantity } = req.body || {};

    if (!productId || !variantId) {
      const err = new Error("Missing productId or variantId");
      err.statusCode = 400;
      throw err;
    }

    const result = await cartService.addToCart({
      userId: req.user.id,
      productId,
      variantId,
      quantity,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

// GET /api/cart
const getCartController = async (req, res, next) => {
  try {
    const result = await cartService.getCartByUser(req.user.id);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

// PUT /api/cart/items
// Body: { variantId, quantity }
const updateCartItemController = async (req, res, next) => {
  try {
    const { variantId, quantity } = req.body || {};

    if (!variantId || quantity == null) {
      const err = new Error("Missing variantId or quantity");
      err.statusCode = 400;
      throw err;
    }

    const result = await cartService.updateCartItemQuantity({
      userId: req.user.id,
      variantId,
      quantity,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/cart/items
// Body: { variantId }
const removeCartItemController = async (req, res, next) => {
  try {
    const { variantId } = req.body || {};

    if (!variantId) {
      const err = new Error("Missing variantId");
      err.statusCode = 400;
      throw err;
    }

    const result = await cartService.removeCartItem({
      userId: req.user.id,
      variantId,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  addCartItemController,
  getCartController,
  updateCartItemController,
  removeCartItemController,
};



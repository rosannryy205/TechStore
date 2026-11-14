const { check, body, validationResult } = require("express-validator");

/**
 * Middleware kiểm tra kết quả validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg,
    });
  }
  return next();
};

/**
 * Validation rules cho POST /api/cart/items (add to cart)
 */
const addToCartRules = () => [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer"),

  body("variantId")
    .notEmpty()
    .withMessage("Variant ID is required")
    .isInt({ min: 1 })
    .withMessage("Variant ID must be a positive integer"),

  body("quantity")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be between 1 and 100"),
];

/**
 * Validation rules cho PUT /api/cart/items (hoặc /api/cart/items/:variantId)
 */
const updateCartRules = () => [
  check("variantId")
    .notEmpty()
    .withMessage("Variant ID is required")
    .isInt({ min: 1 })
    .withMessage("Variant ID must be a positive integer"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be between 1 and 100"),
];

/**
 * Validation rules cho DELETE /api/cart/items (hoặc /api/cart/items/:variantId)
 */
const removeCartRules = () => [
  check("variantId")
    .notEmpty()
    .withMessage("Variant ID is required")
    .isInt({ min: 1 })
    .withMessage("Variant ID must be a positive integer"),
];

module.exports = {
  handleValidationErrors,
  addToCartRules,
  updateCartRules,
  removeCartRules,
};

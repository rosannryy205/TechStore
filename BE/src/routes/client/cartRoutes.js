const express = require("express");
const router = express.Router();

const requireAuth = require("../../middleware/requireAuth");
const {
  addCartItemController,
  getCartController,
  updateCartItemController,
  removeCartItemController,
} = require("../../controllers/client/cartController");
const {
  addToCartRules,
  updateCartRules,
  removeCartRules,
  handleValidationErrors,
} = require("../../validators/cartValidators");

// Auth routes for Cart
router.post(
  "/items",
  requireAuth,
  addToCartRules(),
  handleValidationErrors,
  addCartItemController,
);
router.put(
  "/items",
  requireAuth,
  updateCartRules(),
  handleValidationErrors,
  updateCartItemController,
);
router.delete(
  "/items",
  requireAuth,
  removeCartRules(),
  handleValidationErrors,
  removeCartItemController,
);
router.get("/", requireAuth, getCartController);

module.exports = router;

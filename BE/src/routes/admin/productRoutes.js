const express = require("express");
const router = express.Router();
const productController = require("../../controllers/admin/productController");
const productValidator = require("../../validators/productValidators");
const uploadProduct = require("../../middleware/uploadProduct");
const requireAuth = require("../../middleware/requireAuth");
const requireCatalogOperator = require("../../middleware/requireCatalogOperator");

router.use(requireAuth, requireCatalogOperator);

router.post(
  "/",
  uploadProduct.array("images", 10),
  productValidator.createProductRules(),
  productValidator.handleValidationErrors,
  productController.createProduct
);

router.get("/", productController.getAllProductsAdmin);

module.exports = router;

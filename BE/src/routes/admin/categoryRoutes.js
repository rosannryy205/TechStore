const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/admin/categoryController");
const categoryValidator = require("../../validators/categoryValidators");
const requireAuth = require("../../middleware/requireAuth");
const requireCatalogOperator = require("../../middleware/requireCatalogOperator");

router.use(requireAuth, requireCatalogOperator);

router.post(
  "/",
  categoryValidator.createCategoryRules(),
  categoryValidator.handleValidationErrors,
  categoryController.createCategory
);

module.exports = router;

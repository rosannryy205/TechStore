const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/admin/categoryController");
const categoryValidator = require("../../validators/categoryValidators");

router.post(
  "/",
  categoryValidator.createCategoryRules(),
  categoryValidator.handleValidationErrors,
  categoryController.createCategory
);

module.exports = router;

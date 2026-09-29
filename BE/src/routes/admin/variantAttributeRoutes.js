const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/variantAttributeController");
const {
  createAttributeRules,
  addOptionRules,
  handleValidationErrors,
} = require("../../validators/variantAttributeValidators");

// Attributes CRUD
router.get("/", controller.getAllAttributes);
router.post(
  "/",
  createAttributeRules(),
  handleValidationErrors,
  controller.createAttribute,
);
router.put("/:id", controller.updateAttribute);
router.delete("/:id", controller.deleteAttribute);

// Options CRUD (nested under attribute)
router.post(
  "/:id/options",
  addOptionRules(),
  handleValidationErrors,
  controller.addOption,
);
router.put("/:id/options/:optionId", controller.updateOption);
router.delete("/:id/options/:optionId", controller.deleteOption);

module.exports = router;

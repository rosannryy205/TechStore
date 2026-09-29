const express = require("express");
const router = express.Router();

const uploadBrand = require("../../middleware/uploadBrand");
const { createBrandRules, handleValidationErrors } = require("../../validators/brandValidators");
const { 
  getAllBrandsController,
  createBrandController 
} = require("../../controllers/admin/brandController");

// Lấy danh sách thương hiệu
router.get("/", getAllBrandsController);

// Thêm thương hiệu
router.post(
  "/",
  uploadBrand.single("logo"),
  createBrandRules(),
  handleValidationErrors,
  createBrandController
);
router.get(
  "/",
  getAllBrandsController
);

module.exports = router;

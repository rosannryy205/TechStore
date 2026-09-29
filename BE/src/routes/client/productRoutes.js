const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getAllProductFeatures,
  getAllProductPopular,
  getAllProductNewArrival,
  getProductById,
  getProductRelated
} = require("../../controllers/client/productController");

// Định nghĩa route để lấy tất cả sản phẩm
router.get("/", getAllProducts);
// Định nghĩa route để lấy các tính năng nổi bật của sản phẩm
router.get("/features", getAllProductFeatures);
// Định nghĩa route để lấy các sản phẩm phổ biến
router.get("/popular", getAllProductPopular);
// Định nghĩa route để lấy các sản phẩm phổ biến
router.get("/newarrival", getAllProductNewArrival);
// Định nghĩa route để lấy sản phẩm theo ID
router.get("/:id", getProductById);
// Định nghĩa route để lấy các sản phẩm liên quan theo brand_id của sản phẩm hiện tại (trừ chính sản phẩm đó)
router.get("/:id/related", getProductRelated);

// Xuất router để sử dụng trong app.js
module.exports = router;

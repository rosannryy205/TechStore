const productService = require("../../services/admin/productServive");

const createProduct = async (req, res, next) => {
  try {
    const data = req.body;
    const files = req.files;
    const newProduct = await productService.createProduct(data, files);
    return res.status(201).json({
      message: "Thêm sản phẩm thành công",
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

const getAllProductsAdmin = async (req, res, next) => {
  try {
    const products = await productService.getAllProductsAdmin();
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProductsAdmin
};

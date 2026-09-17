const {
  getAllProducts,
  getAllProductFeatures,
  getAllProductPopular,
  getAllProductNewArrival,
  getProductById,
  getProductRelated,
} = require("../../services/client/productService");

const getAllProductsController = async (req, res, next) => {
  try {
    const { category, brand } = req.query;
    // Yêu cầu: trả về đúng sản phẩm thỏa BOTH điều kiện (AND).
    // Nếu sai 1 trong 2 (thiếu/không hợp lệ) => loại toàn bộ => []
    if (!category) {
      return res.status(200).json({ success: true, data: [] });
    }

    const products = await getAllProducts(category, brand);
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getAllProductFeaturesController = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await getAllProductFeatures({ page, limit });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getAllProductPopularController = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await getAllProductPopular({ page, limit });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getAllProductNewArrivalController = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await getAllProductNewArrival({ page, limit });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getProductByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const getProductRelatedController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit, 10) || 4;
    const related = await getProductRelated(id, limit);
    return res.status(200).json({ success: true, data: related });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts: getAllProductsController,
  getAllProductFeatures: getAllProductFeaturesController,
  getAllProductPopular: getAllProductPopularController,
  getProductById: getProductByIdController,
  getAllProductNewArrival: getAllProductNewArrivalController,
  getProductRelated: getProductRelatedController,
};

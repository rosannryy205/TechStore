const brandService = require("../../services/admin/brandService");

/**
 * GET /api/admin/brands
 * Lấy danh sách thương hiệu
 */
const getAllBrandsController = async (req, res, next) => {
  try {
    const brands = await brandService.getAllBrandsService();
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách thương hiệu thành công",
      data: brands,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/admin/brands
 * Xử lý request thêm thương hiệu
 */
const createBrandController = async (req, res, next) => {
  try {
    const { name, slug, status } = req.body;
    const logo = req.file ? `uploads/brands/${req.file.filename}` : null;

    const newBrand = await brandService.createBrandService({
      name,
      slug,
      logo,
      status: status !== undefined ? parseInt(status, 10) : 1,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm thương hiệu thành công",
      data: newBrand,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllBrandsController,
  createBrandController,
};

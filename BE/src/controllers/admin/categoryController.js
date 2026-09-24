const categoryService = require("../../services/admin/categoryService");

const createCategory = async (req, res, next) => {
  try {
    const { name, slug, status, brandIds } = req.body;
    const newCategory = await categoryService.createCategory({
      name,
      slug,
      status,
      brandIds,
    });
    res.status(201).json({
      success: true,
      message: "Thêm danh mục thành công",
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
};
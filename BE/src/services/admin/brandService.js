const { Brand } = require("../../models");

/**
 * getAllBrandsService
 * Lấy danh sách tất cả thương hiệu
 */
const getAllBrandsService = async () => {
  const brands = await Brand.findAll({
    order: [["id", "DESC"]],
  });
  return brands;
};

/**
 * createBrandService
 * Xử lý logic thêm thương hiệu
 */
const createBrandService = async ({ name, slug, logo, status }) => {
  const existingBrand = await Brand.findOne({ where: { slug } });
  
  if (existingBrand) {
    const err = new Error("Đường dẫn (slug) này đã tồn tại trong hệ thống.");
    err.statusCode = 400;
    throw err;
  }

  const newBrand = await Brand.create({
    name,
    slug,
    logo,
    status,
  });

  return newBrand;
};



module.exports = {
  getAllBrandsService,
  createBrandService,
};

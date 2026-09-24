const { Category, CategoryBrand, sequelize } = require("../../models");

const createCategory = async (data) => {
  const { name, slug, status, brandIds } = data;

  const transaction = await sequelize.transaction();
  try {
    const newCategory = await Category.create(
      {
        name,
        slug,
        status: status !== undefined ? status : 1,
      },
      { transaction }
    );

    if (brandIds && Array.isArray(brandIds) && brandIds.length > 0) {
      const categoryBrandsData = brandIds.map((brandId) => ({
        category_id: newCategory.id,
        brand_id: brandId,
      }));
      await CategoryBrand.bulkCreate(categoryBrandsData, { transaction });
    }

    await transaction.commit();
    return newCategory;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  createCategory,
};
const { Category, CategoryBrand, Brand } = require("../../models/index.js");

const getAllCategories = async () => {
  const category = await Category.findAll({
    attributes: { exclude: ["created_at", "updated_at"] },
    include: [
      {
        model: CategoryBrand,
        as: "category_brands",
        attributes: { exclude: ["created_at", "updated_at"] },
        include: [
          {
            model: Brand,
            as: "brand",
            attributes: { exclude: ["created_at", "updated_at"] },
          },
        ],
      },
    ],
  });
  return category;
};

module.exports = {
  getAllCategories,
};

const { Op } = require("sequelize");
const {
  Product,
  ProductVariant,
  Brand,
  ProductImage,
  VariantAttributeValue,
  VariantAttribute,
} = require("../../models/index.js");
const {
  buildAttributeInclude,
  transformProduct,
  transformProducts,
} = require("../../utils/variantHelper");

// Reusable include for ProductVariant with attribute values
const VARIANT_INCLUDE = {
  model: ProductVariant,
  as: "variants",
  include: buildAttributeInclude({ VariantAttributeValue, VariantAttribute }),
};

const { getProductPage: getAllProducts } = require("./productSearchService");

/**
 * getAllProductFeatures — Hỗ trợ pagination
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 */
const getAllProductFeatures = async ({ page = 1, limit = 10 } = {}) => {
  const offset = (Math.max(1, page) - 1) * limit;
  const { count, rows } = await Product.findAndCountAll({
    include: [
      {
        model: Brand,
        as: "brand",
      },
      VARIANT_INCLUDE,
      {
        model: ProductImage,
        as: "images",
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });
  return { data: transformProducts(rows), total: count, page, limit };
};

/**
 * getAllProductPopular — Hỗ trợ pagination
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 */
const getAllProductPopular = async ({ page = 1, limit = 10 } = {}) => {
  const offset = (Math.max(1, page) - 1) * limit;
  const { count, rows } = await Product.findAndCountAll({
    include: [
      {
        model: Brand,
        as: "brand",
      },
      VARIANT_INCLUDE,
      {
        model: ProductImage,
        as: "images",
      },
    ],
    order: [["sold_count", "DESC"]],
    limit,
    offset,
    distinct: true,
  });
  return { data: transformProducts(rows), total: count, page, limit };
};

/**
 * getAllProductNewArrival — Hỗ trợ pagination
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 */
const getAllProductNewArrival = async ({ page = 1, limit = 10 } = {}) => {
  const offset = (Math.max(1, page) - 1) * limit;
  const { count, rows } = await Product.findAndCountAll({
    include: [
      {
        model: Brand,
        as: "brand",
      },
      VARIANT_INCLUDE,
      {
        model: ProductImage,
        as: "images",
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });
  return { data: transformProducts(rows), total: count, page, limit };
};

const getProductById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      {
        model: Brand,
        as: "brand",
      },
      VARIANT_INCLUDE,
      {
        model: ProductImage,
        as: "images",
      },
    ],
  });
  return product ? transformProduct(product) : null;
};

async function getProductRelated(productId, limit = 4) {
  try {
    // Giới hạn an toàn: 1 <= limit <= 20
    const safeLimit = Math.min(Math.max(1, Number(limit) || 4), 20);

    const product = await Product.findByPk(productId);
    if (!product) return [];

    const commonInclude = [
      {
        model: Brand,
        as: "brand",
      },
      VARIANT_INCLUDE,
      {
        model: ProductImage,
        as: "images",
      },
    ];

    // 1. Ưu tiên cùng brand, còn bán, sắp theo lượt bán nhiều nhất
    let related = await Product.findAll({
      where: {
        brand_id: product.brand_id,
        id: { [Op.ne]: productId },
        status: 1,
      },
      include: commonInclude,
      order: [["sold_count", "DESC"]],
      limit: safeLimit,
    });

    // 2. Nếu cùng brand chưa đủ, bù thêm sản phẩm cùng category (tránh trùng id)
    if (related.length < safeLimit) {
      const excludedIds = related.map((r) => r.id);
      const extra = await Product.findAll({
        where: {
          category_id: product.category_id,
          brand_id: { [Op.ne]: product.brand_id },
          id: { [Op.notIn]: [productId, ...excludedIds] },
          status: 1,
        },
        include: commonInclude,
        order: [["sold_count", "DESC"]],
        limit: safeLimit - related.length,
      });
      related = [...related, ...extra];
    }

    return transformProducts(related);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllProducts,
  getAllProductFeatures,
  getAllProductPopular,
  getAllProductNewArrival,
  getProductById,
  getProductRelated,
};

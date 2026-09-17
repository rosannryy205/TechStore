const { Op } = require("sequelize");
const {
  Product,
  ProductVariant,
  Brand,
  ProductImage,
  Category,
} = require("../../models/index.js");

const getAllProducts = async (category_slug, brand_slug) => {
  // Yêu cầu: cả 2 điều kiện phải hợp lệ (AND). Sai 1 trong 2 => loại toàn bộ => []
  if (!category_slug) {
    return [];
  }

  try {
    // Tìm Category theo slug
    const category = await Category.findOne({
      where: { slug: category_slug },
    });

    if (!category) return []; // Kiểm tra object, không phải slug

    const whereCondition = {
      category_id: category.id,
    };

    if (brand_slug) {
      const brand = await Brand.findOne({
        where: { slug: brand_slug }, // Tìm Brand theo slug
      });

      if (brand) {
        whereCondition.brand_id = brand.id;
      }
    }

    // Dùng category.id và brand.id
    const products = await Product.findAll({
      where: whereCondition,
      include: [
        {
          model: Brand,
          as: "brand",
        },
        {
          model: ProductVariant,
          as: "variants",
        },
        {
          model: ProductImage,
          as: "images",
        },
      ],
    });

    return products;
  } catch (error) {
    throw error;
  }
};

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
      {
        model: ProductVariant,
        as: "variants",
      },
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
  return { data: rows, total: count, page, limit };
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
      {
        model: ProductVariant,
        as: "variants",
      },
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
  return { data: rows, total: count, page, limit };
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
      {
        model: ProductVariant,
        as: "variants",
      },
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
  return { data: rows, total: count, page, limit };
};

const getProductById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      {
        model: Brand,
        as: "brand",
      },
      {
        model: ProductVariant,
        as: "variants",
      },
      {
        model: ProductImage,
        as: "images",
      },
    ],
  });
  return product;
};

async function getProductRelated(productId, limit = 4) {
  try {
    // Giới hạn an toàn: 1 <= limit <= 20
    const safeLimit = Math.min(Math.max(1, Number(limit) || 4), 20);

    const product = await Product.findByPk(productId);
    if (!product) return [];

    // 1. Ưu tiên cùng brand, còn bán, sắp theo lượt bán nhiều nhất
    let related = await Product.findAll({
      where: {
        brand_id: product.brand_id,
        id: { [Op.ne]: productId },
        status: 1,
      },
      include: [
        {
          model: Brand,
          as: "brand",
        },
        {
          model: ProductVariant,
          as: "variants",
        },
        {
          model: ProductImage,
          as: "images",
        },
      ],
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
        include: [
          {
            model: Brand,
            as: "brand",
          },
          {
            model: ProductVariant,
            as: "variants",
          },
          {
            model: ProductImage,
            as: "images",
          },
        ],
        order: [["sold_count", "DESC"]],
        limit: safeLimit - related.length,
      });
      related = [...related, ...extra];
    }

    return related;
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

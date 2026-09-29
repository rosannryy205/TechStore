const {
  sequelize,
  Product,
  ProductVariant,
  ProductImage,
  VariantAttributeValue,
  VariantAttribute,
} = require("../../models");
const {
  buildAttributeInclude,
  transformProducts,
} = require("../../utils/variantHelper");

const createProduct = async (data, files) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, category_id, brand_id, description, status } = data;
    let variants = [];

    if (data.variants) {
      if (typeof data.variants === "string") {
        variants = JSON.parse(data.variants);
      } else {
        variants = data.variants;
      }
    }

    if (!variants || variants.length === 0) {
      throw new Error("Sản phẩm phải có ít nhất một biến thể.");
    }

    // 1. Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // 2. Create product
    const product = await Product.create(
      {
        name,
        slug,
        category_id,
        brand_id,
        description,
        status: status || 1,
        sold_count: 0,
      },
      { transaction },
    );

    // 3. Create variants with dynamic attribute values
    const createdVariants = [];
    for (const variant of variants) {
      const newVariant = await ProductVariant.create(
        {
          product_id: product.id,
          sku: variant.sku,
          price: variant.price,
          sale_price: variant.sale_price,
          stock: variant.stock || 0,
          status: variant.status || 1,
          sold_count: 0,
        },
        { transaction },
      );

      // Create attribute values cho variant này
      if (variant.attributes && Array.isArray(variant.attributes)) {
        const attrValues = variant.attributes.map((attr) => ({
          variant_id: newVariant.id,
          attribute_id: attr.attribute_id,
          value: attr.value,
        }));
        await VariantAttributeValue.bulkCreate(attrValues, { transaction });
      }

      createdVariants.push(newVariant);
    }

    // 4. Handle images
    if (files && files.length > 0) {
      // Gán mặc định các ảnh cho variant đầu tiên
      const defaultVariantId = createdVariants[0].id;
      let sortOrder = 1;

      const imageRecords = files.map((file) => ({
        product_id: product.id,
        variant_id: defaultVariantId,
        img_url: `/uploads/products/${file.filename}`,
        sort_order: sortOrder++,
      }));

      await ProductImage.bulkCreate(imageRecords, { transaction });
    }

    await transaction.commit();
    return product;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getAllProductsAdmin = async () => {
  const products = await Product.findAll({
    include: [
      {
        model: ProductVariant,
        as: "variants",
        include: buildAttributeInclude({
          VariantAttributeValue,
          VariantAttribute,
        }),
      },
      {
        model: ProductImage,
        as: "images",
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return transformProducts(products);
};

module.exports = {
  createProduct,
  getAllProductsAdmin,
};

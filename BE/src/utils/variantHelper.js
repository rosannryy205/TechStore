/**
 * Flatten attributeValues onto a plain variant object.
 * Adds top-level keys (e.g. `color`, `ram`, `storage`) derived from dynamic attributes.
 * Ensures backward compatibility with code that accesses variant.color, etc.
 *
 * @param {Object} variant - Plain variant object (after .toJSON())
 * @returns {Object} variant with flattened attribute keys
 */
const flattenAttributes = (variant) => {
  if (!variant?.attributeValues) return variant;
  for (const av of variant.attributeValues) {
    if (av.attribute?.name) {
      variant[av.attribute.name] = av.value;
    }
  }
  return variant;
};

/**
 * Build Sequelize include config for variant attribute values.
 * Reusable across all services that query ProductVariant.
 *
 * @param {Object} models - { VariantAttributeValue, VariantAttribute }
 * @returns {Array} Sequelize include array to nest inside ProductVariant include
 */
const buildAttributeInclude = ({ VariantAttributeValue, VariantAttribute }) => [
  {
    model: VariantAttributeValue,
    as: "attributeValues",
    include: [
      {
        model: VariantAttribute,
        as: "attribute",
        attributes: ["id", "name", "display_name"],
      },
    ],
  },
];

/**
 * Transform a single product: flatten attribute values on all its variants.
 * @param {Object|Model} product - Sequelize instance or plain object
 * @returns {Object} plain product with flattened variant attributes
 */
const transformProduct = (product) => {
  const plain = product.toJSON ? product.toJSON() : { ...product };
  plain.variants = (plain.variants || []).map(flattenAttributes);
  return plain;
};

/**
 * Transform an array of products.
 * @param {Array} products
 * @returns {Array}
 */
const transformProducts = (products) => products.map(transformProduct);

module.exports = {
  flattenAttributes,
  buildAttributeInclude,
  transformProduct,
  transformProducts,
};

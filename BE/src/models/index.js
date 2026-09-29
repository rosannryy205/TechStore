const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Brand = require("./brandModel");
const Product = require("./productModel");
const ProductVariant = require("./productVariantModel");
const ProductImage = require("./productImageModel");
const Category = require("./categoryModel");
const CategoryBrand = require("./categoryBrandModel");
const Cart = require("./cartModel");
const CartItem = require("./cartItemModel");
const Order = require("./orderModel");
const OrderItem = require("./orderItemsModel");
const User = require("./userModel");
const Review = require("./reviewModel");
const ReviewMedia = require("./reviewMediaModel");
const ReviewReplies = require("./reviewReplyModel");
const VariantAttribute = require("./variantAttributeModel");
const VariantAttributeOption = require("./variantAttributeOptionModel");
const VariantAttributeValue = require("./variantAttributeValueModel");

// 1 Thương hiệu có nhiều sản phẩm
Brand.hasMany(Product, { foreignKey: "brand_id", as: "products" });
Product.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });

// 1 Sản phẩm có nhiều biến thể
Product.hasMany(ProductVariant, { foreignKey: "product_id", as: "variants" });
ProductVariant.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// 1 Sản phẩm có nhiều hình ảnh
Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });
ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product_images",
});

// 1 Danh mục có nhiều thương hiệu
Category.hasMany(CategoryBrand, {
  foreignKey: "category_id",
  as: "category_brands",
});
CategoryBrand.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

// 1 Thương hiệu có nhiều danh mục
Brand.hasMany(CategoryBrand, { foreignKey: "brand_id", as: "category_brands" });
CategoryBrand.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });

// 1 Cart có nhiều CartItem
Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id", as: "cart" });

// 1 ProductVariant có nhiều CartItem
ProductVariant.hasMany(CartItem, {
  foreignKey: "product_variant_id",
  as: "cart_items",
});
CartItem.belongsTo(ProductVariant, {
  foreignKey: "product_variant_id",
  as: "variant",
});

// 1 User có nhiều Order
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

// 1 Order có nhiều OrderItem
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// 1 ProductVariant có nhiều OrderItem
ProductVariant.hasMany(OrderItem, {
  foreignKey: "product_variant_id",
  as: "order_items",
});
OrderItem.belongsTo(ProductVariant, {
  foreignKey: "product_variant_id",
  as: "variant",
});

// 1 Product có nhiều Review
Product.hasMany(Review, { foreignKey: "product_id", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// 1 ProductVariant có nhiều Review
ProductVariant.hasMany(Review, {
  foreignKey: "product_variant_id",
  as: "variant_reviews",
});
Review.belongsTo(ProductVariant, {
  foreignKey: "product_variant_id",
  as: "variant",
});

// 1 User có nhiều Review
User.hasMany(Review, { foreignKey: "user_id", as: "user_reviews" });
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });

// 1 Review có nhiều ReviewMedia
Review.hasMany(ReviewMedia, { foreignKey: "review_id", as: "media" });
ReviewMedia.belongsTo(Review, { foreignKey: "review_id", as: "review" });

// 1 Review có nhiều ReviewReplies
Review.hasMany(ReviewReplies, { foreignKey: "review_id", as: "replies" });
ReviewReplies.belongsTo(Review, { foreignKey: "review_id", as: "review" });

// 1 User có nhiều ReviewReplies (người trả lời)
User.hasMany(ReviewReplies, { foreignKey: "replier_id", as: "review_replies" });
ReviewReplies.belongsTo(User, { foreignKey: "replier_id", as: "replier" });

// ─── Variant Attribute associations ───
// 1 VariantAttribute có nhiều VariantAttributeOption
VariantAttribute.hasMany(VariantAttributeOption, {
  foreignKey: "attribute_id",
  as: "options",
});
VariantAttributeOption.belongsTo(VariantAttribute, {
  foreignKey: "attribute_id",
  as: "attribute",
});

// 1 ProductVariant có nhiều VariantAttributeValue
ProductVariant.hasMany(VariantAttributeValue, {
  foreignKey: "variant_id",
  as: "attributeValues",
});
VariantAttributeValue.belongsTo(ProductVariant, {
  foreignKey: "variant_id",
  as: "variant",
});

// 1 VariantAttribute có nhiều VariantAttributeValue
VariantAttribute.hasMany(VariantAttributeValue, {
  foreignKey: "attribute_id",
  as: "values",
});
VariantAttributeValue.belongsTo(VariantAttribute, {
  foreignKey: "attribute_id",
  as: "attribute",
});

module.exports = {
  sequelize,
  Brand,
  Product,
  ProductVariant,
  ProductImage,
  Category,
  CategoryBrand,
  Cart,
  CartItem,
  Order,
  OrderItem,
  User,
  Review,
  ReviewMedia,
  ReviewReplies,
  VariantAttribute,
  VariantAttributeOption,
  VariantAttributeValue,
};

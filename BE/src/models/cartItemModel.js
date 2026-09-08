const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

/**
 * CartItem model
 * - Mỗi item thuộc 1 cart.
 * - Xác định sản phẩm/biến thể bằng product_id + variant_id.
 */
const CartItem = sequelize.define(
  "cart_items",
  {
    cart_id: {
      type: DataTypes.BIGINT(20),
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_variant_id: {
      type: DataTypes.BIGINT(20),
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    tableName: "cart_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["cart_id", "product_variant_id"],
      },
    ],
  },
);

module.exports = CartItem;

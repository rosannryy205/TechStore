const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ProductVariantModel = sequelize.define(
  "product_variants",
  {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ram: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    storage: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    sale_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.TINYINT   ,
      allowNull: false,
      defaultValue: 1,
    },
    sold_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "product_variants",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = ProductVariantModel;

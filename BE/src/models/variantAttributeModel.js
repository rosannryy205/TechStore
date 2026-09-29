const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const VariantAttribute = sequelize.define(
  "variant_attributes",
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("select", "text"),
      allowNull: false,
      defaultValue: "select",
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "variant_attributes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = VariantAttribute;

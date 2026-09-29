const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const VariantAttributeValue = sequelize.define(
  "variant_attribute_values",
  {
    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attribute_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "variant_attribute_values",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = VariantAttributeValue;

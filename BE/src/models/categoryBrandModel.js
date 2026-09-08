const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CategoryBrandModel = sequelize.define("category_brands", {
  category_id: {
    type: DataTypes.BIGINT(20),
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  brand_id: {
    type: DataTypes.BIGINT(20),
    type: DataTypes.INTEGER,
    allowNull: false,
  },
},{
    tableName: "category_brands",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

module.exports = CategoryBrandModel;

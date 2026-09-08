const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

/**
 * Cart model
 * - Mỗi user có 1 cart.
 */
const Cart = sequelize.define(
  "carts",
  {
    user_id: {
      type: DataTypes.BIGINT(20),
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "carts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Cart;

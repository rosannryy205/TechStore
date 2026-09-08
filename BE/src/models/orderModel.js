const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const OrderModel = sequelize.define(
  "orders",
  {
    user_id: {
      type: DataTypes.BIGINT,
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discount_id: {
      type: DataTypes.BIGINT,
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    order_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    receiver_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    receiver_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    receiver_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    shipping_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.ENUM("cod", "vnpay", "momo"),
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      allowNull: true,
      defaultValue: "pending",
    },
    order_status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "processing",
        "shipping",
        "completed",
        "cancelled",
      ),
      allowNull: true,
      defaultValue: "pending",
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = OrderModel;

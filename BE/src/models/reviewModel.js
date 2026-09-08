const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ReviewModel = sequelize.define(
  "reviews",
  {
    product_id: {
      type: DataTypes.BIGINT,
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_variant_id: {
      type: DataTypes.BIGINT,
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.BIGINT,
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rating: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_verified_purchase: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    like_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_product_created",
        fields: ["product_id", { attribute: "created_at", order: "DESC" }],
      },
      {
        name: "idx_product_rating",
        fields: ["product_id", "rating"],
      },
      {
        name: "idx_user",
        fields: ["user_id"],
      },
      {
        name: "idx_status",
        fields: ["status"],
      },
    ],
  },
);

module.exports = ReviewModel;

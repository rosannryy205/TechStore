const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ReviewRepliesModel = sequelize.define(
  "review_replies",
  {
    review_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    replier_id: {
      type: DataTypes.BIGINT,
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "review_replies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_review",
        fields: ["review_id"],
      },
    ],
  },
);
module.exports = ReviewRepliesModel;

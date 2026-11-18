const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// Kết quả yêu cầu hủy độc lập với history: từ chối hủy không phải đổi trạng thái.
module.exports = sequelize.define("order_cancellation_attempts", {
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  actor_id: { type: DataTypes.INTEGER, allowNull: false },
  request_id: { type: DataTypes.STRING(64), allowNull: false },
  fingerprint: { type: DataTypes.STRING(64), allowNull: false },
  response: { type: DataTypes.JSON, allowNull: false },
}, {
  tableName: "order_cancellation_attempts", createdAt: "created_at", updatedAt: false,
  indexes: [{ unique: true, fields: ["order_id", "actor_id", "request_id"] }],
});

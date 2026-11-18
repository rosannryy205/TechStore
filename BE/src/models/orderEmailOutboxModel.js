const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

module.exports = sequelize.define("order_email_outbox", {
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  event_key: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  recipient: { type: DataTypes.STRING(320), allowNull: true },
  payload: { type: DataTypes.JSON, allowNull: false },
  status: { type: DataTypes.ENUM("pending", "sending", "sent", "failed", "skipped"), allowNull: false, defaultValue: "pending" },
  attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  next_attempt_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  lease_until: { type: DataTypes.DATE, allowNull: true },
  lease_token: { type: DataTypes.STRING(36), allowNull: true },
  last_error: { type: DataTypes.STRING(100), allowNull: true },
}, {
  tableName: "order_email_outbox", createdAt: "created_at", updatedAt: "updated_at",
  indexes: [{ fields: ["status", "next_attempt_at"] }],
});

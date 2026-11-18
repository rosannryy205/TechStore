const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

module.exports = sequelize.define("order_status_history", {
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  actor_id: { type: DataTypes.INTEGER, allowNull: false },
  from_status: { type: DataTypes.STRING(30), allowNull: false },
  to_status: { type: DataTypes.STRING(30), allowNull: false },
  reason: { type: DataTypes.STRING(1000), allowNull: true },
}, {
  tableName: "order_status_history", createdAt: "created_at", updatedAt: false,
  indexes: [{ fields: ["order_id", "id"] }],
});

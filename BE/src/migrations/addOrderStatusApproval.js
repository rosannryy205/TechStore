const { DataTypes } = require("sequelize");
const { sequelize, OrderStatusHistory, OrderCancellationAttempt, OrderEmailOutbox } = require("../models");

async function migrate() {
  const query = sequelize.getQueryInterface();
  const columns = await query.describeTable("orders");
  // Chỉ thêm cột còn thiếu, không alter enum/role hoặc backfill dữ liệu cũ.
  for (const [name, type] of Object.entries({ cancellation_reason: DataTypes.STRING(1000), cancelled_by: DataTypes.INTEGER, cancelled_at: DataTypes.DATE })) {
    if (!columns[name]) await query.addColumn("orders", name, { type, allowNull: true });
  }
  for (const model of [OrderStatusHistory, OrderCancellationAttempt, OrderEmailOutbox]) await model.sync();
}
if (require.main === module) migrate().then(() => console.log("Đã cập nhật cấu trúc duyệt đơn hàng.")).catch(() => { console.error("Migration duyệt đơn không thành công; kiểm tra cấu trúc và quyền DB."); process.exitCode = 1; }).finally(() => sequelize.close());
module.exports = { migrate };

const { Op, fn, col } = require("sequelize");
const { Order, OrderItem, ProductVariant, Product, ProductImage, VariantAttributeValue, VariantAttribute, OrderStatusHistory, User, OrderEmailOutbox } = require("../../models");
const { allowedActions, advanceOrder, problem, STATUSES } = require("../orderStatusService");
const { buildAttributeInclude } = require("../../utils/variantHelper");

const itemInclude = { model: OrderItem, as: "items", include: [{
  model: ProductVariant, as: "variant", include: [
    { model: Product, as: "product", attributes: ["id", "name"] },
    ...buildAttributeInclude({ VariantAttributeValue, VariantAttribute }),
  ],
}] };

async function serializeOrders(rows) {
  const orders = rows.map((row) => row.get({ plain: true }));
  const productIds = [...new Set(orders.flatMap((order) => order.items.map((item) => item.variant?.product_id).filter(Boolean)))];
  const images = productIds.length ? await ProductImage.findAll({ where: { product_id: { [Op.in]: productIds } }, order: [["sort_order", "ASC"], ["id", "ASC"]], raw: true }) : [];
  return orders.map((order) => ({
    ...order, order_code: order.order_code || `TS-${order.id}`, ...allowedActions(order),
    items: order.items.map((item) => ({
      id: item.id, product_variant_id: item.product_variant_id, quantity: item.quantity, price: item.price, total: item.total,
      product_name: item.variant?.product?.name || "Sản phẩm không còn tồn tại", sku: item.variant?.sku || "—",
      image: (images.find((image) => image.variant_id === item.product_variant_id) || images.find((image) => image.product_id === item.variant?.product_id))?.img_url || null,
      attributes: (item.variant?.attributeValues || []).map((value) => ({ name: value.attribute?.display_name || value.attribute?.name, value: value.value })),
    })),
  }));
}

async function getOrders(filters = {}) {
  const where = {};
  if (filters.status && filters.status !== "all") where.order_status = filters.status;
  if (filters.paymentMethod && filters.paymentMethod !== "all") where.payment_method = filters.paymentMethod;
  if (filters.paymentStatus && filters.paymentStatus !== "all") where.payment_status = filters.paymentStatus;
  if (filters.search) {
    const search = filters.search.trim();
    const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
    where[Op.or] = ["order_code", "receiver_name", "receiver_phone", "receiver_email"].map((field) => ({ [field]: { [Op.like]: pattern } }));
    const fallback = /^#?TS-(\d+)$/i.exec(search);
    if (fallback) where[Op.or].push({ id: Number(fallback[1]), order_code: { [Op.or]: [null, ""] } });
  }
  if (filters.dateRange && filters.dateRange !== "all") {
    const day = 86400000;
    const today = new Date(`${new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10)}T00:00:00+07:00`);
    const days = filters.dateRange === "7days" ? 7 : filters.dateRange === "30days" ? 30 : 1;
    where.created_at = { [Op.gte]: new Date(today.getTime() - (days - 1) * day) };
  }
  const limit = Number(filters.limit || 8);
  const [total, groups] = await Promise.all([
    Order.count({ where }),
    Order.findAll({ attributes: ["order_status", [fn("COUNT", col("id")), "count"]], group: ["order_status"], raw: true }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(Number(filters.page || 1), totalPages);
  const sort = { newest: ["created_at", "DESC"], oldest: ["created_at", "ASC"], total_desc: ["total_amount", "DESC"], total_asc: ["total_amount", "ASC"] };
  // Phân trang trên orders, không count/limit theo số dòng join với items/history.
  const rows = await Order.findAll({ where, include: [itemInclude], order: [sort[filters.sortBy] || sort.newest, ["id", "DESC"]], limit, offset: (page - 1) * limit });
  const countsByStatus = Object.fromEntries(["all", ...STATUSES].map((key) => [key, 0]));
  for (const group of groups) {
    countsByStatus.all += Number(group.count);
    if (STATUSES.includes(group.order_status)) countsByStatus[group.order_status] = Number(group.count);
  }
  return { data: await serializeOrders(rows), total, page, limit, totalPages, countsByStatus };
}

async function getOrder(id) {
  const row = await Order.findByPk(id, { include: [itemInclude] });
  if (!row) throw problem("Không tìm thấy đơn hàng.", 404, "NOT_FOUND");
  const [order] = await serializeOrders([row]);
  order.status_history = await OrderStatusHistory.findAll({ where: { order_id: id }, include: [{ model: User, as: "actor", attributes: ["id", "name", "role"] }], order: [["id", "ASC"]] });
  order.email_notifications = await OrderEmailOutbox.findAll({ where: { order_id: id }, attributes: ["id", "payload", "status", "attempts", "last_error", "created_at", "updated_at"], order: [["id", "DESC"]] });
  return order;
}

async function bulkAdvance({ orders, targetStatus, actorId }) {
  const results = [];
  for (const order of orders) {
    try {
      await advanceOrder({ orderId: order.id, actorId, expectedStatus: order.expected_status, targetStatus });
      results.push({ id: order.id, success: true });
    } catch (error) {
      results.push({ id: order.id, success: false, message: error.statusCode < 500 ? error.message : "Không xử lý được đơn hàng.", code: error.code || "ORDER_FAILED" });
    }
  }
  return { results, updatedCount: results.filter((item) => item.success).length, failedCount: results.filter((item) => !item.success).length };
}
module.exports = { getOrders, getOrder, bulkAdvance };

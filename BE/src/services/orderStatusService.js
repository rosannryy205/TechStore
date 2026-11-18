const { createHash } = require("node:crypto");
const { sequelize, User, Order, OrderItem, ProductVariant, OrderStatusHistory, OrderCancellationAttempt } = require("../models");
const { queueOrderEmail } = require("./orderEmailService");

const STATUSES = ["pending", "confirmed", "processing", "shipping", "completed", "cancelled"];
const NEXT = { pending: "confirmed", confirmed: "processing", processing: "shipping" };
const CANCELLABLE = ["pending", "confirmed", "processing"];

function problem(message, statusCode = 409, code = "ORDER_CONFLICT") {
  return Object.assign(new Error(message), { statusCode, code });
}

async function loadActor(id, operator = false) {
  const actor = await User.findByPk(id, { attributes: ["id", "role", "status"] });
  if (!actor || actor.status !== 1 || (operator && !["admin", "staff"].includes(actor.role))) {
    throw problem("Bạn không có quyền thực hiện thao tác này.", 403, "FORBIDDEN");
  }
  return actor;
}

function dataProblem(order) {
  if (!STATUSES.includes(order.order_status) || !["pending", "paid", "failed"].includes(order.payment_status) || !["cod", "vnpay", "momo"].includes(order.payment_method)) {
    return "Đơn thiếu thông tin trạng thái hoặc thanh toán, cần kiểm tra trước khi xử lý.";
  }
  return null;
}

function allowedActions(order) {
  const invalid = dataProblem(order);
  const next = NEXT[order.order_status];
  const paymentBlocked = next === "shipping" && order.payment_method !== "cod" && order.payment_status !== "paid";
  return {
    needs_review: Boolean(invalid),
    next_status: !invalid && !paymentBlocked ? next || null : null,
    can_cancel: !invalid && CANCELLABLE.includes(order.order_status) && order.payment_status !== "paid",
    action_reason: invalid || (paymentBlocked ? "Đơn thanh toán trực tuyến chưa thanh toán, chưa thể giao hàng." : null),
  };
}

async function lockedOrder(orderId, actorId, operator, transaction) {
  const where = { id: orderId, ...(!operator ? { user_id: actorId } : {}) };
  const order = await Order.findOne({ where, transaction, lock: transaction.LOCK.UPDATE });
  if (!order) throw problem("Không tìm thấy đơn hàng.", 404, "NOT_FOUND");
  return order;
}

async function advanceOrder({ orderId, actorId, expectedStatus, targetStatus }) {
  await loadActor(actorId, true);
  return sequelize.transaction(async (transaction) => {
    const order = await lockedOrder(orderId, actorId, true, transaction);
    if (order.order_status !== expectedStatus) throw problem("Đơn đã thay đổi. Vui lòng tải lại trước khi thao tác.");
    const invalid = dataProblem(order);
    if (invalid) throw problem(invalid, 409, "NEEDS_REVIEW");
    if (NEXT[order.order_status] !== targetStatus) throw problem("Chỉ được chuyển tuần tự đến Đang giao; không được hoàn tất đơn.");
    if (targetStatus === "shipping" && order.payment_method !== "cod" && order.payment_status !== "paid") {
      throw problem("Đơn thanh toán trực tuyến chưa thanh toán, chưa thể giao hàng.", 409, "PAYMENT_REQUIRED");
    }
    const from = order.order_status;
    await order.update({ order_status: targetStatus }, { transaction });
    const history = await OrderStatusHistory.create({ order_id: order.id, actor_id: actorId, from_status: from, to_status: targetStatus }, { transaction });
    if (targetStatus === "shipping") {
      await queueOrderEmail(order, `shipping:${history.id}`, "shipping", null, transaction);
    }
    return { id: order.id, order_status: order.order_status };
  });
}

// Khóa Order trước khi đọc attempt: cả hủy lặp và duyệt/hủy đồng thời được tuần tự hóa.
async function cancelOrder({ orderId, actorId, operator = false, expectedStatus = "pending", requestId, reason = "" }) {
  await loadActor(actorId, operator);
  const fingerprint = createHash("sha256").update(JSON.stringify({ expectedStatus, reason, operator })).digest("hex");
  const outcome = await sequelize.transaction(async (transaction) => {
    const order = await lockedOrder(orderId, actorId, operator, transaction);
    const previous = await OrderCancellationAttempt.findOne({ where: { order_id: order.id, actor_id: actorId, request_id: requestId }, transaction });
    if (previous) {
      if (previous.fingerprint !== fingerprint) throw problem("Mã yêu cầu đã được dùng cho nội dung khác.", 409, "REQUEST_REUSED");
      return previous.response;
    }
    let failure = dataProblem(order);
    if (!failure && order.order_status !== expectedStatus) failure = "Đơn đã thay đổi trạng thái. Vui lòng tải lại trước khi yêu cầu hủy.";
    if (!failure && order.payment_status === "paid") failure = "Đơn đã thanh toán; chức năng hoàn tiền chưa được hỗ trợ nên không thể hủy.";
    if (!failure && !(operator ? CANCELLABLE : ["pending"]).includes(order.order_status)) failure = "Đơn không còn ở trạng thái được phép hủy.";
    if (!failure && operator && !reason.trim()) throw problem("Vui lòng cung cấp lý do hủy.", 400, "VALIDATION_ERROR");

    const restocks = [];
    if (!failure) {
      const items = await OrderItem.findAll({ where: { order_id: order.id }, transaction });
      const quantities = new Map();
      if (!items.length) failure = "Đơn không có dữ liệu mặt hàng, cần kiểm tra trước khi hủy.";
      for (const item of items) {
        const quantity = Number(item.quantity);
        if (!Number.isSafeInteger(quantity) || quantity <= 0) { failure = "Số lượng mặt hàng cần kiểm tra trước khi hoàn kho."; break; }
        quantities.set(item.product_variant_id, (quantities.get(item.product_variant_id) || 0) + quantity);
      }
      // Kiểm tra toàn bộ trước khi sửa kho, kể cả khi một SKU xuất hiện nhiều dòng.
      for (const [variantId, quantity] of [...quantities].sort((a, b) => a[0] - b[0])) {
        if (failure) break;
        const variant = await ProductVariant.findByPk(variantId, { transaction, lock: transaction.LOCK.UPDATE });
        if (!variant || Number(variant.sold_count) < quantity || Number(variant.stock) + quantity > 2147483647) { failure = "Dữ liệu tồn kho cần kiểm tra trước khi hủy đơn."; break; }
        restocks.push({ variant, quantity });
      }
    }
    const response = failure
      ? { success: false, message: failure, code: "CANCELLATION_REJECTED", statusCode: 409 }
      : { success: true, message: "Đã hủy đơn hàng.", data: { id: order.id, order_status: "cancelled" } };

    if (!failure) {
      for (const { variant, quantity } of restocks) {
        await variant.increment({ stock: quantity, sold_count: -quantity }, { transaction });
      }
      const from = order.order_status;
      await order.update({ order_status: "cancelled", cancellation_reason: reason || null, cancelled_by: actorId, cancelled_at: new Date() }, { transaction });
      await OrderStatusHistory.create({ order_id: order.id, actor_id: actorId, from_status: from, to_status: "cancelled", reason: reason || null }, { transaction });
    }
    // Từ chối nghiệp vụ vẫn commit attempt/outbox; không throw trong transaction làm mất email thất bại.
    const attempt = await OrderCancellationAttempt.create({ order_id: order.id, actor_id: actorId, request_id: requestId, fingerprint, response }, { transaction });
    await queueOrderEmail(order, `cancel:${attempt.id}`, failure ? "cancel_failed" : "cancelled", failure || reason, transaction);
    return response;
  }).catch(async (error) => {
    if (error.statusCode && error.statusCode < 500) throw error;
    // Transaction nghiệp vụ đã rollback hoặc mất ACK khi commit. Đọc lại attempt trước
    // khi kết luận thất bại; nếu đã commit thành công thì trả đúng kết quả, không báo sai.
    return sequelize.transaction(async (transaction) => {
      const order = await lockedOrder(orderId, actorId, operator, transaction);
      const previous = await OrderCancellationAttempt.findOne({ where: { order_id: order.id, actor_id: actorId, request_id: requestId }, transaction });
      if (previous) {
        if (previous.fingerprint !== fingerprint) throw problem("Mã yêu cầu đã được dùng cho nội dung khác.", 409, "REQUEST_REUSED");
        return previous.response;
      }
      const response = { success: false, statusCode: 500, code: "CANCELLATION_FAILED", message: "Yêu cầu hủy chưa thực hiện được do lỗi hệ thống. Vui lòng thử lại." };
      const attempt = await OrderCancellationAttempt.create({ order_id: order.id, actor_id: actorId, request_id: requestId, fingerprint, response }, { transaction });
      await queueOrderEmail(order, `cancel:${attempt.id}`, "cancel_failed", response.message, transaction);
      return response;
    });
  });
  if (!outcome.success) throw problem(outcome.message, outcome.statusCode, outcome.code);
  return outcome.data;
}

module.exports = { advanceOrder, cancelOrder, loadActor, allowedActions, STATUSES, problem };

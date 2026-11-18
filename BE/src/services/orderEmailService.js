const { randomUUID } = require("node:crypto");
const { Op } = require("sequelize");
const { sequelize, User, OrderEmailOutbox } = require("../models");
const { createTransport } = require("./client/emailService");

const LABELS = { shipping: "Đơn hàng đang giao", cancelled: "Hủy đơn thành công", cancel_failed: "Yêu cầu hủy đơn không thành công" };
const MAX_ATTEMPTS = 3;
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const validEmail = (value) => typeof value === "string" && value.length <= 320 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);

async function queueOrderEmail(order, eventKey, event, reason, transaction) {
  const account = await User.findByPk(order.user_id, { attributes: ["email"], transaction });
  const candidate = order.receiver_email?.trim() || account?.email?.trim();
  const recipient = validEmail(candidate) ? candidate : null;
  return OrderEmailOutbox.create({
    order_id: order.id, event_key: eventKey, recipient,
    payload: { event, order_code: order.order_code || `TS-${order.id}`, reason: reason || null, occurred_at: new Date().toISOString() },
    status: recipient ? "pending" : "skipped", last_error: recipient ? null : "MISSING_VALID_RECIPIENT",
  }, { transaction });
}

function buildOrderEmail(job) {
  const { event, order_code: code, reason, occurred_at: at } = job.payload;
  if (!LABELS[event]) throw new Error("UNSUPPORTED_ORDER_EMAIL_EVENT");
  const title = LABELS[event];
  const text = `${title}\nMã đơn: ${code}\nThời điểm: ${new Date(at).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}${reason ? `\nLý do: ${reason}` : ""}`;
  return {
    from: process.env.MAIL_FROM, to: job.recipient,
    subject: `${title} — ${String(code).replace(/[\r\n]/g, " ")}`,
    // Event ID ổn định giúp truy vết; SMTP mất ACK vẫn có thể giao thư trùng khi retry.
    messageId: `<order-${job.id}@techstore.local>`,
    text, html: `<div lang="vi"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text).replace(/\n/g, "<br>")}</p></div>`,
  };
}

// Lease bền trong DB: worker khác không nhận cùng job; job đang gửi được phục hồi sau restart.
async function claimEmail(now = new Date()) {
  return sequelize.transaction(async (transaction) => {
    const job = await OrderEmailOutbox.findOne({
      where: { [Op.or]: [
        { status: "pending", next_attempt_at: { [Op.lte]: now } },
        { status: "sending", lease_until: { [Op.lte]: now } },
      ] },
      order: [["id", "ASC"]], transaction, lock: transaction.LOCK.UPDATE, skipLocked: true,
    });
    if (!job) return null;
    if (job.attempts >= MAX_ATTEMPTS) {
      await job.update({ status: "failed", lease_until: null, lease_token: null, last_error: "DELIVERY_NOT_CONFIRMED" }, { transaction });
      return { exhausted: true };
    }
    await job.update({ status: "sending", attempts: job.attempts + 1, lease_token: randomUUID(), lease_until: new Date(now.getTime() + 120000) }, { transaction });
    return job.get({ plain: true });
  });
}

async function processNextEmail({ sendMail, now = new Date() } = {}) {
  const job = await claimEmail(now);
  if (!job || job.exhausted) return Boolean(job);
  let values;
  try {
    const mail = buildOrderEmail(job);
    const result = await (sendMail ? sendMail(mail) : createTransport().sendMail(mail));
    if (result?.rejected?.length) throw new Error("RECIPIENT_REJECTED");
    values = { status: "sent", last_error: null };
  } catch {
    // Không lưu raw SMTP error vì có thể chứa địa chỉ/credentials hoặc dữ liệu transport.
    values = { status: job.attempts >= MAX_ATTEMPTS ? "failed" : "pending", last_error: "SMTP_DELIVERY_FAILED", next_attempt_at: new Date(now.getTime() + 60000 * job.attempts ** 2) };
  }
  await OrderEmailOutbox.update({ ...values, lease_until: null, lease_token: null }, { where: { id: job.id, lease_token: job.lease_token } });
  return true;
}

module.exports = { queueOrderEmail, buildOrderEmail, processNextEmail };

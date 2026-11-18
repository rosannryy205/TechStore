const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { Sequelize } = require("sequelize");
const jwt = require("jsonwebtoken");
require("dotenv").config({ quiet: true });

// Schema tạm của tiến trình: không sync, seed hoặc xóa DB cửa hàng.
const database = `techstore_order_test_${process.pid}`;
process.env.DB_NAME = database;
process.env.JWT_SECRET = randomUUID();
const models = require("../src/models");
const { sequelize, User, Order, OrderItem, ProductVariant, Product, Category, Brand, OrderStatusHistory: History, OrderCancellationAttempt: Attempt, OrderEmailOutbox: Outbox } = models;
const { processNextEmail, buildOrderEmail } = require("../src/services/orderEmailService");
let connection, server, baseUrl, variant;
const cookie = (id) => `auth_token=${jwt.sign({ userId: id }, process.env.JWT_SECRET)}`;
async function api(path, { user = 1, method = "GET", body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, { method, headers: { Cookie: cookie(user), "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, ...await response.json() };
}
async function order(changes = {}) {
  const row = await Order.create({ user_id: 3, receiver_name: "Khách test", receiver_phone: "0901234567", receiver_email: "orders@example.test", address: "Địa chỉ test", payment_method: "cod", payment_status: "pending", order_status: "pending", total_amount: 100, ...changes });
  await OrderItem.create({ order_id: row.id, product_variant_id: variant.id, quantity: 2, price: 50, total: 100 });
  return row;
}
const advance = (row, from, target, user = 1) => api(`/api/admin/orders/${row.id}/status`, { user, method: "PATCH", body: { expected_status: from, target_status: target } });
const cancel = (row, { user = 1, key = randomUUID(), from = row.order_status, reason = "Khách yêu cầu hủy", client = false } = {}) => api(`/api/${client ? "orders" : "admin/orders"}/${row.id}/cancel`, { user, method: "PUT", body: { expected_status: from, request_id: key, reason } });

before(async () => {
  assert.match(database, /^techstore_order_test_\d+$/);
  connection = new Sequelize("mysql", process.env.DB_USER || "root", process.env.DB_PASSWORD || "", { host: process.env.DB_HOST || "localhost", port: process.env.DB_PORT || 3306, dialect: "mysql", logging: false });
  await connection.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  sequelize.options.logging = false;
  await sequelize.sync();
  await require("../src/migrations/addOrderStatusApproval").migrate();
  await require("../src/migrations/addOrderStatusApproval").migrate();
  await User.bulkCreate([
    { id: 1, name: "Admin", email: "admin@example.test", role: "admin", status: 1 },
    { id: 2, name: "Staff", email: "staff@example.test", role: "staff", status: 1 },
    { id: 3, name: "Khách", email: "customer@example.test", role: "customer", status: 1 },
    { id: 4, name: "Khách khác", email: "other@example.test", role: "customer", status: 1 },
    { id: 5, name: "Bị khóa", email: "locked@example.test", role: "staff", status: 0 },
  ]);
  await Category.create({ id: 1, name: "Test", slug: "order-test", status: 1 });
  await Brand.create({ id: 1, name: "Test", slug: "order-test", status: 1 });
  await Product.create({ id: 1, name: "Điện thoại", slug: "order-test", description: "", category_id: 1, brand_id: 1, status: 1 });
  variant = await ProductVariant.create({ product_id: 1, sku: "ORDER-TEST", price: 50, sale_price: 0, stock: 1000, sold_count: 1000 });
  const app = require("../src/app");
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
  if (connection) { await connection.query(`DROP DATABASE IF EXISTS \`${database}\``); await connection.close(); }
});

test("Admin/Staff tiến tuần tự đến Shipping, không completed, không tự paid/trừ kho", async () => {
  const row = await order();
  const stock = (await variant.reload()).stock;
  assert.equal((await advance(row, "pending", "processing")).status, 409);
  assert.equal((await advance(row, "pending", "confirmed", 2)).status, 200);
  assert.equal((await advance(row, "pending", "confirmed")).status, 409);
  assert.equal((await advance(row, "confirmed", "processing")).status, 200);
  assert.equal((await advance(row, "processing", "shipping", 2)).status, 200);
  assert.equal((await advance(row, "shipping", "completed")).status, 400);
  await row.reload();
  assert.equal(row.order_status, "shipping");
  assert.equal(row.payment_status, "pending");
  assert.equal((await variant.reload()).stock, stock);
  assert.equal(await History.count({ where: { order_id: row.id } }), 3);
  assert.equal(await Outbox.count({ where: { order_id: row.id } }), 1);
});

test("online phải paid trước giao, đơn legacy không được suy đoán; auth/quyền độc lập", async () => {
  const row = await order({ payment_method: "vnpay", order_status: "processing" });
  assert.equal((await advance(row, "processing", "shipping")).code, "PAYMENT_REQUIRED");
  await row.update({ payment_status: "paid" });
  assert.equal((await advance(row, "processing", "shipping")).status, 200);
  const legacy = await order({ payment_status: null });
  assert.equal((await advance(legacy, "pending", "confirmed")).code, "NEEDS_REVIEW");
  assert.equal((await api("/api/admin/orders", { user: 3 })).status, 403);
  assert.equal((await api("/api/admin/orders", { user: 5 })).status, 403);
  const unauthenticated = await fetch(`${baseUrl}/api/admin/orders`);
  assert.equal(unauthenticated.status, 401);
});

test("hủy lặp/đồng thời hoàn kho và ghi lịch sử/email đúng một lần", async () => {
  const row = await order();
  const key = randomUUID();
  const beforeStock = (await variant.reload()).stock;
  const beforeSold = variant.sold_count;
  const results = await Promise.all([cancel(row, { key }), cancel(row, { key })]);
  assert.deepEqual(results.map((result) => result.status), [200, 200]);
  await variant.reload();
  assert.equal(variant.stock, beforeStock + 2);
  assert.equal(variant.sold_count, beforeSold - 2);
  assert.equal(await History.count({ where: { order_id: row.id } }), 1);
  assert.equal(await Attempt.count({ where: { order_id: row.id } }), 1);
  assert.equal(await Outbox.count({ where: { order_id: row.id } }), 1);
  assert.equal((await cancel(row, { key, reason: "Nội dung khác" })).code, "REQUEST_REUSED");
});

test("hủy paid/thao tác trên dữ liệu cũ tạo email thất bại có lý do, không đổi đơn/kho", async () => {
  const row = await order({ payment_status: "paid" });
  const beforeStock = (await variant.reload()).stock;
  const failed = await cancel(row);
  assert.equal(failed.status, 409);
  const mail = await Outbox.findOne({ where: { order_id: row.id } });
  assert.equal(mail.payload.event, "cancel_failed");
  assert.match(mail.payload.reason, /thanh toán/);
  assert.equal((await row.reload()).order_status, "pending");
  assert.equal((await variant.reload()).stock, beforeStock);
  assert.equal(await History.count({ where: { order_id: row.id } }), 0);
  const count = await Outbox.count();
  assert.equal((await cancel(row, { user: 4, client: true })).status, 404);
  assert.equal(await Outbox.count(), count);
});

test("khách tự hủy Pending, không lộ lịch sử nhân viên, ngày hủy có bằng chứng", async () => {
  const row = await order({ receiver_email: null });
  assert.equal((await cancel(row, { user: 3, client: true })).status, 200);
  const mail = await Outbox.findOne({ where: { order_id: row.id } });
  assert.equal(mail.recipient, "customer@example.test");
  const response = await api("/api/orders/my-orders", { user: 3 });
  const data = response.data.find((item) => item.id === row.id);
  assert.ok(data.cancelled_at);
  assert.ok(data.status_changed_at);
  assert.equal(data.cancellation_reason, "Khách yêu cầu hủy");
  assert.equal(data.status_history, undefined);
  assert.equal(data.cancelled_by, undefined);
  assert.equal(data.email_notifications, undefined);
});

test("duyệt đồng thời khách hủy chỉ một thao tác được áp dụng", async () => {
  const row = await order();
  const results = await Promise.all([advance(row, "pending", "confirmed"), cancel(row, { user: 3, client: true })]);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
  assert.equal(await History.count({ where: { order_id: row.id } }), 1);
});

test("bulk từng đơn độc lập, validate đúng đích/phần tử trùng, phân trang/sort/filter ở BE", async () => {
  const first = await order({ receiver_name: "Nhóm kiểm tra", total_amount: 900 });
  const second = await order({ receiver_name: "Nhóm kiểm tra", total_amount: 100 });
  const terminal = await order({ order_status: "cancelled" });
  const response = await api("/api/admin/orders/bulk-status", { method: "POST", body: { target_status: "confirmed", orders: [first, terminal].map((row) => ({ id: row.id, expected_status: row.order_status })) } });
  assert.equal(response.data.updatedCount, 1);
  assert.equal(response.data.failedCount, 1);
  for (const body of [
    { target_status: "shipping", orders: [{ id: second.id, expected_status: "pending" }] },
    { target_status: "confirmed", orders: [second, second].map((row) => ({ id: row.id, expected_status: "pending" })) },
  ]) assert.equal((await api("/api/admin/orders/bulk-status", { method: "POST", body })).status, 400);
  const listing = await api(`/api/admin/orders?search=${encodeURIComponent("Nhóm kiểm tra")}&sortBy=total_asc&limit=1&page=99`);
  assert.equal(listing.total, 2);
  assert.equal(listing.page, 2);
  assert.equal(listing.data[0].id, first.id);
  const fallback = await api(`/api/admin/orders?search=TS-${second.id}`);
  assert.equal(fallback.total, 1);
  assert.equal(fallback.data[0].order_code, `TS-${second.id}`);
  const detail = await api(`/api/admin/orders/${first.id}`);
  assert.equal(detail.data.status_history.length, 1);
  assert.ok(detail.data.status_history[0].actor.name);
});

test("lỗi ghi outbox rollback cả trạng thái và history, không SMTP trong transaction", async () => {
  const row = await order({ order_status: "processing" });
  Outbox.addHook("beforeCreate", "fail-test", () => { throw new Error("temporary-test-failure"); });
  try { assert.equal((await advance(row, "processing", "shipping")).status, 500); }
  finally { Outbox.removeHook("beforeCreate", "fail-test"); }
  assert.equal((await row.reload()).order_status, "processing");
  assert.equal(await History.count({ where: { order_id: row.id } }), 0);
});

test("outbox retry hữu hạn, phục hồi lease, nội dung HTML an toàn và không sửa đơn", async () => {
  await Outbox.destroy({ where: {} });
  const row = await order({ order_status: "processing" });
  assert.equal((await advance(row, "processing", "shipping")).status, 200);
  const start = Date.now();
  let sends = 0;
  for (let index = 0; index < 3; index++) {
    await processNextEmail({ now: new Date(start + index * 600000), sendMail: async () => { sends++; throw new Error("SMTP test with secret"); } });
  }
  const job = await Outbox.findOne({ where: { order_id: row.id } });
  assert.equal(job.status, "failed");
  assert.equal(job.attempts, 3);
  assert.equal(sends, 3);
  assert.equal(job.last_error, "SMTP_DELIVERY_FAILED");
  assert.equal((await row.reload()).order_status, "shipping");
  await job.update({ status: "sending", attempts: 1, lease_until: new Date(0) });
  await processNextEmail({ sendMail: async () => ({ accepted: [job.recipient], rejected: [] }) });
  assert.equal((await job.reload()).status, "sent");
  const mail = buildOrderEmail({ id: 999, recipient: "safe@example.test", payload: { event: "cancel_failed", order_code: "TS-1", reason: '<script>alert("x")</script>', occurred_at: new Date().toISOString() } });
  assert.match(mail.text, /Lý do:/);
  assert.ok(!mail.html.includes("<script>"));
});

test("lỗi kỹ thuật khi hủy được rollback, ghi email thất bại riêng sau khi DB phục hồi", async () => {
  const row = await order();
  const key = randomUUID();
  const stock = (await variant.reload()).stock;
  History.addHook("beforeCreate", "fail-cancel", () => { throw new Error("internal test SQL details"); });
  try {
    const response = await cancel(row, { key });
    assert.equal(response.status, 500);
    assert.equal(response.code, "CANCELLATION_FAILED");
    assert.ok(!response.message.includes("SQL"));
  } finally { History.removeHook("beforeCreate", "fail-cancel"); }
  assert.equal((await row.reload()).order_status, "pending");
  assert.equal((await variant.reload()).stock, stock);
  assert.equal(await History.count({ where: { order_id: row.id } }), 0);
  const email = await Outbox.findOne({ where: { order_id: row.id } });
  assert.equal(email.payload.event, "cancel_failed");
  assert.ok(email.payload.reason.includes("lỗi hệ thống"));
  assert.equal((await cancel(row, { key })).status, 500);
  assert.equal(await Outbox.count({ where: { order_id: row.id } }), 1);
});

test("dữ liệu kho sai không hoàn một phần, vẫn ghi nhận hủy thất bại có lý do", async () => {
  const row = await order();
  await OrderItem.update({ quantity: -1 }, { where: { order_id: row.id } });
  const stock = (await variant.reload()).stock;
  assert.equal((await cancel(row)).status, 409);
  assert.equal((await variant.reload()).stock, stock);
  assert.equal((await row.reload()).order_status, "pending");
  const email = await Outbox.findOne({ where: { order_id: row.id } });
  assert.match(email.payload.reason, /Số lượng/);
});

test("thiếu recipient không chặn nghiệp vụ; query trùng và payload không hợp lệ bị chặn", async () => {
  await User.update({ email: null }, { where: { id: 4 } });
  const row = await order({ user_id: 4, receiver_email: null, order_status: "processing" });
  assert.equal((await advance(row, "processing", "shipping")).status, 200);
  const email = await Outbox.findOne({ where: { order_id: row.id } });
  assert.equal(email.status, "skipped");
  assert.equal(email.last_error, "MISSING_VALID_RECIPIENT");
  assert.equal((await api("/api/admin/orders?status=pending&status=confirmed")).status, 400);
  assert.equal((await api(`/api/admin/orders/${row.id}/cancel`, { method: "PUT", body: { expected_status: "shipping", reason: "", request_id: "bad" } })).status, 400);
});

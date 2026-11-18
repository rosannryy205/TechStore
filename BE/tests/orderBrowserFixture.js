// Chạy thủ công để nghiệm thu UI với API/DB thật, không khởi động worker gửi email.
const { Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");
const { randomUUID } = require("node:crypto");
require("dotenv").config({ quiet: true });
const database = `techstore_order_browser_${process.pid}`;
process.env.DB_NAME = database;
process.env.JWT_SECRET = randomUUID();
process.env.CORS_ORIGIN = "http://localhost:4318";
const { sequelize, User, Order, OrderItem, Product, ProductVariant, Category, Brand } = require("../src/models");
let connection, server;
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  if (server) await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
  if (connection) { await connection.query(`DROP DATABASE IF EXISTS \`${database}\``); await connection.close(); }
}
async function run() {
  if (!/^techstore_order_browser_\d+$/.test(database)) throw new Error("Unsafe test schema");
  connection = new Sequelize("mysql", process.env.DB_USER || "root", process.env.DB_PASSWORD || "", { host: process.env.DB_HOST || "localhost", port: process.env.DB_PORT || 3306, dialect: "mysql", logging: false });
  await connection.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  sequelize.options.logging = false;
  await sequelize.sync();
  const password = await bcrypt.hash("OrderBrowserTest-only", 10);
  await User.bulkCreate([
    { id: 1, name: "Nhân viên nghiệm thu", email: "staff@example.test", role: "staff", status: 1, password },
    { id: 2, name: "Khách nghiệm thu", email: "customer@example.test", role: "customer", status: 1, password },
  ]);
  await Category.create({ id: 1, name: "Điện thoại", slug: "browser-test", status: 1 });
  await Brand.create({ id: 1, name: "TechStore", slug: "browser-test", status: 1 });
  await Product.create({ id: 1, name: "Điện thoại nghiệm thu", slug: "browser-test", description: "", category_id: 1, brand_id: 1, status: 1 });
  const variant = await ProductVariant.create({ product_id: 1, sku: "BROWSER-TEST", price: 1000000, sale_price: 0, stock: 100, sold_count: 100 });
  for (let index = 1; index <= 12; index++) {
    const row = await Order.create({ user_id: 2, order_code: `QA-${index}`, receiver_name: `Khách hàng ${index}`, receiver_phone: "0901234567", receiver_email: "customer@example.test", address: "Địa chỉ nghiệm thu", subtotal: 2000000, total_amount: 2000000, shipping_fee: 0, discount_amount: 0, payment_method: index === 3 ? "vnpay" : "cod", payment_status: "pending", order_status: index <= 4 ? "processing" : index <= 6 ? "confirmed" : "pending" });
    await OrderItem.create({ order_id: row.id, product_variant_id: variant.id, quantity: 2, price: 1000000, total: 2000000 });
  }
  server = require("../src/app").listen(4317, "127.0.0.1", () => console.log(`Browser fixture ready at http://localhost:4317 (${database}); SMTP worker disabled.`));
  server.on("error", async () => { await stop(); process.exitCode = 1; });
}
process.on("SIGINT", () => stop().catch(() => { process.exitCode = 1; }));
process.on("SIGTERM", () => stop().catch(() => { process.exitCode = 1; }));
run().catch(async () => { console.error("Không thể chạy fixture nghiệm thu."); await stop(); process.exitCode = 1; });

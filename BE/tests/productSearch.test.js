const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { Sequelize } = require("sequelize");
require("dotenv").config({ quiet: true });

// Chỉ tạo/xóa schema có tên riêng của tiến trình test; tuyệt đối không sync DB cửa hàng.
const testDatabase = `techstore_search_test_${process.pid}`;
process.env.DB_NAME = testDatabase;
const {
  sequelize,
  Category,
  Brand,
  Product,
  ProductVariant,
  ProductImage,
} = require("../src/models");
let adminConnection;
let server;
let baseUrl;

before(async () => {
  adminConnection = new Sequelize(
    "mysql",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      dialect: "mysql",
      logging: false,
    },
  );
  assert.match(testDatabase, /^techstore_search_test_\d+$/);
  await adminConnection.query(
    `CREATE DATABASE \`${testDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  sequelize.options.logging = false;
  await sequelize.sync();
  await Category.bulkCreate([
    { id: 1, name: "Điện thoại", slug: "dien-thoai", status: 1 },
    { id: 2, name: "Ẩn", slug: "an", status: 0 },
  ]);
  await Brand.bulkCreate([
    { id: 1, name: "Apple", slug: "apple", status: 1 },
    { id: 2, name: "Ẩn", slug: "an", status: 0 },
  ]);
  for (let id = 1; id <= 15; id++) {
    await Product.create({
      id,
      name: `iPhone ${id}`,
      slug: `iphone-${id}`,
      description: "Không tìm trong mô tả",
      category_id: 1,
      brand_id: 1,
      status: 1,
      created_at: new Date("2026-01-01"),
      sold_count: id,
    });
    await ProductVariant.create({
      product_id: id,
      sku: `PHONE-${id}`,
      price: id * 1000000,
      sale_price: 0,
      stock: 5,
      status: 1,
    });
  }
  const app = express();
  app.use("/api/products", require("../src/routes/client/productRoutes"));
  app.use(require("../src/middleware/errorHandler"));
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/products`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
  // Tên schema được sinh ở trên, không nhận bất kỳ giá trị DB_NAME nào của người dùng.
  if (adminConnection) {
    await adminConnection.query(`DROP DATABASE IF EXISTS \`${testDatabase}\``);
    await adminConnection.close();
  }
});

test("API tìm mọi từ qua tên Product/Brand/Category, không dấu, đ/d và phân trang tại BE", async () => {
  const response = await fetch(
    `${baseUrl}?q=${encodeURIComponent("APPLE dien thoai iphone")}&limit=2`,
  );
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.total, 15);
  assert.equal(result.totalPages, 8);
  assert.equal(result.limit, 2);
  assert.deepEqual(
    result.data.map((product) => product.id),
    [15, 14],
  );
});

test("lọc giá và sort trước phân trang; trang vượt giới hạn trả trang cuối", async () => {
  const query = "q=iphone&price=10m-20m&sort=price_asc&limit=2";
  const second = await (await fetch(`${baseUrl}?${query}&page=2`)).json();
  assert.equal(second.total, 6);
  assert.deepEqual(
    second.data.map((product) => product.id),
    [12, 13],
  );
  const last = await (await fetch(`${baseUrl}?${query}&page=999`)).json();
  assert.equal(last.page, 3);
  assert.deepEqual(
    last.data.map((product) => product.id),
    [14, 15],
  );
});

test("Unicode tổ hợp vẫn khớp và không tìm nội dung chỉ có trong mô tả", async () => {
  const unicode = await (
    await fetch(
      `${baseUrl}?q=${encodeURIComponent("Điện thoại APPLE".normalize("NFD"))}`,
    )
  ).json();
  assert.equal(unicode.total, 15);
  const description = await (await fetch(`${baseUrl}?q=mo%20ta`)).json();
  assert.equal(description.total, 0);
});

test("ký tự cấm trả tập rỗng, còn query sai cấu trúc/quá dài trả 400", async () => {
  for (const q of [
    "iphone%",
    "iphone_",
    "USB-C",
    "S24+",
    "10.9",
    "iphone😀",
    "' OR 1=1",
  ]) {
    const response = await fetch(`${baseUrl}?q=${encodeURIComponent(q)}`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.total, 0);
    assert.deepEqual(body.data, []);
  }
  for (const query of [
    "limit=101",
    "page=0",
    "page=abc",
    "sort=unknown",
    "sale=maybe",
    "price=invalid",
    "q=a&q=b",
    `q=${"a".repeat(101)}`,
  ]) {
    assert.equal((await fetch(`${baseUrl}?${query}`)).status, 400, query);
  }
});

test("ẩn Product/Brand/Category bị tắt và Product không có Variant active", async () => {
  for (const [id, changes, variantStatus] of [
    [20, { status: 0 }, 1],
    [21, { brand_id: 2 }, 1],
    [22, { category_id: 2 }, 1],
    [23, {}, 0],
    [24, {}, null],
  ]) {
    await Product.create({
      id,
      name: "Excluded",
      slug: `excluded-${id}`,
      description: "",
      category_id: 1,
      brand_id: 1,
      status: 1,
      ...changes,
    });
    if (variantStatus !== null)
      await ProductVariant.create({
        product_id: id,
        sku: `EX-${id}`,
        price: 100,
        sale_price: 0,
        stock: 2,
        status: variantStatus,
      });
  }
  const body = await (await fetch(`${baseUrl}?q=Excluded`)).json();
  assert.equal(body.total, 0);
});

test("Starting Price ưu tiên còn hàng, fallback hết hàng, ưu đãi và count không nhân theo ảnh", async () => {
  await Product.create({
    id: 30,
    name: "SpecialPhone",
    slug: "special",
    description: "",
    category_id: 1,
    brand_id: 1,
    status: 1,
  });
  await ProductVariant.bulkCreate([
    {
      product_id: 30,
      sku: "SPECIAL-OUT",
      price: 7000000,
      sale_price: 3000000,
      stock: 0,
      status: 1,
    },
    {
      product_id: 30,
      sku: "SPECIAL-IN",
      price: 15000000,
      sale_price: 12000000,
      stock: 2,
      status: 1,
    },
    {
      product_id: 30,
      sku: "SPECIAL-TIE",
      price: 12000000,
      sale_price: 0,
      stock: 3,
      status: 1,
    },
    {
      product_id: 30,
      sku: "SPECIAL-HIDDEN",
      price: 1000000,
      sale_price: 500000,
      stock: 20,
      status: 0,
    },
  ]);
  const variant = await ProductVariant.findOne({ where: { product_id: 30 } });
  await ProductImage.bulkCreate([
    {
      product_id: 30,
      variant_id: variant.id,
      img_url: "one.png",
      sort_order: 0,
    },
    {
      product_id: 30,
      variant_id: variant.id,
      img_url: "two.png",
      sort_order: 1,
    },
  ]);
  let body = await (
    await fetch(`${baseUrl}?q=SpecialPhone&price=10m-20m&sale=true`)
  ).json();
  assert.equal(body.total, 1);
  assert.equal(body.data.length, 1);
  assert.equal(body.data[0].minPrice, 12000000);
  assert.equal(body.data[0].originalPrice, 15000000);
  assert.equal(body.data[0].hasSale, true);
  assert.equal(body.data[0].isOutOfStock, false);
  assert.equal(body.data[0].variants.length, 3);
  await ProductVariant.update({ stock: 0 }, { where: { product_id: 30 } });
  body = await (
    await fetch(`${baseUrl}?q=SpecialPhone&price=under-10m&sale=true`)
  ).json();
  assert.equal(body.total, 1);
  assert.equal(body.data[0].minPrice, 3000000);
  assert.equal(body.data[0].isOutOfStock, true);
});

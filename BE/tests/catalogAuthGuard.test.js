const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { Sequelize } = require("sequelize");
const jwt = require("jsonwebtoken");
require("dotenv").config({ quiet: true });

// Chỉ sync/drop schema do tiến trình này tạo, không dùng DB_NAME của cửa hàng.
const database = `techstore_catalog_test_${process.pid}`;
process.env.DB_NAME = database;
process.env.JWT_SECRET = randomUUID();
const {
  sequelize, User, Brand, Category, CategoryBrand, Product, ProductVariant,
  ProductImage, VariantAttribute, VariantAttributeOption, VariantAttributeValue, Review,
} = require("../src/models");
let connection;
let databaseCreated = false;
let server;
let baseUrl;

const cookie = (userId) => `auth_token=${jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "5m" })}`;

async function api(path, { method = "GET", token, body } = {}) {
  const multipart = body instanceof FormData;
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Cookie: token } : {}),
      ...(body && !multipart ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: multipart ? body : JSON.stringify(body) } : {}),
  });
  return { status: response.status, payload: await response.json() };
}

async function catalogSnapshot() {
  const tables = [Brand, Category, CategoryBrand, Product, ProductVariant, ProductImage,
    VariantAttribute, VariantAttributeOption, VariantAttributeValue];
  return Promise.all(tables.map((model) => model.findAll({
    raw: true,
    order: model.primaryKeyAttributes.map((key) => [key, "ASC"]),
  })));
}

async function uploadSnapshot() {
  return Promise.all(["brands", "products"].map(async (directory) => {
    const files = await fs.readdir(path.join(__dirname, "../src/uploads", directory));
    return files.sort();
  }));
}

before(async () => {
  assert.match(database, /^techstore_catalog_test_\d+$/);
  connection = new Sequelize("mysql", process.env.DB_USER || "root", process.env.DB_PASSWORD || "", {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  });
  await connection.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  databaseCreated = true;
  sequelize.options.logging = false;
  await sequelize.sync();
  await User.bulkCreate([
    { id: 1, name: "Admin", email: "admin@example.test", role: "admin", status: 1 },
    { id: 2, name: "Staff", email: "staff@example.test", role: "staff", status: 1 },
    { id: 3, name: "Customer", email: "customer@example.test", role: "customer", status: 1 },
    { id: 4, name: "Locked staff", email: "locked@example.test", role: "staff", status: 0 },
    { id: 5, name: "Locked admin", email: "locked-admin@example.test", role: "admin", status: 0 },
  ]);
  await Brand.create({ id: 1, name: "Fixture", slug: "fixture", status: 1 });
  await Category.create({ id: 1, name: "Fixture", slug: "fixture", status: 1 });
  await VariantAttribute.create({ id: 1, name: "fixture", display_name: "Fixture", status: 1 });
  await VariantAttributeOption.create({ id: 1, attribute_id: 1, value: "Fixture", status: 1 });
  server = require("../src/app").listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  try {
    if (server) await new Promise((resolve) => server.close(resolve));
  } finally {
    try {
      await sequelize.close();
    } finally {
      if (connection) {
        try {
          if (databaseCreated) await connection.query(`DROP DATABASE \`${database}\``);
        } finally {
          await connection.close();
        }
      }
    }
  }
});

test("Product catalog từ chối khách vãng lai trước khi trả dữ liệu quản trị", async () => {
  const result = await api("/api/admin/products");
  assert.equal(result.status, 401);
  assert.deepEqual(result.payload, { success: false, message: "Unauthorized" });
});

test("Brand catalog từ chối khách vãng lai trước khi trả dữ liệu quản trị", async () => {
  const result = await api("/api/admin/brands");
  assert.equal(result.status, 401);
  assert.deepEqual(result.payload, { success: false, message: "Unauthorized" });
});

test("Category catalog xác thực trước khi validate payload", async () => {
  const result = await api("/api/admin/categories", { method: "POST", body: {} });
  assert.equal(result.status, 401);
  assert.deepEqual(result.payload, { success: false, message: "Unauthorized" });
});

test("Attribute catalog từ chối khách vãng lai trước khi trả dữ liệu quản trị", async () => {
  const result = await api("/api/admin/variant-attributes");
  assert.equal(result.status, 401);
  assert.deepEqual(result.payload, { success: false, message: "Unauthorized" });
});

// Payload hợp lệ và ID tồn tại: nếu guard bị bỏ, test phát hiện cả thay đổi dữ liệu.
const deniedRoutes = [
  { method: "GET", route: "/api/admin/products" },
  { method: "POST", route: "/api/admin/products", body: {
    name: "Denied product", category_id: 1, brand_id: 1, description: "Fixture",
    variants: [{ sku: "DENIED", price: 100, stock: 1 }],
  } },
  { method: "GET", route: "/api/admin/brands" },
  { method: "POST", route: "/api/admin/brands", body: { name: "Denied", slug: "denied" } },
  { method: "POST", route: "/api/admin/categories", body: { name: "Denied", slug: "denied", brandIds: [1] } },
  { method: "GET", route: "/api/admin/variant-attributes" },
  { method: "POST", route: "/api/admin/variant-attributes", body: { name: "denied", display_name: "Denied" } },
  { method: "PUT", route: "/api/admin/variant-attributes/1", body: { display_name: "Denied" } },
  { method: "DELETE", route: "/api/admin/variant-attributes/1" },
  { method: "POST", route: "/api/admin/variant-attributes/1/options", body: { value: "Denied" } },
  { method: "PUT", route: "/api/admin/variant-attributes/1/options/1", body: { value: "Denied" } },
  { method: "DELETE", route: "/api/admin/variant-attributes/1/options/1" },
];

const deniedActors = [
  { name: "khách vãng lai", token: () => undefined, status: 401 },
  { name: "JWT sai chữ ký", token: () => `auth_token=${jwt.sign({ userId: 1 }, randomUUID())}`, status: 401 },
  { name: "JWT hết hạn", token: () => `auth_token=${jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: -1 })}`, status: 401 },
  { name: "Customer active", token: () => cookie(3), status: 403 },
  { name: "Staff bị khóa", token: () => cookie(4), status: 403 },
  { name: "Admin bị khóa", token: () => cookie(5), status: 403 },
  { name: "user không tồn tại", token: () => cookie(999), status: 403 },
  { name: "JWT khai role admin nhưng DB là customer", token: () => `auth_token=${jwt.sign({ userId: 3, role: "admin", status: 1 }, process.env.JWT_SECRET)}`, status: 403 },
];

for (const actor of deniedActors) {
  test(`Ma trận 12 route: ${actor.name} bị chặn, không đổi catalog`, async (t) => {
    const snapshot = await catalogSnapshot();
    for (const { method, route, body } of deniedRoutes) {
      await t.test(`${method} ${route}`, async () => {
        const result = await api(route, { method, body, token: actor.token() });
        assert.equal(result.status, actor.status);
        assert.deepEqual(result.payload, {
          success: false,
          message: actor.status === 401 ? "Unauthorized" : "Forbidden: Bạn không có quyền thực hiện thao tác này.",
        });
        assert.deepEqual(await catalogSnapshot(), snapshot);
      });
    }
  });
}

test("Multipart bị từ chối trước Multer, không sinh file hoặc đổi catalog", async (t) => {
  const files = await uploadSnapshot();
  const snapshot = await catalogSnapshot();
  for (const actor of deniedActors) {
    for (const directory of ["brands", "products"]) {
      await t.test(`${actor.name}: ${directory}`, async () => {
        const body = new FormData();
        body.set("name", "Denied upload");
        body.set("slug", "denied-upload");
        body.set("category_id", "1");
        body.set("brand_id", "1");
        body.set("description", "Fixture");
        body.set("variants", JSON.stringify([{ sku: "DENIED-UPLOAD", price: 100, stock: 1 }]));
        body.set(directory === "brands" ? "logo" : "images", new Blob(["catalog-test"], { type: "image/png" }), "test-logo.png");
        const result = await api(`/api/admin/${directory}`, { method: "POST", body, token: actor.token() });
        assert.equal(result.status, actor.status);
        assert.equal(result.payload.success, false);
        assert.deepEqual(await uploadSnapshot(), files);
        assert.deepEqual(await catalogSnapshot(), snapshot);
      });
    }
  }
});

for (const { role, userId } of [{ role: "admin", userId: 1 }, { role: "staff", userId: 2 }]) {
  test(`${role} active thực thi thành công đủ 12 route catalog`, async (t) => {
    const token = cookie(userId);
    const attributesPath = "/api/admin/variant-attributes";
    let brand, category, product, attribute, option;
    async function request(route, method, body, expected) {
      const result = await api(route, { method, body, token });
      assert.equal(result.status, expected, `${method} ${route}: ${JSON.stringify(result.payload)}`);
      return result.payload;
    }

    await t.test("POST Brand", async () => {
      brand = (await request("/api/admin/brands", "POST", { name: role, slug: role }, 201)).data;
      assert.equal(brand.slug, role);
    });
    await t.test("GET Brand", async () => {
      const list = await request("/api/admin/brands", "GET", undefined, 200);
      assert.ok(list.data.some((item) => item.id === brand.id && item.name === role));
    });
    await t.test("POST Category và liên kết Brand", async () => {
      category = (await request("/api/admin/categories", "POST", {
        name: role, slug: role, brandIds: [brand.id],
      }, 201)).data;
      assert.equal(category.slug, role);
      assert.ok(await CategoryBrand.findOne({ where: { category_id: category.id, brand_id: brand.id } }));
    });
    await t.test("POST Product và Variant", async () => {
      product = (await request("/api/admin/products", "POST", {
        name: `Catalog ${role}`, category_id: category.id, brand_id: brand.id, description: "Fixture",
        variants: [{ sku: `CATALOG-${role}`, price: 100, stock: 3 }],
      }, 201)).data;
      assert.equal(product.name, `Catalog ${role}`);
    });
    await t.test("GET Product gồm Variant vừa tạo", async () => {
      const list = await request("/api/admin/products", "GET", undefined, 200);
      const saved = list.data.find((item) => item.id === product.id);
      assert.equal(saved.variants[0].sku, `CATALOG-${role}`);
      assert.equal(saved.variants[0].stock, 3);
    });
    await t.test("POST Attribute", async () => {
      attribute = (await request(attributesPath, "POST", {
        name: role, display_name: role, type: "select", options: ["Initial"],
      }, 201)).data;
      assert.equal(attribute.name, role);
    });
    await t.test("GET Attribute gồm Option ban đầu", async () => {
      const list = await request(attributesPath, "GET", undefined, 200);
      assert.equal(list.data.find((item) => item.id === attribute.id).options[0].value, "Initial");
    });
    await t.test("PUT Attribute", async () => {
      const updated = await request(`${attributesPath}/${attribute.id}`, "PUT", { display_name: "Updated" }, 200);
      assert.equal(updated.data.display_name, "Updated");
    });
    await t.test("POST Option", async () => {
      option = (await request(`${attributesPath}/${attribute.id}/options`, "POST", { value: "Added" }, 201)).data;
      assert.equal(option.value, "Added");
    });
    await t.test("PUT Option", async () => {
      const updated = await request(`${attributesPath}/${attribute.id}/options/${option.id}`, "PUT", { value: "Updated" }, 200);
      assert.equal(updated.data.value, "Updated");
    });
    await t.test("DELETE Option", async () => {
      await request(`${attributesPath}/${attribute.id}/options/${option.id}`, "DELETE", undefined, 200);
      const list = await request(attributesPath, "GET", undefined, 200);
      assert.ok(!list.data.find((item) => item.id === attribute.id).options.some((item) => item.id === option.id));
    });
    await t.test("DELETE Attribute", async () => {
      await request(`${attributesPath}/${attribute.id}`, "DELETE", undefined, 200);
      const list = await request(attributesPath, "GET", undefined, 200);
      assert.ok(!list.data.some((item) => item.id === attribute.id));
    });
  });
}

test("Admin/Staff active vẫn phải qua validator sau guard", async () => {
  for (const userId of [1, 2]) {
    for (const route of ["products", "brands", "categories", "variant-attributes", "variant-attributes/1/options"]) {
      const result = await api(`/api/admin/${route}`, { method: "POST", token: cookie(userId), body: {} });
      assert.equal(result.status, 400, route);
    }
  }
});

test("JWT cũ bị thu hồi quyền ngay khi DB khóa, đổi role hoặc xóa user", async () => {
  const actor = await User.create({ name: "Changing", email: "changing@example.test", role: "staff", status: 1 });
  const token = cookie(actor.id);
  assert.equal((await api("/api/admin/brands", { token })).status, 200);
  await actor.update({ status: 0 });
  assert.equal((await api("/api/admin/brands", { token })).status, 403);
  await actor.update({ status: 1, role: "customer" });
  assert.equal((await api("/api/admin/brands", { token })).status, 403);
  await actor.update({ role: "admin" });
  assert.equal((await api("/api/admin/brands", { token })).status, 200);
  await actor.destroy();
  assert.equal((await api("/api/admin/brands", { token })).status, 403);
});

test("Review vẫn admin-only và các API đọc công khai vẫn truy cập được", async () => {
  const product = await Product.create({
    name: "Review fixture", slug: "review-fixture", description: "Fixture", category_id: 1, brand_id: 1, status: 1,
  });
  const review = await Review.create({ product_id: product.id, user_id: 3, rating: 5, title: "Fixture", content: "Fixture" });
  for (const userId of [2, 3]) {
    assert.equal((await api(`/api/reviews/${review.id}/replies`, { method: "POST", token: cookie(userId), body: { content: "Reply" } })).status, 403);
    assert.equal((await api(`/api/reviews/${review.id}/status`, { method: "PUT", token: cookie(userId), body: { status: "approved" } })).status, 403);
  }
  assert.equal((await api(`/api/reviews/${review.id}/replies`, { method: "POST", token: cookie(1), body: { content: "Reply" } })).status, 201);
  assert.equal((await api(`/api/reviews/${review.id}/status`, { method: "PUT", token: cookie(1), body: { status: "approved" } })).status, 200);
  assert.equal((await api(`/api/reviews?productId=${product.id}`)).status, 200);
  assert.equal((await api("/api/products")).status, 200);
  assert.equal((await api("/api/categories")).status, 200);
});

test("Lỗi đọc quyền DB trả 500 an toàn và không đi tới upload", async () => {
  const files = await uploadSnapshot();
  const snapshot = await catalogSnapshot();
  const queryInterface = sequelize.getQueryInterface();
  // Chỉ thay đổi bảng trong schema test đã tạo ở before(), rồi phục hồi trong finally.
  await queryInterface.renameTable("users", "catalog_test_users_unavailable");
  try {
    const body = new FormData();
    body.set("name", "DB error");
    body.set("slug", "db-error");
    body.set("logo", new Blob(["catalog-test"], { type: "image/png" }), "test-logo.png");
    const result = await api("/api/admin/brands", { method: "POST", body, token: cookie(1) });
    assert.equal(result.status, 500);
    assert.deepEqual(result.payload, { success: false, message: "Hệ thống chưa xử lý được yêu cầu. Vui lòng thử lại." });
    assert.deepEqual(await uploadSnapshot(), files);
    assert.deepEqual(await catalogSnapshot(), snapshot);
  } finally {
    await queryInterface.renameTable("catalog_test_users_unavailable", "users");
  }
});

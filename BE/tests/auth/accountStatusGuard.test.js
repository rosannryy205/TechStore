const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const bcrypt = require("bcrypt");
const { Sequelize } = require("sequelize");
require("dotenv").config({ quiet: true });

// Chỉ dùng schema riêng do tiến trình kiểm thử tạo.
const database = `techstore_account_status_test_${process.pid}`;
process.env.DB_NAME = database;
process.env.JWT_SECRET = randomUUID();
process.env.LOGIN_RATE_LIMIT_MAX = "20";

const { sequelize, Brand, Cart, CartItem, Category, Order, Product, ProductVariant, Review, User } = require("../../src/models");

const PASSWORD = "AccountTest123!";
const SHIPPING_DETAILS = {
  receiver_name: "Test recipient",
  receiver_phone: "0901234567",
  address: "Test address",
  payment_method: "cod",
};
let connection;
let isDatabaseCreated = false;
let server;
let baseUrl;
let passwordHash;
let product;
let variant;

const request = (endpoint, { method = "GET", cookie, body } = {}) => fetch(`${baseUrl}${endpoint}`, {
  method,
  headers: {
    ...(cookie ? { Cookie: cookie } : {}),
    ...(body ? { "Content-Type": "application/json" } : {}),
  },
  body: body ? JSON.stringify(body) : undefined,
});

const createUser = (role = "customer", status = 1) => User.create({
  name: "Test account",
  email: `${randomUUID()}@example.test`,
  password: passwordHash,
  role,
  status,
});

const login = (email, password = PASSWORD) => request("/api/auth/login", {
  method: "POST",
  body: { email, password },
});

const addCartItem = (cookie) => request("/api/cart/items", {
  method: "POST",
  cookie,
  body: { productId: product.id, variantId: variant.id, quantity: 1 },
});

const placeOrder = (cookie) => request("/api/orders", {
  method: "POST",
  cookie,
  body: SHIPPING_DETAILS,
});

const updateProfile = (cookie) => request("/api/users/profile", {
  method: "PUT",
  cookie,
  body: { name: "Updated test account" },
});

const submitReview = (cookie) => request("/api/reviews", {
  method: "POST",
  cookie,
  body: { productId: product.id, rating: 5, content: "Test review" },
});

const loginAndGetCookie = async (user) => {
  const response = await login(user.email);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.data.user.role, user.role);
  const setCookie = response.headers.get("set-cookie");
  assert.match(setCookie, /^auth_token=[^;]+;/);
  return setCookie.split(";")[0];
};

const assertRevoked = async (response) => {
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { success: false, message: "Unauthorized" });
  const setCookie = response.headers.get("set-cookie");
  assert.match(setCookie, /^auth_token=;/);
  assert.match(setCookie, /; Path=\//i);
  assert.match(setCookie, /; HttpOnly/i);
  const expiration = /; Expires=([^;]+)/i.exec(setCookie)?.[1];
  assert.ok(Date.parse(expiration) < Date.now());
  if (process.env.NODE_ENV === "production") {
    assert.match(setCookie, /; SameSite=None/i);
    assert.match(setCookie, /; Secure/i);
  } else {
    assert.match(setCookie, /; SameSite=Lax/i);
    assert.doesNotMatch(setCookie, /; Secure/i);
  }
};

before(async () => {
  connection = new Sequelize("mysql", process.env.DB_USER || "root", process.env.DB_PASSWORD || "", {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  });
  assert.match(database, /^techstore_account_status_test_\d+$/);
  await connection.query(`CREATE DATABASE ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  isDatabaseCreated = true;
  sequelize.options.logging = false;
  await sequelize.sync();
  passwordHash = await bcrypt.hash(PASSWORD, 4);
  const brand = await Brand.create({ name: "Fixture brand", slug: "fixture-brand" });
  const category = await Category.create({ name: "Fixture category", slug: "fixture-category" });
  product = await Product.create({
    name: "Fixture product",
    slug: "fixture-product",
    description: "Fixture product for account status tests",
    brand_id: brand.id,
    category_id: category.id,
    status: 1,
  });
  variant = await ProductVariant.create({
    product_id: product.id,
    sku: "ACCOUNT-STATUS-FIXTURE",
    price: 50000,
    sale_price: 0,
    stock: 10,
    sold_count: 0,
    status: 1,
  });
  server = require("../../src/app").listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
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
          if (isDatabaseCreated) await connection.query(`DROP DATABASE ${database}`);
        } finally {
          await connection.close();
        }
      }
    }
  }
});

test("TC-01 rejects a locked account even with the correct password", async () => {
  const user = await createUser("customer", 0);
  const response = await login(user.email);

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { success: false, message: "Invalid credentials" });
  assert.equal(response.headers.get("set-cookie"), null);
});

test("TC-02 a missing account and a wrong password get the same generic response", async () => {
  const user = await createUser();
  const responses = [await login("missing@example.test"), await login(user.email, "WrongPassword123!")];
  for (const response of responses) {
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { success: false, message: "Invalid credentials" });
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

test("TC-03 a cookie issued before locking cannot read the user's session", async () => {
  const user = await createUser();
  const cookie = await loginAndGetCookie(user);
  await user.update({ status: 0 });

  await assertRevoked(await request("/api/auth/me", { cookie }));
});

test("TC-04 through TC-07 a locked account cannot write using its old cookie", async (context) => {
  const user = await createUser();
  const cookie = await loginAndGetCookie(user);
  assert.equal((await addCartItem(cookie)).status, 200);
  const cart = await Cart.findOne({ where: { user_id: user.id } });
  const item = await CartItem.findOne({ where: { cart_id: cart.id } });
  const { stock, sold_count: soldCount } = await variant.reload();
  await user.update({ status: 0 });

  await context.test("TC-04 leaves the cart quantity unchanged", async () => {
    await assertRevoked(await addCartItem(cookie));
    assert.equal((await item.reload()).quantity, 1);
  });
  await context.test("TC-05 creates no order and leaves stock and cart intact", async () => {
    await assertRevoked(await placeOrder(cookie));
    assert.equal(await Order.count({ where: { user_id: user.id } }), 0);
    await variant.reload();
    assert.equal(variant.stock, stock);
    assert.equal(variant.sold_count, soldCount);
    assert.equal((await item.reload()).quantity, 1);
  });
  await context.test("TC-06 leaves the profile unchanged", async () => {
    await assertRevoked(await updateProfile(cookie));
    assert.equal((await user.reload()).name, "Test account");
  });
  await context.test("TC-07 creates no review", async () => {
    await assertRevoked(await submitReview(cookie));
    const response = await request(`/api/reviews?productId=${product.id}`);
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).data, []);
  });
});

test("TC-08 a deleted account gets a revoked cookie on every protected route", async () => {
  const user = await createUser();
  const cookie = await loginAndGetCookie(user);
  await user.destroy();

  await assertRevoked(await request("/api/auth/me", { cookie }));
  for (const mutate of [addCartItem, placeOrder, updateProfile, submitReview]) {
    await assertRevoked(await mutate(cookie));
  }
  assert.equal(await Cart.count({ where: { user_id: user.id } }), 0);
  assert.equal(await Order.count({ where: { user_id: user.id } }), 0);
  assert.equal(await User.count({ where: { id: user.id } }), 0);
  assert.equal(await Review.count({ where: { user_id: user.id } }), 0);
});

test("TC-09 an active customer can read the session, update profile, use cart and order", async () => {
  const user = await createUser();
  const cookie = await loginAndGetCookie(user);
  assert.equal((await request("/api/auth/me", { cookie })).status, 200);
  const profile = await updateProfile(cookie);
  assert.equal(profile.status, 200);
  assert.equal((await profile.json()).data.user.name, "Updated test account");
  assert.equal((await addCartItem(cookie)).status, 200);
  assert.equal((await request("/api/cart", { cookie })).status, 200);
  const placedOrder = await placeOrder(cookie);
  assert.equal(placedOrder.status, 201);
  assert.equal((await placedOrder.json()).data.user_id, user.id);
  const orders = await request("/api/orders", { cookie });
  assert.equal(orders.status, 200);
  assert.equal((await orders.json()).data.length, 1);
  assert.equal((await request("/api/admin/orders", { cookie })).status, 403);
  assert.equal((await request("/api/admin/brands", { cookie })).status, 403);
});

test("TC-10 active admin and staff keep Catalog and Order access while review moderation stays admin-only", async () => {
  const customer = await createUser();
  const review = await Review.create({
    product_id: product.id,
    user_id: customer.id,
    rating: 5,
    title: "Fixture review",
    content: "Fixture review",
  });
  for (const role of ["admin", "staff"]) {
    const user = await createUser(role);
    const cookie = await loginAndGetCookie(user);
    assert.equal((await request("/api/admin/brands", { cookie })).status, 200);
    assert.equal((await request("/api/admin/orders", { cookie })).status, 200);
    const moderation = await request(`/api/reviews/${review.id}/status`, {
      method: "PUT",
      cookie,
      body: { status: "approved" },
    });
    assert.equal(moderation.status, role === "admin" ? 200 : 403);
  }
});

const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { after, before, describe, test } = require("node:test");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("sequelize");

require("dotenv").config({ quiet: true });

const database = `techstore_user_privacy_test_${process.pid}`;
process.env.DB_NAME = database;
process.env.DB_DIALECT = "mysql";
process.env.JWT_SECRET = randomUUID();

const { sequelize } = require("../src/config/db");
const User = require("../src/models/userModel");
const EmailVerificationCode = require("../src/models/emailVerificationCodeModel");

const ACTORS = [
  { id: 1, role: "customer", status: 1 },
  { id: 2, role: "staff", status: 1 },
  { id: 3, role: "admin", status: 0 },
  { id: 4, role: "admin", status: 1 },
];

const ACCOUNT_FIELDS = ["address", "avatar", "created_at", "email", "id", "name", "phone", "role"];
const SENSITIVE_USER_KEY = /password|code_?hash|token/i;

const assertNoSensitiveKeys = (value) => {
  if (value === null || typeof value !== "object") return;

  for (const [key, nestedValue] of Object.entries(value)) {
    assert.ok(!SENSITIVE_USER_KEY.test(key), "Response contains a sensitive account key");
    assertNoSensitiveKeys(nestedValue);
  }
};

const assertAccountFields = (user) => {
  assert.deepEqual(Object.keys(user).sort(), ACCOUNT_FIELDS);
};

const createSessionCookie = (userId) =>
  `auth_token=${jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "5m" })}`;

describe("User privacy HTTP", () => {
  let connection;
  let hasCreatedDatabase = false;
  let server;
  let baseUrl;

  const request = async (path, { cookie, method = "GET", body } = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: response.status, headers: response.headers, payload: await response.json() };
  };

  before(async () => {
    assert.match(database, /^techstore_user_privacy_test_\d+$/);
    connection = new Sequelize("mysql", process.env.DB_USER || "root", process.env.DB_PASSWORD || "", {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      dialect: "mysql",
      logging: false,
    });
    await connection.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    hasCreatedDatabase = true;
    await User.sync({ logging: false });
    await EmailVerificationCode.sync({ logging: false });
    sequelize.options.logging = false;
    await User.bulkCreate(ACTORS.map((actor) => ({
      ...actor,
      name: `Fixture ${actor.id}`,
      email: `actor${actor.id}@example.test`,
      phone: "0900000000",
    })));
    server = require("../src/app").listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    try {
      if (server?.listening) await new Promise((resolve) => server.close(resolve));
    } finally {
      try {
        await sequelize.close();
      } finally {
        if (connection) {
          try {
            if (hasCreatedDatabase) await connection.query(`DROP DATABASE \`${database}\``);
          } finally {
            await connection.close();
          }
        }
      }
    }
  });

  test("AC-01: khách, customer, staff và admin bị khóa không đọc được danh sách", async () => {
    for (const { cookie, status, message } of [
      { status: 401, message: "Unauthorized" },
      { cookie: createSessionCookie(1), status: 403, message: "Access denied. Admin only" },
      { cookie: createSessionCookie(2), status: 403, message: "Access denied. Admin only" },
      { cookie: createSessionCookie(3), status: 403, message: "Tài khoản đã bị khóa" },
    ]) {
      const result = await request("/api/users", { cookie });
      assert.equal(result.status, status);
      assert.deepEqual(result.payload, { success: false, message });
    }
  });

  test("Admin đang hoạt động vẫn đọc được danh sách người dùng", async () => {
    const result = await request("/api/users", { cookie: createSessionCookie(4) });
    assert.equal(result.status, 200);
    assert.equal(result.payload.success, true);
    assert.equal(result.payload.data.length, ACTORS.length);
    assert.ok(result.payload.data.some(({ email }) => email === "actor1@example.test"));
    assertNoSensitiveKeys(result.payload);
    result.payload.data.forEach(assertAccountFields);
  });

  test("AC-02 và AC-03: đăng ký bằng OTP, đăng nhập và cập nhật hồ sơ với payload an toàn", async () => {
    const email = "new-account@example.test";
    const password = randomUUID();
    const code = "123456";
    await EmailVerificationCode.create({
      email,
      code_hash: await bcrypt.hash(code, 4),
      expires_at: new Date(Date.now() + 60_000),
    });

    const registration = await request("/api/register", {
      method: "POST",
      body: { email, password, code },
    });
    assert.equal(registration.status, 201);
    assert.equal(registration.payload.success, true);
    assertNoSensitiveKeys(registration.payload);
    const registeredUser = registration.payload.data;
    assertAccountFields(registeredUser);
    assert.equal(registeredUser.email, email);
    assert.equal(registeredUser.role, "customer");
    assert.equal(registeredUser.phone, null);
    assert.equal(registeredUser.address, null);

    const login = await request("/api/auth/login", { method: "POST", body: { email, password } });
    assert.equal(login.status, 200);
    assert.equal(login.payload.success, true);
    assertNoSensitiveKeys(login.payload);
    const { created_at: registeredAt, ...registeredProfile } = registeredUser;
    const { created_at: savedAt, ...savedProfile } = login.payload.data.user;
    assert.deepEqual(savedProfile, registeredProfile);
    // MySQL DATETIME stores seconds, while the instance returned by create retains milliseconds.
    assert.equal(Math.floor(Date.parse(registeredAt) / 1000), Date.parse(savedAt) / 1000);
    assert.ok(Number.isFinite(Date.parse(savedAt)));
    const setCookie = login.headers.get("set-cookie") || "";
    assert.ok(setCookie.startsWith("auth_token="), "Login must issue an auth cookie");
    assert.ok(/; HttpOnly(?:;|$)/i.test(setCookie), "Auth cookie must be HTTP-only");
    const cookie = setCookie.split(";", 1)[0];

    const me = await request("/api/auth/me", { cookie });
    assert.equal(me.status, 200);
    assert.equal(me.payload.success, true);
    assertNoSensitiveKeys(me.payload);
    assert.deepEqual(me.payload.data.user, login.payload.data.user);

    const profileChanges = { name: "Updated fixture", phone: "0900000001", address: "Test address" };
    const profile = await request("/api/users/profile", {
      method: "PUT",
      cookie,
      body: { ...profileChanges, email: "ignored@example.test" },
    });
    assert.equal(profile.status, 200);
    assert.equal(profile.payload.success, true);
    assertNoSensitiveKeys(profile.payload);
    assert.deepEqual(profile.payload.data.user, { ...login.payload.data.user, ...profileChanges });

    const refreshedProfile = await request("/api/auth/me", { cookie });
    assert.equal(refreshedProfile.status, 200);
    assert.deepEqual(refreshedProfile.payload, profile.payload);
  });
});

test("User serializers project only allowed fields from plain objects and Sequelize models", () => {
  const { toPrivateUser, toPublicUser } = require("../src/utils/userSerializer");
  const fixture = {
    id: 42,
    name: "Fixture",
    email: "fixture@example.test",
    phone: null,
    address: null,
    avatar: null,
    role: "customer",
    created_at: new Date("2026-01-02T00:00:00Z"),
  };
  const instance = User.build({ ...fixture, status: 1, password: "fixture-hash" }, {
    isNewRecord: false,
    raw: true,
  });
  const publicUser = { id: 42, name: "Fixture", avatar: null, role: "customer" };

  for (const input of [
    instance,
    { ...fixture, password: "fixture-hash", code_hash: "otp-hash", session: { token: "fixture-token" } },
    { toJSON: () => ({ ...fixture, token: "fixture-token" }) },
  ]) {
    assert.deepEqual(toPrivateUser(input), fixture);
    assert.deepEqual(toPublicUser(input), publicUser);
  }

  assert.equal(toPrivateUser(null), null);
  assert.equal(toPublicUser(undefined), null);
});

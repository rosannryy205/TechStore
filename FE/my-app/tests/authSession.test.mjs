import assert from "node:assert/strict";
import { after, afterEach, beforeEach, test } from "node:test";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { createServer } from "vite";

const dom = new JSDOM('<div id="root"></div>', { url: "http://localhost/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const vite = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
const { AuthProvider, useAuth } = await vite.ssrLoadModule("/src/contexts/authContext.jsx");
const { cartService } = await vite.ssrLoadModule("/src/services/api/client/cartService.js");
const { reviewService } = await vite.ssrLoadModule("/src/services/api/client/reviewService.js");
const { default: CommentSection } = await vite.ssrLoadModule("/src/components/comments/commentSection.jsx");
const { useCart } = await vite.ssrLoadModule("/src/hooks/client/useCart.js");
const { useCheckout } = await vite.ssrLoadModule("/src/hooks/client/useCheckout.js");
const { default: OrderSuccess } = await vite.ssrLoadModule("/src/pages/client/orderSuccess.jsx");
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
const originalFetch = globalThis.fetch;
const requests = [];
let auth;

const respond = (request, payload, status = 200) => act(async () => {
  request.resolve(Response.json(payload, { status }));
});

function SessionProbe({ showReviews = false }) {
  auth = useAuth();
  return showReviews
    ? React.createElement(CommentSection, { productId: 12, user: auth.user, isAuthenticated: auth.isAuthenticated })
    : auth.user?.name ?? "Khách";
}

const mount = (props) => act(async () => {
  root.render(React.createElement(AuthProvider, null, React.createElement(SessionProbe, props)));
});

const mountRoutes = async (routes, initialEntry) => {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  await act(async () => {
    root.render(React.createElement(AuthProvider, null, React.createElement(RouterProvider, { router })));
  });
  return router;
};

beforeEach(() => {
  globalThis.fetch = (url, options) => new Promise((resolve) => requests.push({ url, options, resolve }));
});

afterEach(async () => {
  await act(async () => root.render(null));
  globalThis.fetch = originalFetch;
  requests.length = 0;
});

after(async () => {
  await act(async () => root.unmount());
  await vite.close();
  dom.window.close();
});

test("403 theo vai trò giữ phiên, 401 xóa phiên và phản hồi me cũ không khôi phục phiên", async () => {
  await mount();
  const user = { id: 1, name: "Tài khoản kiểm thử" };
  await respond(requests.at(-1), { data: { user } });
  assert.equal(auth.isAuthenticated, true);

  const forbidden = assert.rejects(cartService.getCart(), { status: 403 });
  await respond(requests.at(-1), { message: "Forbidden" }, 403);
  await forbidden;
  assert.equal(auth.isAuthenticated, true);

  await act(async () => { auth.refreshMe(); });
  const pendingProfile = requests.at(-1);
  const unauthorized = assert.rejects(cartService.getCart(), { status: 401 });
  await respond(requests.at(-1), { message: "Unauthorized" }, 401);
  await unauthorized;
  assert.equal(auth.isAuthenticated, false);
  assert.equal(auth.loading, false);

  await respond(pendingProfile, { data: { user } });
  assert.equal(auth.isAuthenticated, false);
  await act(async () => { auth.refreshMe(); });
  await respond(requests.at(-1), { data: { user } });
  assert.equal(auth.isAuthenticated, true);
});

test("403 ACCOUNT_LOCKED khi thích review đưa giao diện về trạng thái khách", async () => {
  await mount({ showReviews: true });
  const profile = requests.find(({ url }) => url.endsWith("/api/auth/me"));
  const reviews = requests.find(({ url }) => url.includes("/api/reviews?"));
  await respond(profile, { data: { user: { id: 1, role: "admin" } } });
  await respond(reviews, { data: [{ id: 7, rating: 5, content: "Review kiểm thử" }] });
  assert.ok(document.querySelector('[aria-label="Trả lời bình luận"]'));

  await act(async () => document.querySelector('[aria-label="Thích bình luận"]').click());
  const like = requests.at(-1);
  assert.ok(like.url.endsWith("/api/reviews/7/like"));
  assert.equal(like.options.credentials, "include");
  await respond(like, { code: "ACCOUNT_LOCKED", message: "Tài khoản bị khóa" }, 403);
  assert.equal(auth.isAuthenticated, false);
  assert.equal(document.querySelector('[aria-label="Trả lời bình luận"]'), null);
});

test("Review giữ dữ liệu multipart và cho phép thử tải lại khi API lỗi", async () => {
  const form = new FormData();
  form.set("content", "Review kiểm thử");
  form.append("media", new Blob(["fixture"], { type: "image/png" }), "review.png");
  const submission = reviewService.createReview(form);
  const reviewWrite = requests.at(-1);
  assert.ok(reviewWrite.url.endsWith("/api/reviews"));
  assert.equal(reviewWrite.options.credentials, "include");
  assert.equal(new Headers(reviewWrite.options.headers).get("content-type"), null);
  assert.equal(reviewWrite.options.body.get("media").name, "review.png");
  await respond(reviewWrite, { success: true }, 201);
  await submission;

  await mount({ showReviews: true });
  const profile = requests.find(({ url }) => url.endsWith("/api/auth/me"));
  await respond(profile, { message: "Unauthorized" }, 401);
  const reviewList = requests.find(({ url }) => url.includes("/api/reviews?"));
  await respond(reviewList, { message: "Unavailable" }, 503);
  const retry = Array.from(document.querySelectorAll("button")).find((button) => button.textContent === "Thử lại");
  assert.ok(retry);
  await act(async () => retry.click());
  await respond(requests.at(-1), { data: [{ id: 7, rating: 5, content: "Review đã tải lại" }] });
  assert.match(rootElement.textContent, /Review đã tải lại/);
});

test("sau khi mất phiên, giỏ không hiển thị lại khi phản hồi cũ đến", async () => {
  function CartPage() {
    const { cartItems } = useCart();
    return cartItems.map(({ name }) => name).join(", ") || "Giỏ rỗng";
  }

  await mountRoutes([{ path: "/cart", Component: CartPage }], "/cart");
  await respond(requests.at(-1), { data: { user: { id: 1 } } });
  const cartRead = requests.at(-1);
  assert.ok(cartRead.url.endsWith("/api/cart"));

  const denied = assert.rejects(cartService.getCart(), { status: 401 });
  await respond(requests.at(-1), { message: "Unauthorized" }, 401);
  await denied;
  await respond(cartRead, { data: { items: [{ variant_id: 2, product: { name: "Sản phẩm phiên cũ" } }] } });
  assert.equal(rootElement.textContent, "Giỏ rỗng");
});

test("đổi tài khoản trong cùng tab ẩn ngay giỏ của tài khoản trước", async () => {
  function CartPage() {
    auth = useAuth();
    const { cartItems } = useCart();
    return cartItems.map(({ name }) => name).join(", ") || "Giỏ rỗng";
  }

  await mountRoutes([{ path: "/cart", Component: CartPage }], "/cart");
  await respond(requests.at(-1), { data: { user: { id: 1 } } });
  await respond(requests.at(-1), {
    data: { items: [{ variant_id: 2, product: { name: "Sản phẩm tài khoản trước" } }] },
  });
  assert.equal(rootElement.textContent, "Sản phẩm tài khoản trước");

  await act(async () => { auth.refreshMe(); });
  await respond(requests.at(-1), { data: { user: { id: 2 } } });
  assert.equal(rootElement.textContent, "Giỏ rỗng");
  await respond(requests.at(-1), {
    data: { items: [{ variant_id: 3, product: { name: "Sản phẩm tài khoản mới" } }] },
  });
  assert.equal(rootElement.textContent, "Sản phẩm tài khoản mới");
});

test("checkout mất phiên quay về giỏ và bỏ qua phản hồi đặt hàng đến muộn", async () => {
  let checkout;
  function CheckoutPage() {
    checkout = useCheckout();
    return checkout.isInvalidCart ? null : "Thông tin Checkout";
  }

  const router = await mountRoutes(
    [
      { path: "/checkout", Component: CheckoutPage },
      { path: "/cart", element: "Giỏ khách" },
      { path: "/order-success", element: "Đã đặt hàng" },
    ],
    { pathname: "/checkout", state: { userId: 1, cartItems: [{ id: 7 }], cartTotal: 50000 } },
  );
  assert.equal(rootElement.textContent, "");
  await respond(requests.at(-1), { data: { user: { id: 1 } } });
  assert.equal(rootElement.textContent, "Thông tin Checkout");

  await act(async () => {
    checkout.updateField("firstName", "Test");
    checkout.updateField("lastName", "Account");
    checkout.updateField("phone", "0901234567");
    checkout.updateField("street", "Test street");
    checkout.updateField("city", "Test city");
  });
  await act(async () => { checkout.handleSubmit({ preventDefault() {} }); });
  const pendingOrder = requests.at(-1);
  assert.ok(pendingOrder.url.endsWith("/api/orders"));

  const denied = assert.rejects(cartService.getCart(), { status: 403 });
  await respond(requests.at(-1), { code: "ACCOUNT_LOCKED" }, 403);
  await denied;
  await respond(pendingOrder, { data: { id: 7, user_id: 1 } }, 201);
  assert.equal(router.state.location.pathname, "/cart");
  assert.equal(rootElement.textContent, "Giỏ khách");
});

test("trang xác nhận đơn chỉ hiển thị cho chủ phiên đang đăng nhập", async () => {
  const router = await mountRoutes(
    [{ path: "/order-success", Component: OrderSuccess }, { path: "/", element: "Trang chủ" }],
    { pathname: "/order-success", state: { order: { id: 7, user_id: 1, receiver_name: "Người nhận" } } },
  );
  assert.equal(rootElement.textContent, "");
  await respond(requests.at(-1), { data: { user: { id: 1 } } });
  assert.match(rootElement.textContent, /Người nhận/);

  const denied = assert.rejects(cartService.getCart(), { status: 401 });
  await respond(requests.at(-1), { message: "Unauthorized" }, 401);
  await denied;
  assert.equal(router.state.location.pathname, "/");

  await act(async () => router.navigate("/order-success", {
    state: { order: { id: 7, user_id: 1, receiver_name: "Người nhận" } },
  }));
  assert.equal(rootElement.textContent, "Trang chủ");
});

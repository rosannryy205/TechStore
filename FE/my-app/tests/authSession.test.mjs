import assert from "node:assert/strict";
import { after, afterEach, beforeEach, test } from "node:test";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router-dom";
import { createServer } from "vite";

const dom = new JSDOM('<div id="root"></div>', { url: "http://localhost/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const vite = await createServer({ server: { middlewareMode: true, ws: false }, appType: "custom" });
const { AuthProvider, useAuth } = await vite.ssrLoadModule("/src/contexts/authContext.jsx");
const { cartService } = await vite.ssrLoadModule("/src/services/api/client/cartService.js");
const { useCart } = await vite.ssrLoadModule("/src/hooks/client/useCart.js");
const { useCheckout } = await vite.ssrLoadModule("/src/hooks/client/useCheckout.js");
const { default: CommentSection } = await vite.ssrLoadModule("/src/components/comments/commentSection.jsx");
const { default: OrderSuccess } = await vite.ssrLoadModule("/src/pages/client/orderSuccess.jsx");
const root = createRoot(document.getElementById("root"));
const originalFetch = globalThis.fetch;
const requests = [];
let auth;

function SessionProbe() {
  auth = useAuth();
  const { cartItems } = useCart();
  return React.createElement(
    "p",
    null,
    auth.user?.name ?? "Khách",
    ...cartItems.map((item) => ` ${item.name}`),
  );
}

const respond = (request, body, status = 200) => act(async () => {
  request.resolve(Response.json(body, { status }));
});

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

test("a protected 401 clears the session even if older profile and cart responses arrive later", async () => {
  await act(async () => root.render(React.createElement(
    MemoryRouter,
    null,
    React.createElement(AuthProvider, null, React.createElement(SessionProbe)),
  )));
  const user = { id: 1, name: "Test account" };
  await respond(requests[0], { data: { user } });
  assert.equal(rootElementText(), "Test account");
  const pendingCart = requests.at(-1);
  assert.ok(pendingCart.url.endsWith("/api/cart"));

  const forbidden = assert.rejects(cartService.getCart(), { status: 403 });
  await respond(requests.at(-1), { message: "Forbidden" }, 403);
  await forbidden;
  assert.equal(auth.isAuthenticated, true);

  await act(async () => { auth.refreshMe(); });
  const pendingProfile = requests.at(-1);
  const rejected = assert.rejects(cartService.getCart(), { status: 401, message: "Unauthorized" });
  await respond(requests.at(-1), { message: "Unauthorized" }, 401);
  await rejected;
  assert.equal(auth.isAuthenticated, false);
  assert.equal(auth.loading, false);
  assert.equal(rootElementText(), "Khách");

  await respond(pendingProfile, { data: { user } });
  assert.equal(pendingCart.options.signal.aborted, true);
  await respond(pendingCart, { data: { items: [{ variant_id: 2, product: { name: "Old cart item" } }] } });
  assert.equal(rootElementText(), "Khách");

  await act(async () => { auth.refreshMe(); });
  await respond(requests.at(-1), { data: { user } });
  assert.equal(rootElementText(), "Test account");
});

function rootElementText() {
  return document.getElementById("root").textContent;
}

test("a review write rejected with 401 leaves the review page in guest mode", async () => {
  function ReviewPage() {
    const { user, isAuthenticated } = useAuth();
    return React.createElement(CommentSection, { productId: 12, user, isAuthenticated });
  }

  await act(async () => root.render(React.createElement(AuthProvider, null, React.createElement(ReviewPage))));
  const profile = requests.find(({ url }) => url.endsWith("/api/auth/me"));
  const reviews = requests.find(({ url }) => url.includes("/api/reviews?"));
  await respond(profile, { data: { user: { id: 1, role: "admin" } } });
  await respond(reviews, { data: [{ id: 7, rating: 5, content: "Fixture review" }] });
  assert.ok(document.querySelector('[aria-label="Trả lời bình luận"]'));

  await act(async () => document.querySelector('[aria-label="Thích bình luận"]').click());
  const like = requests.at(-1);
  assert.ok(like.url.endsWith("/api/reviews/7/like"));
  assert.equal(like.options.credentials, "include");
  await respond(like, { message: "Unauthorized" }, 401);
  assert.equal(document.querySelector('[aria-label="Trả lời bình luận"]'), null);
  await act(() => new Promise((resolve) => setTimeout(resolve, 300)));
});

test("checkout hides the cart and ignores a pending order response after revocation", async () => {
  let checkout;
  function CheckoutProbe() {
    checkout = useCheckout();
    return checkout.isInvalidCart ? null : "Checkout cart";
  }

  const router = createMemoryRouter(
    [
      { path: "/checkout", Component: CheckoutProbe },
      { path: "/cart", element: "Guest bag" },
      { path: "/order-success", Component: OrderSuccess },
    ],
    {
      initialEntries: [{ pathname: "/checkout", state: { cartItems: [{ id: 7 }], cartTotal: 50000 } }],
    },
  );
  await act(async () => root.render(React.createElement(
    AuthProvider,
    null,
    React.createElement(RouterProvider, { router }),
  )));
  assert.equal(rootElementText(), "");
  await respond(requests.at(-1), { data: { user: { id: 1 } } });
  assert.equal(rootElementText(), "Checkout cart");

  await act(async () => {
    checkout.updateField("firstName", "Test");
    checkout.updateField("lastName", "Account");
    checkout.updateField("phone", "0901234567");
    checkout.updateField("street", "Test street");
    checkout.updateField("city", "Test city");
  });
  let submission;
  await act(async () => { submission = checkout.handleSubmit({ preventDefault() {} }); });
  const pendingOrder = requests.at(-1);
  assert.ok(pendingOrder.url.endsWith("/api/orders"));
  assert.equal(pendingOrder.options.method, "POST");

  const rejected = assert.rejects(cartService.getCart(), { status: 401 });
  await respond(requests.at(-1), { message: "Unauthorized" }, 401);
  await rejected;
  assert.equal(router.state.location.pathname, "/cart");
  assert.equal(rootElementText(), "Guest bag");
  assert.equal(pendingOrder.options.signal.aborted, true);

  await respond(pendingOrder, { data: { id: 7, user_id: 1 } }, 201);
  await submission;
  assert.equal(router.state.location.pathname, "/cart");
});

test("order details from browser navigation state disappear when the owner loses their session", async () => {
  const router = createMemoryRouter(
    [
      { path: "/", element: "Home" },
      { path: "/order-success", Component: OrderSuccess },
    ],
    {
      initialEntries: [{
        pathname: "/order-success",
        state: { order: { id: 7, user_id: 1, receiver_name: "Test receiver" } },
      }],
    },
  );
  await act(async () => root.render(React.createElement(
    AuthProvider,
    null,
    React.createElement(RouterProvider, { router }),
  )));
  assert.equal(rootElementText(), "");
  await respond(requests.at(-1), { data: { user: { id: 1 } } });
  assert.match(rootElementText(), /Test receiver/);

  const rejected = assert.rejects(cartService.getCart(), { status: 401 });
  await respond(requests.at(-1), { message: "Unauthorized" }, 401);
  await rejected;
  assert.equal(router.state.location.pathname, "/");
  assert.equal(rootElementText(), "Home");

  await act(async () => router.navigate("/order-success", {
    state: { order: { id: 7, receiver_name: "Test receiver" } },
  }));
  assert.equal(router.state.location.pathname, "/");
  assert.equal(rootElementText(), "Home");
});

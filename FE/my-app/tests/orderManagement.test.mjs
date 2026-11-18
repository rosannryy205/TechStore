import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";
import { JSDOM } from "jsdom";
import { createServer } from "vite";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

const dom = new JSDOM("<div id='root'></div>", { url: "http://localhost/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
const { useAdminOrders } = await vite.ssrLoadModule("/src/hooks/admin/useAdminOrders.js");
const { useUserProfile } = await vite.ssrLoadModule("/src/hooks/client/useUserProfile.js");
const { AuthProvider } = await vite.ssrLoadModule("/src/contexts/authContext.jsx");
const { default: ProfileOrderCard } = await vite.ssrLoadModule("/src/components/client/userProfile/ProfileOrderCard.jsx");
const { default: OrderTrackingDrawer } = await vite.ssrLoadModule("/src/components/client/userProfile/OrderTrackingDrawer.jsx");
const root = createRoot(document.getElementById("root"));
const originalFetch = globalThis.fetch;
const requests = [];
let state, router;
globalThis.fetch = (url, options) => new Promise((resolve) => requests.push({ url, options, resolve }));
function Harness() { state = useAdminOrders(); return null; }
const wait = () => act(() => new Promise((resolve) => setTimeout(resolve, 230)));
const respond = (request, data, status = 200) => act(async () => { request.resolve(new Response(JSON.stringify(data), { status })); });
const listing = (data, extras = {}) => ({ success: true, data, total: data.length, page: 1, totalPages: 1, countsByStatus: { all: data.length }, ...extras });
const order = (id, status = "pending") => ({ id, order_code: `TS-${id}`, items: [], order_status: status, payment_method: "cod", payment_status: "pending", next_status: status === "pending" ? "confirmed" : "processing", can_cancel: true });
async function mount(data = [order(1), order(2)]) {
  router = createMemoryRouter([{ path: "/admin/orders", element: React.createElement(Harness) }], { initialEntries: ["/admin/orders?status=pending"] });
  await act(async () => root.render(React.createElement(RouterProvider, { router })));
  await wait();
  await respond(requests.at(-1), listing(data, { totalPages: 2, total: 10 }));
}
afterEach(async () => { await act(async () => root.render(null)); requests.length = 0; });
after(async () => { await act(async () => root.unmount()); globalThis.fetch = originalFetch; await vite.close(); dom.window.close(); });

test("đổi trang/filter/Back bỏ chọn, API lỗi giữ tiêu chí và có thể thử lại", async () => {
  await mount();
  await act(async () => state.handleSelectAll(true));
  assert.deepEqual(state.selectedOrderIds, [1, 2]);
  await act(async () => state.handlePageChange(2));
  assert.deepEqual(state.selectedOrderIds, []);
  await wait();
  assert.equal(new URL(requests.at(-1).url).searchParams.get("page"), "2");
  await respond(requests.at(-1), listing([order(3)], { page: 2, totalPages: 2 }));
  await act(async () => state.handleSelectAll(true));
  await act(async () => state.handleSearchChange("Nguyen"));
  assert.deepEqual(state.selectedOrderIds, []);
  await wait();
  await respond(requests.at(-1), { message: "Thử lại sau" }, 503);
  assert.equal(state.error, "Thử lại sau");
  assert.equal(state.searchTerm, "Nguyen");
  await act(async () => state.refreshOrders());
  await wait();
  assert.equal(new URL(requests.at(-1).url).searchParams.get("search"), "Nguyen");
  await respond(requests.at(-1), listing([order(4)]));
  await act(async () => state.handleSelectAll(true));
  await act(async () => router.navigate("/admin/orders?status=confirmed"));
  assert.deepEqual(state.selectedOrderIds, []);
});

test("phản hồi query cũ dù trả sau cũng không ghi đè query mới", async () => {
  await mount();
  await act(async () => state.handleSearchChange("cu"));
  await wait();
  const old = requests.at(-1);
  await act(async () => state.handleSearchChange("moi"));
  await wait();
  const current = requests.at(-1);
  assert.equal(old.options.signal.aborted, true);
  await respond(current, listing([order(20)]));
  await respond(old, listing([order(10)]));
  assert.deepEqual(state.orders.map((row) => row.id), [20]);
});

test("sau duyệt đơn rời filter, drawer vẫn giữ mở và tải chi tiết độc lập", async () => {
  await mount([order(7)]);
  await act(async () => state.handleOpenDetail(state.orders[0]));
  await respond(requests.at(-1), { success: true, data: order(7) });
  let mutation;
  await act(async () => { mutation = state.handleUpdateStatus(7, "confirmed"); });
  const command = requests.at(-1);
  assert.equal(JSON.parse(command.options.body).expected_status, "pending");
  await act(async () => {
    command.resolve(new Response(JSON.stringify({ success: true, data: { id: 7, order_status: "confirmed" } }), { status: 200 }));
    await mutation;
  });
  const detail = requests.at(-1);
  assert.ok(detail.url.endsWith("/7"));
  await respond(detail, { success: true, data: order(7, "confirmed") });
  await wait();
  await respond(requests.at(-1), listing([]));
  assert.deepEqual(state.orders, []);
  assert.equal(state.isDrawerOpen, true);
  assert.equal(state.selectedOrder.order_status, "confirmed");
});

test("bulk hiển thị kết quả từng đơn, chặn gửi lặp khi đang xử lý", async () => {
  await mount();
  await act(async () => state.handleSelectAll(true));
  let operation;
  await act(async () => { operation = state.handleBulkAdvance("confirmed"); });
  const command = requests.at(-1);
  const count = requests.length;
  await act(async () => state.handleBulkAdvance("confirmed"));
  assert.equal(requests.length, count);
  await act(async () => {
    command.resolve(new Response(JSON.stringify({ success: true, data: { updatedCount: 1, failedCount: 1, results: [{ id: 1, success: true }, { id: 2, success: false, message: "Đơn đã thay đổi" }] } }), { status: 200 }));
    await operation;
  });
  assert.equal(state.bulkResult.failedCount, 1);
  assert.equal(state.bulkResult.results[1].message, "Đơn đã thay đổi");
  assert.deepEqual(state.selectedOrderIds, []);
});

test("khách hủy bị 409 được tải lại trạng thái mới, vẫn giữ lý do từ chối", async () => {
  let profile;
  function ProfileHarness() { profile = useUserProfile(); return null; }
  router = createMemoryRouter([{ path: "/profile", element: React.createElement(ProfileHarness) }], { initialEntries: ["/profile"] });
  await act(async () => root.render(React.createElement(AuthProvider, null, React.createElement(RouterProvider, { router }))));
  await respond(requests.at(-1), { data: { user: { id: 3, name: "Khách" } } });
  await respond(requests.at(-1), { data: [order(1)] });
  await act(async () => profile.handleCancelOrder(1));
  let operation;
  await act(async () => { operation = profile.executeCancelOrder(); });
  const command = requests.at(-1);
  assert.ok(command.url.endsWith("/1/cancel"));
  await respond(command, { message: "Đơn đã được xác nhận", code: "CANCELLATION_REJECTED" }, 409);
  const refresh = requests.at(-1);
  assert.ok(refresh.url.endsWith("/my-orders"));
  await act(async () => {
    refresh.resolve(new Response(JSON.stringify({ data: [order(1, "confirmed")] }), { status: 200 }));
    await operation;
  });
  assert.equal(profile.orders[0].order_status, "confirmed");
  assert.equal(profile.ordersError, "Đơn đã được xác nhận");
});

test("component khách không suy đoán dữ liệu legacy thành COD hoặc chờ thanh toán", () => {
  const legacy = { id: 99, items: [], order_status: null, payment_method: null, payment_status: null, created_at: "2026-01-01" };
  const card = renderToStaticMarkup(React.createElement(ProfileOrderCard, { order: legacy }));
  const drawer = renderToStaticMarkup(React.createElement(OrderTrackingDrawer, { order: legacy, isOpen: true }));
  assert.ok(card.includes("Cần kiểm tra"));
  assert.ok(drawer.includes("Cần kiểm tra"));
  assert.ok(!drawer.includes("COD"));
  assert.ok(!drawer.includes("Chờ xử lý"));
  assert.ok(!card.includes("Hủy đơn hàng"));
});

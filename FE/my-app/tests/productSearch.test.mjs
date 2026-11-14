import assert from "node:assert/strict";
import { after, test } from "node:test";
import { JSDOM } from "jsdom";
import { createServer } from "vite";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

const dom = new JSDOM("<div id='root'></div>", { url: "http://localhost/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
const { useProductSearch } = await vite.ssrLoadModule(
  "/src/hooks/client/useProductSearch.js",
);
const { useProducts } = await vite.ssrLoadModule(
  "/src/hooks/client/useProducts.js",
);
const root = createRoot(document.getElementById("root"));
const originalFetch = globalThis.fetch;
let result;
const requests = [];

// Mock tại biên HTTP: response có thể về sai thứ tự dù trình duyệt đã hủy request.
globalThis.fetch = (url, options) =>
  new Promise((resolve) => requests.push({ url, options, resolve }));
function Harness(props) {
  result = useProductSearch(props);
  return null;
}
const render = (props) =>
  act(() => root.render(React.createElement(Harness, props)));
const pause = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 330)));
const respond = (request, data) =>
  act(async () =>
    request.resolve(new Response(JSON.stringify(data), { status: 200 })),
  );

after(async () => {
  await act(() => root.unmount());
  globalThis.fetch = originalFetch;
  await vite.close();
  dom.window.close();
});

test("gõ nhanh chỉ tìm query mới nhất và phản hồi cũ không ghi đè Product mới", async () => {
  await render({ open: true, query: "iph", composing: false });
  await render({ open: true, query: "iphone", composing: false });
  await pause();
  assert.equal(requests.length, 1);
  assert.equal(new URL(requests[0].url).searchParams.get("q"), "iphone");
  await render({ open: true, query: "iphone 16", composing: false });
  assert.equal(result.items.length, 0, "không giữ Product của query cũ");
  await pause();
  assert.equal(requests[0].options.signal.aborted, true);
  await respond(requests[1], {
    data: [{ id: 16, name: "iPhone 16" }],
    total: 1,
    page: 1,
    totalPages: 1,
  });
  await respond(requests[0], {
    data: [{ id: 1, name: "iPhone cũ" }],
    total: 1,
    page: 1,
    totalPages: 1,
  });
  assert.deepEqual(
    result.items.map((item) => item.id),
    [16],
  );
});

test("query chứa ký tự cấm và IME đang soạn không gọi API, hoàn tất dấu mới tìm", async () => {
  const initialCount = requests.length;
  await render({ open: true, query: "iphone%", composing: false });
  await pause();
  assert.equal(requests.length, initialCount);
  assert.equal(result.allowed, false);
  assert.deepEqual(result.items, []);
  await render({ open: true, query: "điện", composing: true });
  await pause();
  assert.equal(requests.length, initialCount);
  await render({
    open: true,
    query: "điện thoại".normalize("NFD"),
    composing: false,
  });
  await pause();
  assert.equal(requests.length, initialCount + 1);
  assert.equal(
    new URL(requests.at(-1).url).searchParams.get("q"),
    "điện thoại",
  );
  await respond(requests.at(-1), {
    data: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
});

test("tải thêm giữ Product duy nhất và không nối trang của query cũ vào query mới", async () => {
  await render({ open: true, query: "ipad", composing: false });
  await pause();
  await respond(requests.at(-1), {
    data: [{ id: 1, name: "iPad 1" }],
    total: 3,
    page: 1,
    totalPages: 3,
  });
  await act(() => result.loadMore());
  const pageTwo = requests.at(-1);
  assert.equal(new URL(pageTwo.url).searchParams.get("page"), "2");
  await respond(pageTwo, {
    data: [
      { id: 1, name: "iPad 1" },
      { id: 2, name: "iPad 2" },
    ],
    total: 3,
    page: 2,
    totalPages: 3,
  });
  assert.deepEqual(
    result.items.map((item) => item.id),
    [1, 2],
  );
  await act(() => result.loadMore());
  const stalePage = requests.at(-1);
  await render({ open: true, query: "macbook", composing: false });
  await pause();
  await respond(requests.at(-1), {
    data: [{ id: 10, name: "MacBook" }],
    total: 1,
    page: 1,
    totalPages: 1,
  });
  await respond(stalePage, {
    data: [{ id: 3, name: "iPad 3" }],
    total: 3,
    page: 3,
    totalPages: 3,
  });
  assert.deepEqual(
    result.items.map((item) => item.id),
    [10],
  );
  await render({ open: false, query: "macbook", composing: false });
  assert.deepEqual(result.items, []);
});

test("trang kết quả dùng metadata BE, giữ/xóa tiêu chí độc lập và khôi phục bằng Back", async () => {
  let products;
  function ProductsHarness() {
    products = useProducts();
    return null;
  }
  const router = createMemoryRouter(
    [{ path: "/products", element: React.createElement(ProductsHarness) }],
    { initialEntries: ["/products?q=iphone&price=under-10m&page=2"] },
  );
  const start = requests.length;
  await act(() => root.render(React.createElement(RouterProvider, { router })));
  const categoriesRequest = requests
    .slice(start)
    .find((request) => request.url.includes("/categories"));
  await respond(categoriesRequest, {
    data: [
      {
        id: 1,
        slug: "active",
        status: 1,
        category_brands: [
          { brand: { slug: "active", status: 1 } },
          { brand: { slug: "hidden", status: 0 } },
        ],
      },
      { id: 2, slug: "hidden", status: 0 },
    ],
  });
  const pageRequest = requests
    .slice(start)
    .find((request) => request.url.includes("/products"));
  assert.equal(new URL(pageRequest.url).searchParams.get("page"), "2");
  await respond(pageRequest, {
    data: [{ id: 2, name: "iPhone 2", minPrice: 2000000 }],
    total: 13,
    page: 2,
    totalPages: 2,
  });
  assert.equal(products.totalCount, 13);
  assert.equal(products.pageItems.length, 1);
  assert.equal(products.page, 2);
  assert.equal(products.categories.length, 1);
  assert.equal(products.categories[0].category_brands.length, 1);
  await act(() => products.setFilter("sort", "price_asc"));
  assert.equal(
    router.state.location.search,
    "?q=iphone&price=under-10m&sort=price_asc",
  );
  await act(() => products.resetFilters());
  assert.equal(router.state.location.search, "?q=iphone");
  await act(() => products.clearQuery());
  assert.equal(router.state.location.search, "");
  await act(() => router.navigate(-1));
  assert.equal(products.activeQuery, "iphone");
  assert.equal(router.state.location.search, "?q=iphone");
  await act(() => root.render(null));
  router.dispose();
});

test("Back sau lỗi mạng vẫn khôi phục kết quả, không kẹt loading vì cache trang trước", async () => {
  let products;
  function ProductsHarness() {
    products = useProducts();
    return null;
  }
  const router = createMemoryRouter(
    [{ path: "/products", element: React.createElement(ProductsHarness) }],
    { initialEntries: ["/products?q=iphone"] },
  );
  await act(() => root.render(React.createElement(RouterProvider, { router })));
  await respond(requests.at(-1), {
    data: [{ id: 1, name: "iPhone" }],
    total: 1,
    page: 1,
    totalPages: 1,
  });
  assert.equal(products.loading, false);
  await act(() => products.setFilter("q", "macbook"));
  await act(async () =>
    requests
      .at(-1)
      .resolve(
        new Response(JSON.stringify({ message: "Lỗi thử nghiệm" }), {
          status: 500,
        }),
      ),
  );
  assert.equal(products.error, "Lỗi thử nghiệm");
  const beforeBack = requests.length;
  await act(() => router.navigate(-1));
  assert.equal(requests.length, beforeBack + 1);
  await respond(requests.at(-1), {
    data: [{ id: 1, name: "iPhone" }],
    total: 1,
    page: 1,
    totalPages: 1,
  });
  assert.equal(products.loading, false);
  assert.deepEqual(
    products.pageItems.map((item) => item.id),
    [1],
  );
  await act(() => root.render(null));
  router.dispose();
});

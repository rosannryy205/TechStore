import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "vite";

const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
after(() => server.close());

const { resolveProductImageUrl } = await server.ssrLoadModule(
  "/src/utils/imageHelper.js",
);
const { API_BASE_URL } = await server.ssrLoadModule("/src/constants/api.js");

for (const [name, input, expected] of [
  ["frontend image in development", "/src/assets/iphone18ProMax.webp", "/src/assets/iphone18ProMax.webp"],
  ["frontend image after build", "/assets/iphone18ProMax-hash.webp", "/assets/iphone18ProMax-hash.webp"],
  ["backend upload", "uploads/products/phone.png", `${API_BASE_URL}/uploads/products/phone.png`],
  ["backend upload with leading slash", "/uploads/products/phone.png", `${API_BASE_URL}/uploads/products/phone.png`],
  ["backend filename", "phone.png", `${API_BASE_URL}/uploads/products/phone.png`],
  ["external image", "https://example.com/phone.png", "https://example.com/phone.png"],
  ["inline image", "data:image/png;base64,AA==", "data:image/png;base64,AA=="],
  ["missing image", null, "/fallback.png"],
  ["invalid image", {}, "/fallback.png"],
]) {
  test(name, () => {
    assert.equal(resolveProductImageUrl(input, "/fallback.png"), expected);
  });
}

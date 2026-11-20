import { httpRequest } from "@/services/api/httpClient";

export const cartService = {
  getCart: async ({ signal } = {}) => {
    const res = await httpRequest("/api/cart", { signal });
    return res?.data?.items ?? [];
  },

  addToCart: async ({ productId, variantId, quantity = 1 }) => {
    return await httpRequest("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, variantId, quantity }),
    });
  },

  updateQuantity: async (variantId, quantity, { signal } = {}) => {
    return await httpRequest(`/api/cart/items/${variantId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
      signal,
    });
  },

  removeFromCart: async (variantId, { signal } = {}) => {
    return await httpRequest(`/api/cart/items/${variantId}`, {
      method: "DELETE",
      signal,
    });
  },
};

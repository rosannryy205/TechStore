import { httpRequest } from "@/services/api/httpClient";

export const cartService = {
  getCart: async () => {
    const res = await httpRequest("/api/cart");
    return res?.data?.items ?? [];
  },

  addToCart: async ({ productId, variantId, quantity = 1 }) => {
    return await httpRequest("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, variantId, quantity }),
    });
  },

  updateQuantity: async (variantId, quantity) => {
    return await httpRequest(`/api/cart/items/${variantId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart: async (variantId) => {
    return await httpRequest(`/api/cart/items/${variantId}`, {
      method: "DELETE",
    });
  },
};

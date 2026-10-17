import { httpRequest } from "@/services/api/httpClient";

export const orderService = {
  createOrder: async (orderData) => {
    return await httpRequest("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  getUserOrders: async () => {
    const res = await httpRequest("/api/orders");
    return res?.data ?? [];
  },

  cancelOrder: async (orderId) => {
    return await httpRequest(`/api/orders/${orderId}/cancel`, {
      method: "PUT",
    });
  },
};

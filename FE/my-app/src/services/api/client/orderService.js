import { httpRequest } from "@/services/api/httpClient";

export const orderService = {
  createOrder: async (orderData) => {
    return await httpRequest("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  getUserOrders: async () => {
    const res = await httpRequest("/api/orders/my-orders");
    return res?.data ?? [];
  },

  cancelOrder: async (orderId, requestId) => {
    return await httpRequest(`/api/orders/${orderId}/cancel`, {
      method: "PUT",
      body: JSON.stringify({ expected_status: "pending", request_id: requestId }),
    });
  },
};

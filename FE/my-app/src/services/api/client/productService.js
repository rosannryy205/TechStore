import { httpRequest } from "@/services/api/httpClient";

export const productService = {
  getNewArrivals: async () => {
    const res = await httpRequest("/api/products/newarrival");
    return res?.data ?? [];
  },

  getFeaturedProducts: async () => {
    const res = await httpRequest("/api/products/features");
    return res?.data ?? [];
  },

  getPopularProducts: async () => {
    const res = await httpRequest("/api/products/popular");
    return res?.data ?? [];
  },

  // Giữ metadata của BE; signal cho phép hủy tìm kiếm khi khách đổi query/đóng hộp.
  getProducts: async (criteria = {}, { signal } = {}) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(criteria)) {
      if (value !== "" && value !== undefined && value !== null)
        query.set(key, String(value));
    }
    const queryString = query.toString();
    const endpoint = queryString
      ? `/api/products/?${queryString}`
      : "/api/products/";
    return httpRequest(endpoint, { signal });
  },

  getProductDetail: async (id) => {
    const res = await httpRequest(`/api/products/${id}`);
    return res?.data ?? null;
  },

  getRelatedProducts: async (id) => {
    const res = await httpRequest(`/api/products/${id}/related`);
    return res?.data ?? [];
  },
};

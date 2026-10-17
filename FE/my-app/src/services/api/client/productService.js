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

  getProducts: async ({ category, brand }) => {
    const query = new URLSearchParams();
    if (category) query.set("category", category);
    if (brand) query.set("brand", brand);
    const queryString = query.toString();
    const endpoint = queryString ? `/api/products/?${queryString}` : "/api/products/";
    const res = await httpRequest(endpoint);
    return res?.data ?? [];
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

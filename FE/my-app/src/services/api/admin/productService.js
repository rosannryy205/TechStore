import { httpRequest } from "@/services/api/httpClient";

export const adminProductService = {
  getProducts: async () => {
    const res = await httpRequest("/api/admin/products");
    return res?.data ?? [];
  },

  getVariantAttributes: async () => {
    const res = await httpRequest("/api/admin/variant-attributes");
    return res?.data ?? [];
  },

  createProduct: async (productData) => {
    const isFormData = productData instanceof FormData;
    return await httpRequest("/api/admin/products", {
      method: "POST",
      body: isFormData ? productData : JSON.stringify(productData),
    });
  },
};

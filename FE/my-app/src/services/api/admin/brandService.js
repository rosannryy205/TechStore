import { httpRequest } from "@/services/api/httpClient";

export const brandService = {
  getBrands: async () => {
    const res = await httpRequest("/api/admin/brands");
    return res?.data ?? [];
  },

  createBrand: async (formData) => {
    return await httpRequest("/api/admin/brands", {
      method: "POST",
      body: formData,
    });
  },
};

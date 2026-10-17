import { httpRequest } from "@/services/api/httpClient";

export const categoryService = {
  getCategories: async () => {
    const res = await httpRequest("/api/categories");
    return res?.data ?? [];
  },

  createCategory: async (categoryData) => {
    return await httpRequest("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  },
};

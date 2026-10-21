import { httpRequest } from "@/services/api/httpClient";

export const categoryService = {
  getCategories: async () => {
    const res = await httpRequest("/api/categories");
    return res?.data ?? [];
  },
};

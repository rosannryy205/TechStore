import { httpRequest } from "@/services/api/httpClient";

export const attributeService = {
  getAttributes: async () => {
    try {
      const res = await httpRequest("/api/admin/variant-attributes");
      return res?.data ?? [];
    } catch {
      return [
        { id: 1, name: "Màu sắc", values: "Đỏ, Đen, Trắng, Xanh", status: 1 },
        { id: 2, name: "Dung lượng", values: "128GB, 256GB, 512GB", status: 1 },
        { id: 3, name: "RAM", values: "8GB, 16GB", status: 1 },
      ];
    }
  },

  createAttribute: async (attributeData) => {
    try {
      return await httpRequest("/api/admin/variant-attributes", {
        method: "POST",
        body: JSON.stringify(attributeData),
      });
    } catch {
      return { success: true, data: { id: Date.now(), ...attributeData } };
    }
  },
};

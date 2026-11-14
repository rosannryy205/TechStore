import { httpRequest } from "../httpClient";
import { INITIAL_MOCK_BANNERS } from "@/constants/bannerPresets";

const STORAGE_KEY = "techstore_admin_banners_v1";

function getLocalBanners() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return INITIAL_MOCK_BANNERS;
}

function saveLocalBanners(banners) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
  } catch {
    // ignore
  }
}

export const bannerService = {
  /**
   * Lấy danh sách banner (hỗ trợ phân trang, lọc vị trí)
   */
  async getBanners(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await httpRequest(`/api/admin/banners${query ? `?${query}` : ""}`);
      if (res && res.data) return res.data;
    } catch {
      // Fallback local memory/storage nếu backend endpoint chưa sẵn sàng
    }

    let banners = getLocalBanners();
    if (params.position && params.position !== "all") {
      banners = banners.filter((b) => b.position === params.position);
    }
    return banners.sort((a, b) => a.display_order - b.display_order);
  },

  /**
   * Lấy chi tiết banner
   */
  async getBannerById(id) {
    try {
      const res = await httpRequest(`/api/admin/banners/${id}`);
      if (res && res.data) return res.data;
    } catch {
      // Fallback
    }

    const banners = getLocalBanners();
    return banners.find((b) => String(b.id) === String(id)) || null;
  },

  /**
   * Tạo banner mới
   */
  async createBanner(data) {
    try {
      const res = await httpRequest("/api/admin/banners", {
        method: "POST",
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
      if (res && res.data) return res.data;
    } catch {
      // Fallback
    }

    const banners = getLocalBanners();
    const newBanner = {
      id: Date.now(),
      position: data.position || "hero_slide",
      title: data.title || "Banner mới",
      badge: data.badge || "",
      description: data.description || "",
      image_url: data.image_url || "/src/assets/iphone18ProMax.webp",
      inline_img_1: data.inline_img_1 || "/src/assets/iphone18ProMax.webp",
      inline_img_2: data.inline_img_2 || "/src/assets/banner2.jpg",
      primary_cta_label: data.primary_cta_label || "Khám phá ngay",
      primary_cta_link: data.primary_cta_link || "/products",
      ambient_color: data.ambient_color || "rgba(59, 130, 246, 0.28)",
      chip_badge: data.chip_badge || "",
      metric_value: data.metric_value || "",
      metric_label: data.metric_label || "",
      specs: data.specs || [],
      display_order: Number(data.display_order) || banners.length + 1,
      status: data.status !== undefined ? Number(data.status) : 1,
    };
    banners.push(newBanner);
    saveLocalBanners(banners);
    return newBanner;
  },

  /**
   * Cập nhật banner
   */
  async updateBanner(id, data) {
    try {
      const res = await httpRequest(`/api/admin/banners/${id}`, {
        method: "PUT",
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
      if (res && res.data) return res.data;
    } catch {
      // Fallback
    }

    const banners = getLocalBanners();
    const index = banners.findIndex((b) => String(b.id) === String(id));
    if (index !== -1) {
      banners[index] = { ...banners[index], ...data };
      saveLocalBanners(banners);
      return banners[index];
    }
    throw new Error("Không tìm thấy banner cần cập nhật");
  },

  /**
   * Bật/Tắt nhanh trạng thái hiển thị
   */
  async toggleStatus(id, currentStatus) {
    const nextStatus = currentStatus === 1 ? 0 : 1;
    try {
      const res = await httpRequest(`/api/admin/banners/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res && res.data) return res.data;
    } catch {
      // Fallback
    }

    return this.updateBanner(id, { status: nextStatus });
  },

  /**
   * Xóa banner
   */
  async deleteBanner(id) {
    try {
      await httpRequest(`/api/admin/banners/${id}`, { method: "DELETE" });
      return true;
    } catch {
      // Fallback
    }

    const banners = getLocalBanners().filter((b) => String(b.id) !== String(id));
    saveLocalBanners(banners);
    return true;
  },
};

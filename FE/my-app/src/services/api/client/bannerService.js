import { httpRequest } from "../httpClient";
import { INITIAL_MOCK_BANNERS } from "@/constants/bannerPresets";

export const clientBannerService = {
  /**
   * Lấy danh sách banner kích hoạt theo vị trí
   */
  async getActiveBanners(position = "hero_slide") {
    try {
      const res = await httpRequest(`/api/banners?position=${position}`);
      if (res && res.data && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    try {
      const raw = localStorage.getItem("techstore_admin_banners_v1");
      if (raw) {
        const stored = JSON.parse(raw);
        const filtered = stored.filter(
          (b) => b.position === position && Number(b.status) === 1
        );
        if (filtered.length > 0) {
          return filtered.sort((a, b) => a.display_order - b.display_order);
        }
      }
    } catch {
      // ignore
    }

    return INITIAL_MOCK_BANNERS.filter(
      (b) => b.position === position && b.status === 1
    );
  },
};

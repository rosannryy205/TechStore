import { useState, useEffect } from "react";
import { clientBannerService } from "@/services/api/client/bannerService";
import { INITIAL_MOCK_BANNERS } from "@/constants/bannerPresets";

export function useHomeBanners(position = "hero_slide") {
  const [banners, setBanners] = useState(() =>
    INITIAL_MOCK_BANNERS.filter((b) => b.position === position && b.status === 1)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await clientBannerService.getActiveBanners(position);
        if (!ignore && data && data.length > 0) {
          setBanners(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.message || "Không thể tải banner");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchBanners();

    return () => {
      ignore = true;
    };
  }, [position]);

  return { banners, loading, error };
}

import { useState, useEffect } from "react";
import { productService } from "@/services/api/client/productService";

function mapProductsForHome(products) {
  return (products ?? []).map((p) => {
    const firstImage = (p.images && p.images[0]) || null;
    const image =
      firstImage?.img_url ||
      firstImage?.image_url ||
      firstImage?.url ||
      firstImage?.path ||
      "";

    const productId = p.id ?? p._id;
    const tagline = p.description || p.slug || "";
    const variants = p.variants || [];
    const brandName = p.brand?.name || "";

    // Tính toán mức giá khởi điểm từ các biến thể
    let minPrice = null;
    let originalPrice = null;
    let hasSale = false;

    if (variants.length > 0) {
      for (const v of variants) {
        const price = Number(v.price) || 0;
        const salePrice = Number(v.sale_price) || 0;
        const effectivePrice = salePrice > 0 && salePrice < price ? salePrice : price;

        if (minPrice === null || (effectivePrice > 0 && effectivePrice < minPrice)) {
          minPrice = effectivePrice;
          originalPrice = price;
          hasSale = salePrice > 0 && salePrice < price;
        }
      }
    }

    return {
      id: productId,
      name: p.name,
      tagline,
      image,
      brand: brandName,
      variants,
      minPrice,
      originalPrice,
      hasSale,
      href: productId ? `/product_detail?id=${productId}` : "/product_detail",
      cta: "Mua ngay",
      learnMoreHref: productId ? `/product_detail?id=${productId}` : "/product_detail",
    };
  });
}

export function useHomeProducts() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [newArrivalsData, featuresData, popularData] = await Promise.all([
          productService.getNewArrivals(),
          productService.getFeaturedProducts(),
          productService.getPopularProducts(),
        ]);

        if (!ignore) {
          setNewArrivals(mapProductsForHome(newArrivalsData));
          setFeatured(mapProductsForHome(featuresData));
          setPopular(mapProductsForHome(popularData));
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.message || "Lỗi khi tải dữ liệu sản phẩm trang chủ.");
          setNewArrivals([]);
          setFeatured([]);
          setPopular([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  return {
    newArrivals,
    featured,
    popular,
    loading,
    error,
  };
}

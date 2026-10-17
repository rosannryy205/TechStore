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

    return {
      id: productId,
      name: p.name,
      tagline,
      image,
      href: productId
        ? `/product_detail?id=${productId}`
        : "/product_detail",
      cta: "Xem chi tiết",
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
          setError(err?.message || "Error fetching product data.");
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

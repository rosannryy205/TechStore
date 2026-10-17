import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "@/services/api/client/productService";

const PAGE_SIZE = 16;

export function useProducts() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const categorySlug = searchParams.get("cate");
  const brandSlug = searchParams.get("brand");

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const list = await productService.getProducts({
          category: categorySlug,
          brand: brandSlug,
        });

        const mapped = list.map((p) => {
          const firstImage = p.images?.[0] ?? null;
          const image =
            firstImage?.img_url ||
            firstImage?.image_url ||
            firstImage?.url ||
            firstImage?.path ||
            "";

          const productId = p.id ?? p._id;
          const tagline = p.description || p.slug || "";
          const href = productId
            ? `/product_detail?id=${productId}`
            : "/product_detail";

          return {
            id: productId,
            name: p.name,
            tagline,
            image,
            href,
            cta: "Xem chi tiết",
          };
        });

        if (!ignore) {
          setProducts(mapped);
          setPage(1);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.message || "Error fetching product data.");
          setProducts([]);
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
  }, [categorySlug, brandSlug]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return products.slice(start, end);
  }, [products, safePage]);

  return {
    products,
    pageItems,
    loading,
    error,
    page: safePage,
    totalPages,
    setPage,
  };
}

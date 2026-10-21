import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "@/services/api/client/productService";
import { categoryService } from "@/services/api/client/categoryService";

const PAGE_SIZE = 12; // 12 sản phẩm mỗi trang, tối ưu cho lưới 3 cột (3x4)

export const PRICE_RANGES = [
  { id: "all", label: "Tất cả mức giá" },
  { id: "under-10m", label: "Dưới 10 triệu", min: 0, max: 10000000 },
  { id: "10m-20m", label: "Từ 10 - 20 triệu", min: 10000000, max: 20000000 },
  { id: "20m-30m", label: "Từ 20 - 30 triệu", min: 20000000, max: 30000000 },
  { id: "above-30m", label: "Trên 30 triệu", min: 30000000, max: Infinity },
];

export const SORT_OPTIONS = [
  { id: "newest", label: "Mới nhất" },
  { id: "price_asc", label: "Giá: Thấp đến Cao" },
  { id: "price_desc", label: "Giá: Cao đến Thấp" },
  { id: "popular", label: "Bán chạy nhất" },
];

export function useProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active filters từ URL Search Params (chấp nhận cả 'cate' và 'cat' để tương thích link cũ)
  const categorySlug = searchParams.get("cate") || searchParams.get("cat") || "";
  const brandSlug = searchParams.get("brand") || "";
  const priceRangeId = searchParams.get("price") || "all";
  const isSaleOnly = searchParams.get("sale") === "true";
  const sortOption = searchParams.get("sort") || "newest";
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(urlPage) || urlPage < 1 ? 1 : urlPage;

  const [rawProducts, setRawProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Categories 1 lần để phục vụ bộ lọc
  useEffect(() => {
    let ignore = false;
    categoryService
      .getCategories()
      .then((data) => {
        if (!ignore) {
          setCategories(data || []);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh mục cho bộ lọc:", err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch Products từ Backend khi category hoặc brand thay đổi
  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const list = await productService.getProducts({
          category: categorySlug === "all" ? "" : categorySlug,
          brand: brandSlug === "all" ? "" : brandSlug,
        });

        // Chuẩn hóa và tính toán Starting Price, Promotion status
        const mapped = (list || []).map((p) => {
          const firstImage = p.images?.[0] ?? null;
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
          const brandSlug = p.brand?.slug || "";
          const soldCount = Number(p.sold_count) || 0;

          // Tính Starting Price (minPrice) và phát hiện Sale
          let minPrice = null;
          let originalPrice = null;
          let hasSale = false;

          if (variants.length > 0) {
            for (const v of variants) {
              const price = Number(v.price) || 0;
              const salePrice = Number(v.sale_price) || 0;
              const isVariantSale = salePrice > 0 && salePrice < price;
              const effectivePrice = isVariantSale ? salePrice : price;

              if (minPrice === null || (effectivePrice > 0 && effectivePrice < minPrice)) {
                minPrice = effectivePrice;
                originalPrice = price;
              }
              if (isVariantSale) {
                hasSale = true;
              }
            }
          }

          return {
            id: productId,
            name: p.name,
            tagline,
            image,
            brand: brandName,
            brandSlug,
            variants,
            minPrice,
            originalPrice,
            hasSale,
            soldCount,
            createdAt: p.created_at || p.createdAt,
            href: productId ? `/product_detail?id=${productId}` : "/product_detail",
            learnMoreHref: productId ? `/product_detail?id=${productId}` : "/product_detail",
          };
        });

        if (!ignore) {
          setRawProducts(mapped);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.message || "Lỗi khi tải dữ liệu sản phẩm.");
          setRawProducts([]);
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

  // Bộ lọc tức thì tại FE: Khoảng giá & Trạng thái khuyến mãi
  const filteredProducts = useMemo(() => {
    let result = [...rawProducts];

    // Lọc theo hasSale
    if (isSaleOnly) {
      result = result.filter((p) => p.hasSale);
    }

    // Lọc theo khoảng giá Starting Price
    const rangeObj = PRICE_RANGES.find((r) => r.id === priceRangeId);
    if (rangeObj && rangeObj.id !== "all") {
      result = result.filter((p) => {
        if (!p.minPrice) return false;
        return p.minPrice >= rangeObj.min && p.minPrice < rangeObj.max;
      });
    }

    // Sắp xếp
    if (sortOption === "price_asc") {
      result.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
    } else if (sortOption === "price_desc") {
      result.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
    } else if (sortOption === "popular") {
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    } else {
      // newest
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [rawProducts, isSaleOnly, priceRangeId, sortOption]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, safePage]);

  // Hàm cập nhật filter đồng bộ URL
  const updateFilter = useCallback(
    (key, value) => {
      const nextParams = new URLSearchParams(searchParams);

      if (key === "cate") {
        if (!value || value === "all") {
          nextParams.delete("cate");
          nextParams.delete("cat");
        } else {
          nextParams.set("cate", value);
          nextParams.delete("cat");
        }
        // Khi đổi danh mục, reset thương hiệu và trang
        nextParams.delete("brand");
        nextParams.delete("page");
      } else if (key === "brand") {
        if (!value || value === "all") {
          nextParams.delete("brand");
        } else {
          nextParams.set("brand", value);
        }
        nextParams.delete("page");
      } else if (key === "price") {
        if (!value || value === "all") {
          nextParams.delete("price");
        } else {
          nextParams.set("price", value);
        }
        nextParams.delete("page");
      } else if (key === "sale") {
        if (value) {
          nextParams.set("sale", "true");
        } else {
          nextParams.delete("sale");
        }
        nextParams.delete("page");
      } else if (key === "sort") {
        if (!value || value === "newest") {
          nextParams.delete("sort");
        } else {
          nextParams.set("sort", value);
        }
        nextParams.delete("page");
      } else if (key === "page") {
        if (value <= 1) {
          nextParams.delete("page");
        } else {
          nextParams.set("page", String(value));
        }
      }

      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Xóa toàn bộ bộ lọc
  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Đếm số lượng bộ lọc đang active
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (categorySlug && categorySlug !== "all") count += 1;
    if (brandSlug && brandSlug !== "all") count += 1;
    if (priceRangeId && priceRangeId !== "all") count += 1;
    if (isSaleOnly) count += 1;
    return count;
  }, [categorySlug, brandSlug, priceRangeId, isSaleOnly]);

  return {
    products: filteredProducts,
    pageItems,
    loading,
    error,
    page: safePage,
    totalPages,
    totalCount: filteredProducts.length,
    rawCount: rawProducts.length,
    categories,
    activeCategory: categorySlug,
    activeBrand: brandSlug,
    activePrice: priceRangeId,
    activeSale: isSaleOnly,
    activeSort: sortOption,
    activeFiltersCount,
    setFilter: updateFilter,
    resetFilters,
    setPage: (p) => updateFilter("page", p),
  };
}

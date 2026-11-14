import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "@/services/api/client/productService";
import { categoryService } from "@/services/api/client/categoryService";
import {
  changeProductCriteria,
  inspectProductKeyword,
  productCriteriaParams,
  readProductCriteria,
  toProductCard,
} from "@/utils/productSearch";

const EMPTY_PAGE = { data: [], total: 0, page: 1, totalPages: 1 };

/**
 * URL là nguồn tiêu chí đã submit. BE sở hữu giá/filter/sort/count/phân trang;
 * hook chỉ tải một trang, chuẩn hóa giao diện và bảo vệ request về sai thứ tự.
 */
export function useProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const criteria = readProductCriteria(searchParams);
  const canonical = productCriteriaParams(criteria).toString();
  const currentUrl = searchParams.toString();
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState(null);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({
    key: null,
    ...EMPTY_PAGE,
    error: null,
  });
  const cacheRef = useRef(null);
  const requestKey = `${canonical}|${revision}`;
  const { allowed, tooLong } = inspectProductKeyword(criteria.q);

  useEffect(() => {
    // Chuẩn hóa dùng replace; thao tác khách chủ động ở setFilter dùng push.
    if (currentUrl !== canonical) setSearchParams(canonical, { replace: true });
  }, [currentUrl, canonical, setSearchParams]);

  useEffect(() => {
    let ignore = false;
    categoryService
      .getCategories()
      .then((items) => {
        if (ignore) return;
        // Chỉ lọc lựa chọn bị tắt, không làm facet đổi theo query hay số kết quả.
        setCategories(
          items
            .filter((category) => Number(category.status) === 1)
            .map((category) => ({
              ...category,
              category_brands: (category.category_brands || []).filter(
                (entry) => Number(entry.brand?.status) === 1,
              ),
            })),
        );
        setCategoryError(null);
      })
      .catch(() => {
        if (!ignore)
          setCategoryError("Không thể tải bộ lọc. Vui lòng thử lại.");
      });
    return () => {
      ignore = true;
    };
  }, [revision]);

  useEffect(() => {
    // Query sai ký tự hiện tập rỗng ngay tại FE; BE cũng kiểm tra khi gọi trực tiếp.
    if (!allowed || tooLong || cacheRef.current?.key === requestKey) return;
    const controller = new AbortController();
    const query = readProductCriteria(new URLSearchParams(canonical));
    productService
      .getProducts(query, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        const resolvedParams = productCriteriaParams({
          ...query,
          page: response.page,
        });
        const key = `${resolvedParams}|${revision}`;
        const next = {
          key,
          ...response,
          data: response.data.map(toProductCard),
          error: null,
        };
        cacheRef.current = next;
        setResult(next);
        // Server kẹp trang vượt giới hạn: sửa URL mà không tạo thêm mục lịch sử.
        // Cache theo URL đã kẹp để effect tiếp theo không gọi lại cùng trang.
        if (response.page !== query.page)
          setSearchParams(resolvedParams, { replace: true });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          // Sau lỗi, state đang chứa trang lỗi chứ không còn trang cache trước đó.
          // Xóa dấu cache để Back về query cũ vẫn tải lại thay vì kẹt loading.
          cacheRef.current = null;
          setResult({
            key: requestKey,
            ...EMPTY_PAGE,
            error: error.message || "Không thể tải sản phẩm.",
          });
        }
      });
    return () => controller.abort();
  }, [canonical, revision, requestKey, allowed, tooLong, setSearchParams]);

  const setFilter = useCallback(
    (key, value) => {
      setSearchParams((previous) =>
        changeProductCriteria(previous, key, value),
      );
    },
    [setSearchParams],
  );
  const matches = result.key === requestKey;
  const visible = allowed && !tooLong && matches ? result : EMPTY_PAGE;
  const activeFiltersCount = [
    criteria.category,
    criteria.brand,
    criteria.price !== "all",
    criteria.sale,
  ].filter(Boolean).length;
  return {
    pageItems: visible.data,
    loading: allowed && !tooLong && !matches,
    error: tooLong ? "Từ khóa tối đa 100 ký tự." : visible.error,
    page: visible.page,
    totalPages: visible.totalPages,
    totalCount: visible.total,
    categories,
    categoryError,
    activeFiltersCount,
    activeQuery: criteria.q,
    activeCategory: criteria.category,
    activeBrand: criteria.brand,
    activePrice: criteria.price,
    activeSale: criteria.sale,
    activeSort: criteria.sort,
    setFilter,
    setPage: (page) => setFilter("page", page),
    resetFilters: () => setFilter("reset"),
    clearQuery: () => setFilter("q", ""),
    retry: () => setRevision((value) => value + 1),
  };
}

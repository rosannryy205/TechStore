import { useCallback, useEffect, useRef, useState } from "react";
import { productService } from "@/services/api/client/productService";
import { inspectProductKeyword, toProductCard } from "@/utils/productSearch";

const EMPTY = {
  keyword: "",
  items: [],
  total: 0,
  page: 0,
  totalPages: 1,
  loading: false,
  error: null,
};

/**
 * Tìm trực tiếp cho hộp thoại: nhận query nháp, trả Product/metadata và tải thêm.
 * Không đồng bộ URL tại đây: URL chỉ đổi khi khách submit hoặc chọn Xem tất cả.
 */
export function useProductSearch({ open, query, composing = false }) {
  const { keyword, allowed, tooLong } = inspectProductKeyword(query);
  const canSearch = open && !composing && keyword && allowed && !tooLong;
  const [result, setResult] = useState(EMPTY);
  const [revision, setRevision] = useState(0);
  const requestRef = useRef(null);
  const generationRef = useRef(0);

  // Abort là tối ưu mạng; generation mới là bảo đảm đúng nếu response đã về sát lúc hủy.
  const requestPage = useCallback(async (word, page, generation) => {
    const controller = new AbortController();
    requestRef.current = controller;
    setResult((previous) => ({
      ...(page === 1 ? EMPTY : previous),
      keyword: word,
      loading: true,
      error: null,
    }));
    try {
      const response = await productService.getProducts(
        { q: word, page, limit: 12 },
        { signal: controller.signal },
      );
      if (controller.signal.aborted || generation !== generationRef.current)
        return;
      setResult((previous) => {
        const existing =
          page > 1 && previous.keyword === word ? previous.items : [];
        // ID duy nhất bảo vệ danh sách tải thêm nếu dữ liệu thay đổi giữa hai trang.
        const byId = new Map(existing.map((item) => [item.id, item]));
        response.data
          .map(toProductCard)
          .forEach((item) => byId.set(item.id, item));
        return {
          keyword: word,
          items: [...byId.values()],
          total: response.total,
          page: response.page,
          totalPages: response.totalPages,
          loading: false,
          error: null,
        };
      });
    } catch (error) {
      if (controller.signal.aborted || generation !== generationRef.current)
        return;
      setResult((previous) => ({
        ...previous,
        loading: false,
        error: error.message || "Không thể tải sản phẩm. Vui lòng thử lại.",
      }));
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, []);

  useEffect(() => {
    const generation = ++generationRef.current;
    // Đợi khách dừng gõ 300 ms; không gọi API giữa lúc bộ gõ đang ghép dấu tiếng Việt.
    const timer = canSearch
      ? setTimeout(() => requestPage(keyword, 1, generation), 300)
      : null;
    return () => {
      clearTimeout(timer);
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [canSearch, keyword, revision, requestPage]);

  // Ẩn kết quả query cũ ngay trong render, không chờ debounce/effect mới xóa state.
  const visible =
    canSearch && result.keyword === keyword
      ? result
      : { ...EMPTY, loading: Boolean(canSearch) };
  return {
    ...visible,
    allowed,
    tooLong,
    keyword,
    loadMore: () => {
      if (
        canSearch &&
        visible.page > 0 &&
        visible.page < visible.totalPages &&
        !requestRef.current &&
        !visible.loading
      ) {
        requestPage(keyword, visible.page + 1, generationRef.current);
      }
    },
    retry: () => setRevision((value) => value + 1),
  };
}

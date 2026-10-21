import { useMemo } from "react";
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";
import { SORT_OPTIONS, PRICE_RANGES } from "@/hooks/client/useProducts";

export default function ProductListHeader({
  count = 0,
  categories = [],
  activeCategory = "",
  activeBrand = "",
  activePrice = "all",
  activeSale = false,
  activeSort = "newest",
  activeCount = 0,
  onOpenMobileFilter,
  onSortChange,
  onRemoveFilter,
  onResetAll,
}) {
  // Tìm tên hiển thị của danh mục hiện tại
  const currentCategoryName = useMemo(() => {
    if (!activeCategory || activeCategory === "all") return "Tất cả sản phẩm";
    const found = categories.find((c) => c.slug === activeCategory);
    return found ? found.name : "Sản phẩm";
  }, [categories, activeCategory]);

  // Tìm tên hiển thị của brand hiện tại
  const currentBrandName = useMemo(() => {
    if (!activeBrand || activeBrand === "all") return "";
    for (const cat of categories) {
      for (const cb of cat.category_brands || []) {
        if (cb.brand?.slug === activeBrand) return cb.brand.name;
      }
    }
    return activeBrand;
  }, [categories, activeBrand]);

  // Tìm label khoảng giá hiện tại
  const currentPriceLabel = useMemo(() => {
    if (!activePrice || activePrice === "all") return "";
    const found = PRICE_RANGES.find((r) => r.id === activePrice);
    return found ? found.label : "";
  }, [activePrice]);

  return (
    <div className="mb-8" style={{ fontFamily: SF_TEXT }}>
      {/* ─── TIÊU ĐỀ CHÍNH TRANG SẢN PHẨM ─── */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] border border-[#e5e5e7] px-3.5 py-1.5 mb-4">
          <span className="text-[11px] font-bold tracking-wider text-[#6e6e73] uppercase">
            DANH MỤC
          </span>
          <span className="w-1 h-1 rounded-full bg-[#86868b]" />
          <span className="text-[13px] font-medium text-[#1d1d1f]">
            {count} sản phẩm
          </span>
        </div>

        <h1
          className="text-[32px] sm:text-[40px] lg:text-[44px] font-semibold text-[#1d1d1f] tracking-tight leading-tight"
          style={{ fontFamily: SF_DISPLAY }}
        >
          {currentCategoryName}
        </h1>
        <p className="mt-2 text-[15px] sm:text-[17px] text-[#6e6e73] leading-relaxed">
          Trải nghiệm công nghệ thế hệ mới — thiết kế nguyên khối tinh tế cùng hiệu năng dẫn đầu.
        </p>
      </div>

      {/* ─── TOOLBAR BỘ LỌC & SẮP XẾP ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e5e7]">
        {/* Mobile filter button + Result text */}
        <div className="flex items-center gap-3">
          {/* Nút mở Drawer lọc trên Mobile */}
          <button
            type="button"
            onClick={onOpenMobileFilter}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d2d2d7] bg-white text-[#1d1d1f] text-[13px] font-medium shadow-2xs hover:bg-[#f5f5f7] cursor-pointer transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 text-[#0066cc]" />
            <span>Bộ lọc</span>
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-[#0066cc] text-white rounded-full">
                {activeCount}
              </span>
            )}
          </button>

          <span className="text-[14px] text-[#6e6e73]">
            Hiển thị <strong className="text-[#1d1d1f] font-semibold">{count}</strong> sản phẩm
          </span>
        </div>

        {/* Sắp xếp dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="product-sort-select" className="text-[13px] text-[#6e6e73] whitespace-nowrap">
            Sắp xếp theo:
          </label>
          <div className="relative">
            <select
              id="product-sort-select"
              value={activeSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-[#f5f5f7] hover:bg-[#ebebee] border border-transparent focus:border-[#0066cc] focus:bg-white text-[#1d1d1f] text-[13px] font-medium py-1.5 pl-3 pr-8 rounded-full cursor-pointer outline-none transition-all"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-3.5 h-3.5 text-[#6e6e73] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ─── ACTIVE FILTER CHIPS (Thẻ lọc đang áp dụng) ─── */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <span className="text-[12px] font-medium text-[#86868b]">Đang lọc:</span>

          {activeCategory && activeCategory !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f7ff] border border-[#0066cc]/20 text-[#0066cc] text-[12px] font-medium">
              <span>Danh mục: {currentCategoryName}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter("cate")}
                className="hover:text-red-600 cursor-pointer"
                aria-label="Bỏ chọn danh mục"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {activeBrand && activeBrand !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f7ff] border border-[#0066cc]/20 text-[#0066cc] text-[12px] font-medium">
              <span>Hãng: {currentBrandName}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter("brand")}
                className="hover:text-red-600 cursor-pointer"
                aria-label="Bỏ chọn thương hiệu"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {activePrice && activePrice !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f7ff] border border-[#0066cc]/20 text-[#0066cc] text-[12px] font-medium">
              <span>{currentPriceLabel}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter("price")}
                className="hover:text-red-600 cursor-pointer"
                aria-label="Bỏ chọn khoảng giá"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {activeSale && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff0f0] border border-[#e30000]/20 text-[#e30000] text-[12px] font-medium">
              <span>Đang khuyến mãi</span>
              <button
                type="button"
                onClick={() => onRemoveFilter("sale")}
                className="hover:text-red-800 cursor-pointer"
                aria-label="Bỏ chọn khuyến mãi"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onResetAll}
            className="text-[12px] font-medium text-[#6e6e73] hover:text-[#0066cc] hover:underline ml-1 cursor-pointer transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}

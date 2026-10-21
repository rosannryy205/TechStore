import { useMemo } from "react";
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { SF_TEXT, SF_DISPLAY } from "@/constants/typography";
import { PRICE_RANGES } from "@/hooks/client/useProducts";

function FilterContent({
  categories = [],
  activeCategory = "",
  activeBrand = "",
  activePrice = "all",
  activeSale = false,
  onSelectCategory,
  onSelectBrand,
  onSelectPrice,
  onToggleSale,
  onReset,
  activeCount = 0,
}) {
  // Lấy danh sách brands tương ứng với category được chọn
  const availableBrands = useMemo(() => {
    if (!activeCategory || activeCategory === "all") {
      // Tập hợp tất cả các brand duy nhất từ toàn bộ categories
      const brandMap = new Map();
      categories.forEach((cat) => {
        (cat.category_brands || []).forEach((cb) => {
          if (cb.brand && !brandMap.has(cb.brand.slug)) {
            brandMap.set(cb.brand.slug, cb.brand);
          }
        });
      });
      return Array.from(brandMap.values());
    }

    const currentCat = categories.find((c) => c.slug === activeCategory);
    if (!currentCat || !Array.isArray(currentCat.category_brands)) return [];

    return currentCat.category_brands
      .map((cb) => cb.brand)
      .filter((b) => Boolean(b && b.slug));
  }, [categories, activeCategory]);

  return (
    <div className="space-y-6 text-[#1d1d1f]" style={{ fontFamily: SF_TEXT }}>
      {/* Header filter & Reset button */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e7]">
        <div className="flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-[#0066cc]" />
          <h3
            className="text-[17px] font-semibold text-[#1d1d1f]"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Bộ lọc
          </h3>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold bg-[#0066cc] text-white rounded-full">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-[13px] font-medium text-[#0066cc] hover:text-[#0071e3] hover:underline cursor-pointer transition-colors"
          >
            Đặt lại
          </button>
        )}
      </div>

      {/* ─── 1. ƯU ĐÃI / KHUYẾN MÃI (hasSale) ─── */}
      <div className="pb-5 border-b border-[#e5e5e7]">
        <label className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebee] cursor-pointer transition-colors select-none group">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-md bg-[#e30000] text-white">
              <SparklesIcon className="w-4 h-4" />
            </span>
            <span className="text-[14px] font-medium text-[#1d1d1f]">
              Chỉ xem khuyến mãi
            </span>
          </div>

          <input
            type="checkbox"
            checked={activeSale}
            onChange={(e) => onToggleSale(e.target.checked)}
            className="w-4.5 h-4.5 accent-[#0066cc] rounded cursor-pointer"
          />
        </label>
      </div>

      {/* ─── 2. DANH MỤC (Category) ─── */}
      <div className="pb-5 border-b border-[#e5e5e7]">
        <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#6e6e73] mb-3">
          Danh mục
        </h4>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className={[
              "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[14px] transition-all cursor-pointer text-left",
              !activeCategory || activeCategory === "all"
                ? "bg-[#0066cc] text-white font-medium shadow-xs"
                : "text-[#1d1d1f] hover:bg-[#f5f5f7]",
            ].join(" ")}
          >
            <span>Tất cả danh mục</span>
            {(!activeCategory || activeCategory === "all") && (
              <CheckIcon className="w-4 h-4" />
            )}
          </button>

          {categories.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => onSelectCategory(cat.slug)}
                className={[
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[14px] transition-all cursor-pointer text-left",
                  isSelected
                    ? "bg-[#0066cc] text-white font-medium shadow-xs"
                    : "text-[#1d1d1f] hover:bg-[#f5f5f7]",
                ].join(" ")}
              >
                <span>{cat.name}</span>
                {isSelected && <CheckIcon className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 3. THƯƠNG HIỆU (Brand) ─── */}
      {availableBrands.length > 0 && (
        <div className="pb-5 border-b border-[#e5e5e7]">
          <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#6e6e73] mb-3">
            Thương hiệu
          </h4>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onSelectBrand("all")}
              className={[
                "px-3 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer",
                !activeBrand || activeBrand === "all"
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ebebee]",
              ].join(" ")}
            >
              Tất cả
            </button>

            {availableBrands.map((brand) => {
              const isSelected = activeBrand === brand.slug;
              return (
                <button
                  key={brand.id || brand.slug}
                  type="button"
                  onClick={() => onSelectBrand(brand.slug)}
                  className={[
                    "px-3 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#0066cc] text-white shadow-xs"
                      : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ebebee]",
                  ].join(" ")}
                >
                  {brand.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 4. MỨC GIÁ (Starting Price Range) ─── */}
      <div>
        <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#6e6e73] mb-3">
          Mức giá
        </h4>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const isSelected = activePrice === range.id;
            return (
              <button
                key={range.id}
                type="button"
                onClick={() => onSelectPrice(range.id)}
                className={[
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[14px] transition-all cursor-pointer text-left",
                  isSelected
                    ? "bg-[#f0f7ff] text-[#0066cc] font-medium border border-[#0066cc]/30"
                    : "text-[#1d1d1f] hover:bg-[#f5f5f7] border border-transparent",
                ].join(" ")}
              >
                <span>{range.label}</span>
                {isSelected && <CheckIcon className="w-4 h-4 text-[#0066cc]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProductFilter({
  categories = [],
  activeCategory = "",
  activeBrand = "",
  activePrice = "all",
  activeSale = false,
  onSelectCategory,
  onSelectBrand,
  onSelectPrice,
  onToggleSale,
  onReset,
  activeCount = 0,
  isMobileOpen = false,
  onCloseMobile,
}) {
  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl border border-[#e5e5e7] p-5 shadow-xs">
          <FilterContent
            categories={categories}
            activeCategory={activeCategory}
            activeBrand={activeBrand}
            activePrice={activePrice}
            activeSale={activeSale}
            onSelectCategory={onSelectCategory}
            onSelectBrand={onSelectBrand}
            onSelectPrice={onSelectPrice}
            onToggleSale={onToggleSale}
            onReset={onReset}
            activeCount={activeCount}
          />
        </div>
      </aside>

      {/* ─── MOBILE SLIDE-OVER DRAWER ─── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e7]">
              <div className="flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-[#0066cc]" />
                <span className="text-[17px] font-semibold text-[#1d1d1f]">
                  Bộ lọc sản phẩm
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-full hover:bg-[#f5f5f7] text-[#6e6e73] cursor-pointer"
                aria-label="Đóng bộ lọc"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
              <FilterContent
                categories={categories}
                activeCategory={activeCategory}
                activeBrand={activeBrand}
                activePrice={activePrice}
                activeSale={activeSale}
                onSelectCategory={onSelectCategory}
                onSelectBrand={onSelectBrand}
                onSelectPrice={onSelectPrice}
                onToggleSale={onToggleSale}
                onReset={onReset}
                activeCount={activeCount}
              />
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-4 border-t border-[#e5e5e7] bg-[#f5f5f7]">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-3 rounded-full bg-[#0066cc] text-white text-[15px] font-medium hover:bg-[#0071e3] transition-colors cursor-pointer"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

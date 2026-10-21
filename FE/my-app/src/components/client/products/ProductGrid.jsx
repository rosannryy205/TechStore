import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { SF_TEXT, SF_DISPLAY } from "@/constants/typography";
import ProductCard from "./productCard";

export default function ProductGrid({ products = [], onResetFilters }) {
  if (products.length === 0) {
    return (
      <div
        className="w-full py-16 px-6 text-center rounded-3xl bg-[#f5f5f7] border border-[#e5e5e7] flex flex-col items-center justify-center my-6"
        style={{ fontFamily: SF_TEXT }}
      >
        <div className="w-16 h-16 rounded-full bg-white shadow-xs flex items-center justify-center mb-4 text-[#86868b]">
          <MagnifyingGlassIcon className="w-8 h-8 stroke-[1.5]" />
        </div>

        <h3
          className="text-[20px] sm:text-[22px] font-semibold text-[#1d1d1f] mb-2"
          style={{ fontFamily: SF_DISPLAY }}
        >
          Không tìm thấy sản phẩm phù hợp
        </h3>

        <p className="text-[14px] sm:text-[15px] text-[#6e6e73] max-w-md mx-auto mb-6 leading-relaxed">
          Rất tiếc, không có sản phẩm nào thỏa mãn toàn bộ tiêu chí lọc bạn đã chọn. Hãy thử thay đổi mức giá hoặc danh mục.
        </p>

        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0066cc] text-white text-[14px] font-medium hover:bg-[#0071e3] transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Xóa tất cả bộ lọc</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p) => (
        <ProductCard key={p.id ?? p.href ?? p.name} product={p} />
      ))}
    </div>
  );
}

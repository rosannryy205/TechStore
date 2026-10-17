import { SF_TEXT } from "@/constants/typography";

export default function ProductActions({
  selectedVariant,
  inCart,
  isPosting,
  saved,
  onAddToCart,
  onToggleSave,
}) {
  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
      <button
        onClick={onAddToCart}
        aria-label="Thêm vào giỏ"
        disabled={!selectedVariant || isPosting}
        className="inline-flex items-center justify-center rounded-full bg-[#0066cc] text-white text-[17px] font-normal tracking-[-0.374px] leading-[1.47] px-5.5 py-2.75 hover:bg-[#0071e3] active:scale-95 transition-all cursor-pointer border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: SF_TEXT }}
      >
        {!selectedVariant
          ? "Không khả dụng"
          : inCart
            ? "Đã thêm ✓"
            : isPosting
              ? "Đang thêm..."
              : "Thêm vào giỏ"}
      </button>

      <button
        onClick={onToggleSave}
        aria-label="Lưu sản phẩm"
        className="inline-flex items-center justify-center rounded-full bg-transparent text-[#0066cc] text-[17px] font-normal tracking-[-0.374px] leading-[1.47] px-5 py-2.75 border border-[#0066cc] hover:bg-[rgba(0,102,204,0.06)] active:scale-95 transition-all cursor-pointer outline-none"
        style={{ fontFamily: SF_TEXT }}
      >
        {saved ? "Đã lưu" : "Lưu sản phẩm"}
      </button>
    </div>
  );
}

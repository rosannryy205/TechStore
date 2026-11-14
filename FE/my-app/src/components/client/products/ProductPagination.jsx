import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { SF_TEXT } from "@/constants/typography";

export default function ProductPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Chỉ xét tối đa 5 số trang, tránh lặp toàn bộ totalPages khi catalog lớn.
  const pages = [];
  const candidates = [...new Set([1, totalPages, page - 1, page, page + 1])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  for (const value of candidates) {
    const previous = pages[pages.length - 1];
    if (typeof previous === "number" && value - previous > 1) pages.push("...");
    pages.push(value);
  }

  const handlePageSelect = (p) => {
    onPageChange(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      className="flex items-center justify-center gap-1.5 sm:gap-2 mt-12 select-none"
      style={{ fontFamily: SF_TEXT }}
      aria-label="Phân trang sản phẩm"
    >
      {/* Nút Trước */}
      <button
        type="button"
        onClick={() => handlePageSelect(Math.max(1, page - 1))}
        disabled={page === 1}
        className={[
          "inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all",
          page === 1
            ? "text-[#86868b] bg-[#f5f5f7] cursor-not-allowed opacity-60"
            : "text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#ebebee] active:scale-95 cursor-pointer",
        ].join(" ")}
        aria-label="Trang trước"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Trước</span>
      </button>

      {/* Danh sách số trang */}
      <div className="flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-[13px] text-[#86868b]"
              >
                &hellip;
              </span>
            );
          }

          const isCurrent = p === page;
          return (
            <button
              key={p}
              type="button"
              onClick={() => handlePageSelect(p)}
              className={[
                "w-9 h-9 rounded-full text-[13px] font-medium transition-all cursor-pointer flex items-center justify-center",
                isCurrent
                  ? "bg-[#0066cc] text-white shadow-xs font-semibold"
                  : "text-[#1d1d1f] hover:bg-[#f5f5f7]",
              ].join(" ")}
              aria-current={isCurrent ? "page" : undefined}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Nút Sau */}
      <button
        type="button"
        onClick={() => handlePageSelect(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={[
          "inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all",
          page === totalPages
            ? "text-[#86868b] bg-[#f5f5f7] cursor-not-allowed opacity-60"
            : "text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#ebebee] active:scale-95 cursor-pointer",
        ].join(" ")}
        aria-label="Trang sau"
      >
        <span className="hidden sm:inline">Sau</span>
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </nav>
  );
}

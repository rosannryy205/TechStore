import { SF_TEXT } from "@/constants/typography";

export default function ProductPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-12">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-full px-5.5 py-2.75 text-[17px] tracking-[-0.374px] leading-[1.47] transition-all cursor-pointer"
        style={{
          fontFamily: SF_TEXT,
          backgroundColor: page === 1 ? "#f0f0f0" : "#0066cc",
          color: page === 1 ? "#7a7a7a" : "#ffffff",
          opacity: page === 1 ? 0.85 : 1,
          border: "none",
        }}
      >
        Trang trước
      </button>

      <div
        className="rounded-full bg-[#f5f5f7] border border-[#e0e0e0] px-5 py-2"
        style={{ fontFamily: SF_TEXT }}
      >
        <span className="text-[14px] tracking-[-0.224px] text-[#1d1d1f]">
          Trang {page} / {totalPages}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded-full px-5.5 py-2.75 text-[17px] tracking-[-0.374px] leading-[1.47] transition-all cursor-pointer"
        style={{
          fontFamily: SF_TEXT,
          backgroundColor: page === totalPages ? "#f0f0f0" : "#0066cc",
          color: page === totalPages ? "#7a7a7a" : "#ffffff",
          opacity: page === totalPages ? 0.85 : 1,
          border: "none",
        }}
      >
        Trang sau
      </button>
    </div>
  );
}

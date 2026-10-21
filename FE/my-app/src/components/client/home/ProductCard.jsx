import { Link } from "react-router-dom";
import { SF_TEXT } from "@/constants/typography";
import { resolveProductImageUrl } from "@/utils/imageHelper";
import { formatVnd } from "@/utils/formatCurrency";

export default function ProductCard({ product, tone }) {
  const imageUrl = resolveProductImageUrl(product.image);
  const isDark = tone?.articleText === "#ffffff";

  return (
    <article
      className={[
        "rounded-2xl p-6 sm:p-8 flex flex-col justify-between text-center relative transition-all duration-300 ease-out group",
        isDark
          ? "bg-[#272729] text-white border border-[#38383a]"
          : "bg-white text-[#1d1d1f] border border-[#e5e5e7] shadow-sm hover:shadow-md",
      ].join(" ")}
      style={{ fontFamily: SF_TEXT }}
    >
      {/* Top Meta: Brand + Sale Tag */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {product.brand ? (
          <span
            className={`text-[12px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              isDark
                ? "bg-white/10 text-white/80"
                : "bg-[#f5f5f7] text-[#6e6e73]"
            }`}
          >
            {product.brand}
          </span>
        ) : (
          <div />
        )}

        {product.hasSale && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e30000] text-white tracking-wide">
            ƯU ĐÃI
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="w-full flex justify-center items-center py-4 my-auto">
        <Link to={product.href} className="inline-block relative overflow-hidden group">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-52 h-52 sm:w-60 sm:h-60 object-contain transition-transform duration-500 ease-out group-hover:scale-105"
            style={{
              filter: "drop-shadow(0px 12px 24px rgba(0, 0, 0, 0.15))",
            }}
            loading="lazy"
          />
        </Link>
      </div>

      {/* Info Section */}
      <div className="mt-4 flex flex-col items-center">
        <h3 className="text-[18px] sm:text-[20px] font-semibold leading-tight line-clamp-1">
          <Link
            to={product.href}
            className={`no-underline hover:underline ${
              isDark ? "text-white" : "text-[#1d1d1f]"
            }`}
          >
            {product.name}
          </Link>
        </h3>

        {/* Pricing */}
        <div className="mt-2.5 flex items-baseline gap-2">
          {product.minPrice ? (
            <>
              <span
                className={`text-[16px] sm:text-[17px] font-semibold ${
                  isDark ? "text-[#2997ff]" : "text-[#0066cc]"
                }`}
              >
                Từ {formatVnd(product.minPrice)}
              </span>
              {product.hasSale && product.originalPrice > product.minPrice && (
                <span
                  className={`text-[13px] line-through ${
                    isDark ? "text-white/40" : "text-[#86868b]"
                  }`}
                >
                  {formatVnd(product.originalPrice)}
                </span>
              )}
            </>
          ) : (
            <span
              className={`text-[15px] font-medium ${
                isDark ? "text-white/60" : "text-[#6e6e73]"
              }`}
            >
              Liên hệ để nhận báo giá
            </span>
          )}
        </div>

        {/* Tagline / Subtitle */}
        <p
          className={`mt-2 text-[13px] sm:text-[14px] leading-relaxed line-clamp-2 h-10 ${
            isDark ? "text-white/70" : "text-[#6e6e73]"
          }`}
        >
          {product.tagline || "Thiết kế sang trọng, hiệu năng vượt trội cho mọi nhu cầu."}
        </p>

        {/* Dual Actions (Apple style) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
          <Link
            to={product.href}
            className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-[14px] font-medium transition-all no-underline active:scale-95 ${
              isDark
                ? "bg-white text-[#1d1d1f] hover:bg-white/90"
                : "bg-[#0066cc] text-white hover:bg-[#0071e3]"
            }`}
          >
            Mua ngay
          </Link>

          <Link
            to={product.learnMoreHref || product.href}
            className={`inline-flex items-center gap-1 text-[14px] font-medium transition-colors no-underline hover:underline ${
              isDark ? "text-[#2997ff]" : "text-[#0066cc]"
            }`}
          >
            Tìm hiểu thêm <span>&rsaquo;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

import { Link } from "react-router-dom";
import { SF_TEXT, MONO_TEXT } from "@/constants/typography";
import { resolveProductImageUrl, handleImageError } from "@/utils/imageHelper";
import { formatVnd } from "@/utils/formatCurrency";
import Card3D from "./Card3D";

export default function ProductCard({ product, tone }) {
  const imageUrl = resolveProductImageUrl(product.image);
  const isDark = tone?.articleText === "#ffffff";

  return (
    <Card3D
      maxRotation={12}
      className={[
        "rounded-[2rem] p-6 sm:p-7 flex flex-col justify-between text-left relative transition-all duration-300 ease-out group overflow-hidden",
        isDark
          ? "spatial-glass-dark text-white"
          : "spatial-glass text-[#18181B] hover:border-[#3B82F6]/50",
      ].join(" ")}
      style={{ fontFamily: SF_TEXT }}
    >
      {/* Top Meta: Brand + Sale Tag with TranslateZ Popout */}
      <div
        className="flex items-center justify-between gap-2 mb-4 z-10"
        style={{ transform: "translateZ(25px)" }}
      >
        {product.brand ? (
          <span
            className={`text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${
              isDark
                ? "spatial-glass-pill text-white/90"
                : "spatial-glass-pill-light text-[#71717A]"
            }`}
            style={{ fontFamily: MONO_TEXT }}
          >
            {product.brand}
          </span>
        ) : (
          <div />
        )}

        {product.hasSale && (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E11D48] text-white tracking-wide shadow-sm">
            ƯU ĐÃI
          </span>
        )}
      </div>

      {/* Product Image with TranslateZ 45px Popout */}
      <div
        className="w-full flex justify-center items-center py-4 my-auto relative"
        style={{ transform: "translateZ(45px)" }}
      >
        <Link to={product.href} className="inline-block relative overflow-hidden group">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-48 h-48 sm:w-52 sm:h-52 object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)] transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            onError={handleImageError}
          />
        </Link>
      </div>

      {/* Info Section with TranslateZ 30px */}
      <div
        className="mt-4 flex flex-col z-10 pt-4 border-t border-slate-200/50"
        style={{ transform: "translateZ(30px)" }}
      >
        <h3 className="text-[17px] sm:text-[18px] font-bold leading-tight line-clamp-1">
          <Link
            to={product.href}
            className={`no-underline hover:text-[#3B82F6] transition-colors ${
              isDark ? "text-white" : "text-[#18181B]"
            }`}
          >
            {product.name}
          </Link>
        </h3>

        {/* Pricing in Geist Mono */}
        <div className="mt-2 flex items-baseline gap-2">
          {product.minPrice ? (
            <>
              <span
                className={`text-[16px] sm:text-[17px] font-bold ${
                  isDark ? "text-[#60A5FA]" : "text-[#2563EB]"
                }`}
                style={{ fontFamily: MONO_TEXT }}
              >
                {formatVnd(product.minPrice)}
              </span>
              {product.hasSale && product.originalPrice > product.minPrice && (
                <span
                  className={`text-[12px] line-through ${
                    isDark ? "text-white/40" : "text-[#94A3B8]"
                  }`}
                  style={{ fontFamily: MONO_TEXT }}
                >
                  {formatVnd(product.originalPrice)}
                </span>
              )}
            </>
          ) : (
            <span
              className={`text-[14px] font-medium ${
                isDark ? "text-white/60" : "text-[#71717A]"
              }`}
            >
              Liên hệ để nhận báo giá
            </span>
          )}
        </div>

        {/* Tagline / Subtitle */}
        <p
          className={`mt-1.5 text-[13px] leading-relaxed line-clamp-1 ${
            isDark ? "text-white/70" : "text-[#71717A]"
          }`}
        >
          {product.tagline || "Thiết kế sang trọng, hiệu năng vượt trội cho mọi nhu cầu."}
        </p>

        {/* Tactile Action Button */}
        <div className="mt-5 flex items-center justify-between gap-3 w-full">
          <Link
            to={product.href}
            className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-[13px] font-semibold transition-all no-underline active:scale-95 cursor-pointer shadow-sm ${
              isDark
                ? "bg-white text-[#18181B] hover:bg-slate-100"
                : "bg-[#18181B] text-white hover:bg-[#27272A]"
            }`}
          >
            Mua ngay
          </Link>

          <Link
            to={product.learnMoreHref || product.href}
            className={`inline-flex items-center gap-1 text-[13px] font-medium transition-colors no-underline hover:underline ${
              isDark ? "text-[#60A5FA]" : "text-[#3B82F6]"
            }`}
          >
            Chi tiết <span>&rsaquo;</span>
          </Link>
        </div>
      </div>
    </Card3D>
  );
}

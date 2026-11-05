import { Link } from "react-router-dom";
import { SF_DISPLAY, SF_TEXT, MONO_TEXT } from "@/constants/typography";
import { resolveProductImageUrl } from "@/utils/imageHelper";
import { formatVnd } from "@/utils/formatCurrency";
import Card3D from "./Card3D";

import heroImg from "@/assets/hero.png";
import ip16Img from "@/assets/ip16PRM.jpg";
import banner1Img from "@/assets/banner1.jpg";
import banner2Img from "@/assets/banner2.jpg";
import banner3Img from "@/assets/banner3.jpg";

// Default Fallback Products with organic pricing if database is empty
const DEFAULT_BENTO_PRODUCTS = [
  {
    id: "ip16-pro-max",
    name: "iPhone 16 Pro Max",
    brand: "Apple",
    tagline: "Titan Cấp 5. Vi xử lý A18 Pro 3nm mạnh mẽ.",
    minPrice: 34990000,
    originalPrice: 36990000,
    hasSale: true,
    image: ip16Img,
    href: "/products?cate=phone",
    metricBadge: "Titanium Cấp 5",
    highlightStat: "Ray-tracing x2",
  },
  {
    id: "macbook-pro-m3",
    name: "MacBook Pro 16 M3 Max",
    brand: "Apple",
    tagline: "Dynamic Caching. Màn hình Liquid Retina XDR 1.600 nits.",
    minPrice: 64990000,
    originalPrice: 67990000,
    hasSale: false,
    image: heroImg,
    href: "/products?cate=mac",
    metricBadge: "Apple M3 Max",
    highlightStat: "128GB Unified",
  },
  {
    id: "airpods-max",
    name: "AirPods Max Studio",
    brand: "Apple",
    tagline: "Chống ồn chủ động vượt trội. Âm thanh không gian cá nhân hóa.",
    minPrice: 12990000,
    originalPrice: 13990000,
    hasSale: true,
    image: banner3Img,
    href: "/products?cate=audio",
    metricBadge: "Spatial Audio",
    highlightStat: "Pin 20 giờ",
  },
  {
    id: "apple-watch-ultra",
    name: "Apple Watch Ultra 2",
    brand: "Apple",
    tagline: "Vỏ titan 49mm, màn hình 3.000 nits sáng nhất từng có.",
    minPrice: 21990000,
    originalPrice: 23490000,
    hasSale: false,
    image: banner1Img,
    href: "/products?cate=watch",
    metricBadge: "Định vị L1+L5",
    highlightStat: "Chống nước 100m",
  },
  {
    id: "ipad-pro-m4",
    name: "iPad Pro M4 Mỏng Kỷ Lục",
    brand: "Apple",
    tagline: "Màn hình Ultra Retina XDR OLED kép. Độ mỏng chỉ 5.1mm.",
    minPrice: 28990000,
    originalPrice: 31490000,
    hasSale: true,
    image: banner2Img,
    href: "/products?cate=ipad",
    metricBadge: "OLED Tandem",
    highlightStat: "Mỏng 5.1mm",
  },
];

export default function Bento3DGrid({
  id = "bento-showcase",
  title = "Hệ sinh thái công nghệ hàng đầu",
  subtitle = "Trải nghiệm chiều sâu 3D trên từng sản phẩm. Thiết kế đột phá, hiệu năng chuẩn chuyên nghiệp.",
  items = [],
  toneBg = "#F9FAFB",
}) {
  // Merge database items with fallback items so layout is always populated and alive
  const products = items && items.length >= 3 ? items : DEFAULT_BENTO_PRODUCTS;

  const item1 = products[0] || DEFAULT_BENTO_PRODUCTS[0];
  const item2 = products[1] || DEFAULT_BENTO_PRODUCTS[1];
  const item3 = products[2] || DEFAULT_BENTO_PRODUCTS[2];
  const item4 = products[3] || DEFAULT_BENTO_PRODUCTS[3];
  const item5 = products[4] || DEFAULT_BENTO_PRODUCTS[4];

  return (
    <section
      id={id}
      className="w-full py-16 lg:py-28 transition-colors duration-500 border-b border-slate-200/60"
      style={{ backgroundColor: toneBg, fontFamily: SF_TEXT }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header (Confident Left-Aligned, No Centered Hero Anti-Pattern) */}
        <div className="max-w-[760px] mb-12 lg:mb-16 text-left">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full spatial-glass-pill-light text-[#18181B] text-[12px] font-semibold tracking-wide uppercase mb-4"
            style={{ fontFamily: MONO_TEXT }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse-subtle" />
            BENTO ARCHITECTURE · SPATIAL GLASS
          </div>
          <h2
            className="text-[32px] sm:text-[42px] lg:text-[46px] font-bold text-[#18181B] tracking-[-0.025em] leading-[1.1] mb-4"
            style={{ fontFamily: SF_DISPLAY }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-[16px] sm:text-[18px] text-[#71717A] leading-[1.65]">
              {subtitle}
            </p>
          )}
        </div>

        {/* ─── ROW 1: 3 COLUMNS ASYMMETRIC BENTO (2fr | 1fr | 1fr) with SPATIAL GLASS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 mb-6 lg:mb-8">
          
          {/* Tile 1 (2fr / 6 Cols on Desktop): Large Flagship Hero Card in Spatial Glass */}
          <div className="md:col-span-12 lg:col-span-6">
            <Card3D
              maxRotation={10}
              className="h-full min-h-[460px] rounded-[2.5rem] spatial-glass p-8 sm:p-10 flex flex-col justify-between group overflow-hidden"
            >
              {/* Top Meta */}
              <div
                className="flex items-center justify-between z-10"
                style={{ transform: "translateZ(30px)" }}
              >
                <span
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold spatial-glass-pill-light text-[#18181B] uppercase tracking-wider"
                  style={{ fontFamily: MONO_TEXT }}
                >
                  {item1.brand || "FLAGSHIP"}
                </span>
                {item1.hasSale && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#E11D48] text-white shadow-sm">
                    ƯU ĐÃI
                  </span>
                )}
              </div>

              {/* 3D Product Visual with TranslateZ Popout */}
              <div
                className="my-auto py-6 flex items-center justify-center relative"
                style={{ transform: "translateZ(48px)" }}
              >
                <div
                  aria-hidden="true"
                  className="absolute w-56 h-56 rounded-full bg-[#3B82F6]/15 blur-2xl pointer-events-none"
                />
                <img
                  src={resolveProductImageUrl(item1.image)}
                  alt={item1.name}
                  className="w-56 sm:w-64 max-h-[260px] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Bottom Info & Pricing */}
              <div
                className="flex flex-col text-left z-10 pt-4 border-t border-slate-200/50"
                style={{ transform: "translateZ(35px)" }}
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="text-[20px] sm:text-[22px] font-bold text-[#18181B]">
                    <Link
                      to={item1.href || `/product_detail?id=${item1.id}`}
                      className="hover:text-[#3B82F6] transition-colors no-underline text-[#18181B]"
                    >
                      {item1.name}
                    </Link>
                  </h3>
                  <span
                    className="text-[17px] sm:text-[19px] font-bold text-[#2563EB]"
                    style={{ fontFamily: MONO_TEXT }}
                  >
                    {item1.minPrice ? formatVnd(item1.minPrice) : "Liên hệ"}
                  </span>
                </div>

                <p className="text-[14px] text-[#71717A] line-clamp-1 mb-4">
                  {item1.tagline || "Thiết kế nguyên khối, hiệu năng dẫn đầu phân khúc."}
                </p>

                <div className="flex items-center justify-between">
                  <Link
                    to={item1.href || `/product_detail?id=${item1.id}`}
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#18181B] text-white text-[13px] font-semibold transition-all hover:bg-[#27272A] active:scale-[0.98] no-underline shadow-sm"
                  >
                    Mua ngay
                  </Link>

                  <span
                    className="text-[12px] text-[#71717A] font-medium font-mono"
                    style={{ fontFamily: MONO_TEXT }}
                  >
                    {item1.highlightStat || "Bảo hành 12 tháng"}
                  </span>
                </div>
              </div>
            </Card3D>
          </div>

          {/* Tile 2 (1fr / 3 Cols on Desktop): Medium 3D Card in Spatial Glass */}
          <div className="md:col-span-6 lg:col-span-3">
            <Card3D
              maxRotation={12}
              className="h-full min-h-[460px] rounded-[2.5rem] spatial-glass p-6 sm:p-8 flex flex-col justify-between group overflow-hidden"
            >
              <div
                className="flex items-center justify-between z-10"
                style={{ transform: "translateZ(25px)" }}
              >
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold spatial-glass-pill-light text-[#71717A] uppercase tracking-wider"
                  style={{ fontFamily: MONO_TEXT }}
                >
                  {item2.brand || "PRO"}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse-subtle" />
              </div>

              <div
                className="my-auto py-4 flex items-center justify-center relative"
                style={{ transform: "translateZ(42px)" }}
              >
                <img
                  src={resolveProductImageUrl(item2.image)}
                  alt={item2.name}
                  className="w-44 sm:w-48 max-h-[200px] object-contain drop-shadow-[0_15px_22px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div
                className="flex flex-col text-left z-10 pt-4 border-t border-slate-200/50"
                style={{ transform: "translateZ(30px)" }}
              >
                <h3 className="text-[17px] font-bold text-[#18181B] line-clamp-1 mb-1">
                  <Link
                    to={item2.href || `/product_detail?id=${item2.id}`}
                    className="hover:text-[#3B82F6] transition-colors no-underline text-[#18181B]"
                  >
                    {item2.name}
                  </Link>
                </h3>
                <span
                  className="text-[15px] font-bold text-[#2563EB] mb-3"
                  style={{ fontFamily: MONO_TEXT }}
                >
                  {item2.minPrice ? formatVnd(item2.minPrice) : "Liên hệ"}
                </span>
                <Link
                  to={item2.href || `/product_detail?id=${item2.id}`}
                  className="w-full text-center py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#18181B] text-[13px] font-semibold transition-all no-underline"
                >
                  Xem chi tiết
                </Link>
              </div>
            </Card3D>
          </div>

          {/* Tile 3 (1fr / 3 Cols on Desktop): Companion 3D Card in Spatial Glass */}
          <div className="md:col-span-6 lg:col-span-3">
            <Card3D
              maxRotation={12}
              className="h-full min-h-[460px] rounded-[2.5rem] spatial-glass p-6 sm:p-8 flex flex-col justify-between group overflow-hidden"
            >
              <div
                className="flex items-center justify-between z-10"
                style={{ transform: "translateZ(25px)" }}
              >
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold spatial-glass-pill-light text-[#71717A] uppercase tracking-wider"
                  style={{ fontFamily: MONO_TEXT }}
                >
                  {item3.brand || "AUDIO"}
                </span>
                {item3.hasSale && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E11D48] text-white shadow-sm">
                    HOT
                  </span>
                )}
              </div>

              <div
                className="my-auto py-4 flex items-center justify-center relative"
                style={{ transform: "translateZ(42px)" }}
              >
                <img
                  src={resolveProductImageUrl(item3.image)}
                  alt={item3.name}
                  className="w-44 sm:w-48 max-h-[200px] object-contain drop-shadow-[0_15px_22px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div
                className="flex flex-col text-left z-10 pt-4 border-t border-slate-200/50"
                style={{ transform: "translateZ(30px)" }}
              >
                <h3 className="text-[17px] font-bold text-[#18181B] line-clamp-1 mb-1">
                  <Link
                    to={item3.href || `/product_detail?id=${item3.id}`}
                    className="hover:text-[#3B82F6] transition-colors no-underline text-[#18181B]"
                  >
                    {item3.name}
                  </Link>
                </h3>
                <span
                  className="text-[15px] font-bold text-[#2563EB] mb-3"
                  style={{ fontFamily: MONO_TEXT }}
                >
                  {item3.minPrice ? formatVnd(item3.minPrice) : "Liên hệ"}
                </span>
                <Link
                  to={item3.href || `/product_detail?id=${item3.id}`}
                  className="w-full text-center py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#18181B] text-[13px] font-semibold transition-all no-underline"
                >
                  Xem chi tiết
                </Link>
              </div>
            </Card3D>
          </div>

        </div>

        {/* ─── ROW 2: 2 COLUMNS ASYMMETRIC BENTO (70% / 30% Split - Stitch DESIGN.md rule 77) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Tile 4 (70% / 8 Cols): Ultra-Wide Flagship Experience Tile in Spatial Glass Dark */}
          <div className="lg:col-span-8">
            <Card3D
              maxRotation={8}
              className="h-full min-h-[360px] rounded-[2.5rem] spatial-glass-dark text-white p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8 group overflow-hidden"
            >
              <div
                className="flex flex-col items-start text-left max-w-[420px] z-10"
                style={{ transform: "translateZ(40px)" }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full spatial-glass-pill text-[#60A5FA] text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ fontFamily: MONO_TEXT }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-ping" />
                  FLAGSHIP HIGHLIGHT
                </div>
                <h3
                  className="text-[26px] sm:text-[34px] font-bold text-white tracking-tight leading-[1.15] mb-3"
                  style={{ fontFamily: SF_DISPLAY }}
                >
                  {item4.name}
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[#A1A1AA] leading-relaxed mb-6">
                  {item4.tagline || "Vượt qua mọi giới hạn với công nghệ tiên phong và độ hoàn thiện tinh xảo."}
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    to={item4.href || `/product_detail?id=${item4.id}`}
                    className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#3B82F6] text-white font-semibold text-[14px] transition-all hover:bg-[#2563EB] active:scale-[0.98] no-underline shadow-md"
                  >
                    Khám phá ngay
                  </Link>
                  <span
                    className="text-[18px] font-bold text-white"
                    style={{ fontFamily: MONO_TEXT }}
                  >
                    {item4.minPrice ? formatVnd(item4.minPrice) : ""}
                  </span>
                </div>
              </div>

              <div
                className="flex items-center justify-center relative shrink-0"
                style={{ transform: "translateZ(55px)" }}
              >
                <img
                  src={resolveProductImageUrl(item4.image)}
                  alt={item4.name}
                  className="w-52 sm:w-64 max-h-[240px] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </Card3D>
          </div>

          {/* Tile 5 (30% / 4 Cols): Premium Side Bento Tile in Spatial Glass */}
          <div className="lg:col-span-4">
            <Card3D
              maxRotation={12}
              className="h-full min-h-[360px] rounded-[2.5rem] spatial-glass p-8 flex flex-col justify-between text-left group overflow-hidden"
            >
              <div
                className="flex items-center justify-between z-10"
                style={{ transform: "translateZ(25px)" }}
              >
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-semibold spatial-glass-pill-light text-[#18181B] uppercase tracking-wider"
                  style={{ fontFamily: MONO_TEXT }}
                >
                  {item5.metricBadge || "PERFORMANCE"}
                </span>
                <span className="text-[12px] font-mono text-[#3B82F6] font-semibold" style={{ fontFamily: MONO_TEXT }}>
                  {item5.highlightStat || "Mới"}
                </span>
              </div>

              <div
                className="my-auto py-4 flex items-center justify-center relative"
                style={{ transform: "translateZ(45px)" }}
              >
                <img
                  src={resolveProductImageUrl(item5.image)}
                  alt={item5.name}
                  className="w-44 max-h-[170px] object-contain drop-shadow-[0_15px_22px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div
                className="flex flex-col z-10 pt-4 border-t border-slate-200/50"
                style={{ transform: "translateZ(30px)" }}
              >
                <h4 className="text-[18px] font-bold text-[#18181B] line-clamp-1 mb-1">
                  <Link
                    to={item5.href || `/product_detail?id=${item5.id}`}
                    className="hover:text-[#3B82F6] transition-colors no-underline text-[#18181B]"
                  >
                    {item5.name}
                  </Link>
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className="text-[16px] font-bold text-[#2563EB]"
                    style={{ fontFamily: MONO_TEXT }}
                  >
                    {item5.minPrice ? formatVnd(item5.minPrice) : "Liên hệ"}
                  </span>
                  <Link
                    to={item5.href || `/product_detail?id=${item5.id}`}
                    className="text-[13px] font-semibold text-[#18181B] hover:text-[#3B82F6] no-underline transition-colors"
                  >
                    Chi tiết &rarr;
                  </Link>
                </div>
              </div>
            </Card3D>
          </div>

        </div>

      </div>
    </section>
  );
}

import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { SF_DISPLAY, SF_TEXT, MONO_TEXT } from "@/constants/typography";
import heroImg from "@/assets/hero.png";
import ip16Img from "@/assets/ip16PRM.jpg";
import banner1Img from "@/assets/banner1.jpg";
import banner2Img from "@/assets/banner2.jpg";
import banner3Img from "@/assets/banner3.jpg";

const FLAGSHIP_HERO_SLIDES = [
  {
    id: "iphone-16-pro",
    badge: "Flagship Thế Hệ Mới",
    titlePrefix: "Kỷ nguyên",
    titleInlineImg1: ip16Img,
    titleMid: "công nghệ",
    titleInlineImg2: banner2Img,
    titleSuffix: "nguyên khối.",
    description:
      "Vỏ Titan cấp 5 hàng không vũ trụ kết hợp vi xử lý Apple A18 Pro 3nm. Hệ thống camera Fusion 48MP đưa trải nghiệm thị giác lên tầm cao chuẩn điện ảnh.",
    primaryCta: { label: "Khám phá ngay", link: "/products?cate=phone" },
    deviceImage: ip16Img,
    chipBadge: "A18 Pro · 3nm",
    metricValue: "+47.2%",
    metricLabel: "Băng thông đồ họa GPU",
    ambientColor: "rgba(59, 130, 246, 0.28)",
    specs: [
      { label: "Màn hình", value: "Super Retina XDR 120Hz" },
      { label: "Chất liệu", value: "Titanium Tự Nhiên Grade 5" },
      { label: "Pin liên tục", value: "Lên đến 33 giờ" },
    ],
  },
  {
    id: "macbook-pro-m3",
    badge: "Sức Mạnh Bất Tận",
    titlePrefix: "Hiệu năng",
    titleInlineImg1: banner1Img,
    titleMid: "đột phá",
    titleInlineImg2: heroImg,
    titleSuffix: "mọi giới hạn.",
    description:
      "Trang bị kiến trúc GPU Dynamic Caching thế hệ mới và ray-tracing bằng phần cứng. Xử lý tác vụ đồ họa và AI cục bộ nhanh hơn bất kỳ thế hệ máy tính xách tay nào.",
    primaryCta: { label: "Xem chi tiết Mac", link: "/products?cate=mac" },
    deviceImage: heroImg,
    chipBadge: "M3 Max · 16-Core",
    metricValue: "128GB",
    metricLabel: "Bộ nhớ Unified Memory",
    ambientColor: "rgba(147, 197, 253, 0.25)",
    specs: [
      { label: "Màn hình", value: "Liquid Retina XDR 1.600 nits" },
      { label: "Băng thông", value: "400 GB/s Memory Bandwidth" },
      { label: "Thời lượng pin", value: "22 giờ làm việc liên tục" },
    ],
  },
  {
    id: "airpods-max",
    badge: "Âm Thanh Không Gian",
    titlePrefix: "Âm học",
    titleInlineImg1: banner3Img,
    titleMid: "chuẩn studio",
    titleInlineImg2: ip16Img,
    titleSuffix: "chân thực.",
    description:
      "Màng loa dynamic do Apple tự thiết kế mang đến độ méo tiếng cực thấp trên toàn dải tần. Chế độ Chống Ồn Chủ Động chủ động cách ly tạp âm hoàn hảo.",
    primaryCta: { label: "Trải nghiệm âm thanh", link: "/products?cate=audio" },
    deviceImage: banner3Img,
    chipBadge: "Apple H1 Dual-Chip",
    metricValue: "2x",
    metricLabel: "Khử tiếng ồn chủ động",
    ambientColor: "rgba(96, 165, 250, 0.25)",
    specs: [
      { label: "Spatial Audio", value: "Theo dõi chuyển động đầu" },
      { label: "Đệm tai", value: "Vải lưới dệt Acoustic" },
      { label: "Cổng sạc", value: "USB-C đồng bộ hệ sinh thái" },
    ],
  },
];

export default function Hero3D() {
  const [activeIdx, setActiveIdx] = useState(0);
  const slide = FLAGSHIP_HERO_SLIDES[activeIdx];

  // 3D Canvas tilt state with multi-layer parallax
  const stageRef = useRef(null);
  const [tilt, setTilt] = useState({
    rotateX: 6,
    rotateY: -10,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
    isHovered: false,
  });

  const handleMouseMove = useCallback((e) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    // Max rotation along axes
    const rotX = -normY * 15;
    const rotY = normX * 18;

    setTilt({
      rotateX: rotX,
      rotateY: rotY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      glareOpacity: 0.28,
      isHovered: true,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Return smoothly to default isometric aesthetic angle
    setTilt({
      rotateX: 6,
      rotateY: -8,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0,
      isHovered: false,
    });
  }, []);

  return (
    <section
      className="relative w-full min-h-[100dvh] bg-[#0c0d0f] text-[#F9FAFB] flex flex-col justify-center overflow-hidden border-b border-white/10"
      style={{ fontFamily: SF_TEXT }}
    >
      {/* Background Subtle Spatial Ambient Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main Asymmetric 50/50 Grid Container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-20 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* ─── LEFT COLUMN: ASYMMETRIC EDITORIAL COPY ─── */}
          <div className="lg:col-span-7 flex flex-col items-start z-10 text-left">
            {/* Perpetual status dot & Eyebrow */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse-subtle" />
              <span
                className="text-[12px] uppercase tracking-wider text-[#94A3B8] font-medium"
                style={{ fontFamily: MONO_TEXT }}
              >
                {slide.badge}
              </span>
            </div>

            {/* Headline with Signature Inline Image Typography (Stitch DESIGN.md rule 65) */}
            <h1
              className="text-[38px] sm:text-[50px] lg:text-[62px] font-extrabold leading-[1.08] tracking-[-0.03em] text-white mb-6 text-left"
              style={{ fontFamily: SF_DISPLAY }}
            >
              <span>{slide.titlePrefix}</span>{" "}
              <span className="inline-flex items-center align-middle mx-1.5 my-1 sm:my-0 rounded-xl overflow-hidden border border-white/20 shadow-lg w-12 h-7 sm:w-16 sm:h-9 bg-white/5 shrink-0 transition-transform hover:scale-110">
                <img
                  src={slide.titleInlineImg1}
                  alt="Context visual"
                  className="w-full h-full object-cover"
                />
              </span>{" "}
              <span>{slide.titleMid}</span>{" "}
              <span className="inline-flex items-center align-middle mx-1.5 my-1 sm:my-0 rounded-xl overflow-hidden border border-white/20 shadow-lg w-12 h-7 sm:w-16 sm:h-9 bg-white/5 shrink-0 transition-transform hover:scale-110">
                <img
                  src={slide.titleInlineImg2}
                  alt="Architecture visual"
                  className="w-full h-full object-cover"
                />
              </span>{" "}
              <span>{slide.titleSuffix}</span>
            </h1>

            {/* Description (Steel Secondary color role, relaxed leading) */}
            <p className="text-[16px] sm:text-[18px] text-[#A1A1AA] leading-[1.65] max-w-[620px] mb-8 text-left">
              {slide.description}
            </p>

            {/* CTA Restraint (Stitch DESIGN.md rule 69: Maximum one primary CTA button, no filler UI) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <Link
                to={slide.primaryCta.link}
                className="inline-flex items-center justify-center min-h-[48px] px-8 py-3.5 rounded-full bg-[#3B82F6] text-white font-semibold text-[15px] transition-all hover:bg-[#2563EB] active:scale-[0.98] shadow-[0_10px_25px_-5px_rgba(59,130,246,0.4)] no-underline text-center cursor-pointer"
              >
                {slide.primaryCta.label}
              </Link>
            </div>

            {/* Technical Metadata Specs in Geist Mono (Stitch DESIGN.md rule 47) */}
            <div className="w-full pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {slide.specs.map((item, idx) => (
                <div key={idx} className="flex flex-col text-left">
                  <span
                    className="text-[11px] text-[#71717A] uppercase tracking-wider mb-1"
                    style={{ fontFamily: MONO_TEXT }}
                  >
                    {item.label}
                  </span>
                  <span className="text-[13px] text-white font-medium">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Device Switcher Tabs */}
            <div className="flex items-center gap-2 mt-8">
              {FLAGSHIP_HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                    activeIdx === idx
                      ? "bg-white text-[#18181B] shadow-md scale-105"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                  style={{ fontFamily: MONO_TEXT }}
                  aria-label={`Chuyển sang ${s.badge}`}
                >
                  0{idx + 1} // {s.chipBadge.split("·")[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* ─── RIGHT COLUMN: SPATIAL GLASS 3D VIEWPORT STAGE ─── */}
          <div className="lg:col-span-5 flex justify-center items-center relative py-6">
            <div
              ref={stageRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[500px] h-[500px] sm:h-[560px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
              style={{
                perspective: "1200px",
              }}
            >
              {/* 3D Holographic Spatial Glass Stage */}
              <div
                className="relative w-[330px] sm:w-[400px] h-[440px] sm:h-[500px] rounded-[2.5rem] spatial-glass-dark p-7 flex flex-col justify-between shadow-[0_35px_80px_-20px_rgba(0,0,0,0.85)] will-change-transform"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
                  transition: tilt.isHovered
                    ? "transform 0.1s ease-out"
                    : "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              >
                {/* 3D Layer 1 (TranslateZ 75px): Floating Spatial Glass Badge */}
                <div
                  className="flex items-center justify-between w-full z-20"
                  style={{
                    transform: "translateZ(75px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <span
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full spatial-glass-pill text-[#60A5FA] text-[12px] font-semibold"
                    style={{ fontFamily: MONO_TEXT }}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
                    {slide.chipBadge}
                  </span>

                  <span
                    className="text-[11px] text-[#94A3B8] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10"
                    style={{ fontFamily: MONO_TEXT }}
                  >
                    SPATIAL GLASS
                  </span>
                </div>

                {/* 3D Layer 2 (TranslateZ 40px): Flagship Product Image with Radial Ambient Caustic */}
                <div
                  className="w-full flex-1 flex items-center justify-center relative py-4"
                  style={{
                    transform: "translateZ(40px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Dynamic Optical Caustic Ambient Light behind device */}
                  <div
                    aria-hidden="true"
                    className="absolute w-56 h-56 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
                    style={{
                      backgroundColor: slide.ambientColor,
                      transform: "translateZ(-25px)",
                    }}
                  />

                  <img
                    src={slide.deviceImage}
                    alt={slide.badge}
                    className="max-w-[270px] sm:max-w-[320px] max-h-[320px] object-contain drop-shadow-[0_30px_45px_rgba(0,0,0,0.65)] transition-transform duration-500 hover:scale-105"
                    style={{
                      transform: "translateZ(30px)",
                    }}
                  />
                </div>

                {/* 3D Layer 3 (TranslateZ 85px): Floating Spatial Glass HUD HUD Panel */}
                <div
                  className="p-4 rounded-2xl spatial-glass-pill flex items-center justify-between z-30"
                  style={{
                    transform: "translateZ(85px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="flex flex-col text-left">
                    <span
                      className="text-[20px] font-bold text-white tracking-tight leading-none"
                      style={{ fontFamily: MONO_TEXT }}
                    >
                      {slide.metricValue}
                    </span>
                    <span className="text-[11px] text-[#A1A1AA] mt-1">
                      {slide.metricLabel}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-[#60A5FA] px-3 py-1.5 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/30">
                    Tương tác không gian
                  </span>
                </div>

                {/* Dynamic Specular Glass Reflection Layer */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[2.5rem] overflow-hidden transition-opacity duration-300"
                  style={{
                    opacity: tilt.glareOpacity,
                    background: `radial-gradient(circle 400px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.45), transparent 75%)`,
                    zIndex: 25,
                  }}
                />
              </div>

              {/* 3D Diffused Floor Shadow */}
              <div
                aria-hidden="true"
                className="absolute -bottom-8 w-4/5 h-10 rounded-full bg-black/85 blur-2xl pointer-events-none"
                style={{
                  transform: "rotateX(75deg) translateZ(-45px)",
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

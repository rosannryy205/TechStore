import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { SF_DISPLAY, SF_TEXT, MONO_TEXT } from "@/constants/typography";
import ip16Img from "@/assets/ip16PRM.jpg";

const ANGLES = [
  { id: "iso", label: "Isometric 3D", rotX: 18, rotY: -28, zoom: 1.05 },
  { id: "hero", label: "Điện ảnh 45°", rotX: 6, rotY: -42, zoom: 1.08 },
  { id: "front", label: "Trực diện", rotX: 0, rotY: 0, zoom: 1.0 },
  { id: "profile", label: "Nghiêng cạnh", rotX: -12, rotY: 32, zoom: 1.02 },
];

const FINISHES = [
  {
    id: "natural",
    name: "Titan Tự Nhiên",
    hex: "#9E988E",
    bgTint: "from-[#9E988E]/25 to-transparent",
    accentBorder: "border-[#9E988E]/50",
  },
  {
    id: "desert",
    name: "Titan Sa Mạc",
    hex: "#C5B29C",
    bgTint: "from-[#C5B29C]/25 to-transparent",
    accentBorder: "border-[#C5B29C]/50",
  },
  {
    id: "black",
    name: "Titan Đen Không Gian",
    hex: "#27272A",
    bgTint: "from-[#27272A]/35 to-transparent",
    accentBorder: "border-[#27272A]/60",
  },
  {
    id: "white",
    name: "Titan Trắng",
    hex: "#E4E4E7",
    bgTint: "from-[#E4E4E7]/30 to-transparent",
    accentBorder: "border-[#E4E4E7]/60",
  },
];

const HOTSPOTS = [
  {
    id: "camera",
    top: "32%",
    left: "72%",
    title: "Camera Control Cảm Ứng Lực",
    desc: "Cảm biến hai giai đoạn cho phép trượt ngón tay để zoom mượt mà và chuyển đổi ống kính tức thì.",
    tag: "FUSION 48MP",
  },
  {
    id: "chip",
    top: "54%",
    left: "48%",
    title: "Vi Xử Lý A18 Pro 3nm",
    desc: "Băng thông bộ nhớ tăng 47.2%, 6 lõi GPU chạy ray-tracing bằng phần cứng với tốc độ khung hình vượt bậc.",
    tag: "3NM ARCHITECTURE",
  },
  {
    id: "titan",
    top: "76%",
    left: "28%",
    title: "Khung Titan Cấp 5 Hàng Không",
    desc: "Tỷ lệ độ bền trên trọng lượng cao hơn mọi kim loại trước đây, cạnh viền mỏng nhất từng có.",
    tag: "AEROSPACE GRADE",
  },
];

export default function Interactive3DStudio() {
  const [currentAngle, setCurrentAngle] = useState(ANGLES[0]);
  const [currentFinish, setCurrentFinish] = useState(FINISHES[0]);
  const [activeHotspot, setActiveHotspot] = useState(null);

  // Freeform interactive mouse rotation state
  const stageRef = useRef(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0, isHovering: false });

  const handleMouseMove = useCallback((e) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: nx * 14, y: -ny * 14, isHovering: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0, isHovering: false });
  }, []);

  const effectiveRotX = (currentAngle.rotX + mouseOffset.y).toFixed(2);
  const effectiveRotY = (currentAngle.rotY + mouseOffset.x).toFixed(2);

  return (
    <section
      className="w-full bg-[#FFFFFF] py-16 lg:py-28 border-b border-slate-200/60 relative overflow-hidden"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header (Left aligned, confident typography, no centered hero anti-pattern) */}
        <div className="max-w-[720px] mb-12 lg:mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full spatial-glass-pill-light text-[#3B82F6] text-[12px] font-semibold tracking-wide uppercase mb-4" style={{ fontFamily: MONO_TEXT }}>
            <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
            Studio Không Gian 3D · VisionOS Depth
          </div>
          <h2
            className="text-[32px] sm:text-[42px] lg:text-[48px] font-bold text-[#18181B] tracking-[-0.025em] leading-[1.1] mb-4"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Tương tác đa chiều. Khám phá từng chi tiết nguyên khối.
          </h2>
          <p className="text-[16px] sm:text-[18px] text-[#71717A] leading-[1.65]">
            Di chuyển chuột trên mô hình 3D để xoay theo không gian thực. Chọn góc nhìn và nhấp vào các điểm đánh dấu để mở thẻ thông số bóc tách vi mô.
          </p>
        </div>

        {/* ─── 3D STUDIO MAIN BENTO INTERACTION (Asymmetric 7/5 Grid) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* ─── LEFT: 3D INTERACTIVE VIEWPORT (7 Cols) with SPATIAL GLASS ─── */}
          <div className="lg:col-span-7 spatial-glass rounded-[2.5rem] p-6 sm:p-10 relative flex flex-col justify-between min-h-[520px] sm:min-h-[600px] overflow-hidden select-none">
            
            {/* Top Controls: Camera Angles in Spatial Glass Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 z-20">
              <div className="flex flex-wrap items-center gap-2">
                {ANGLES.map((angle) => (
                  <button
                    key={angle.id}
                    onClick={() => {
                      setCurrentAngle(angle);
                      setActiveHotspot(null);
                    }}
                    className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                      currentAngle.id === angle.id
                        ? "bg-[#18181B] text-white shadow-md scale-105"
                        : "spatial-glass-pill-light text-[#71717A] hover:text-[#18181B] hover:bg-white"
                    }`}
                    style={{ fontFamily: MONO_TEXT }}
                  >
                    {angle.label}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-[#71717A] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-white/60 border border-slate-200">
                X: {effectiveRotX}° / Y: {effectiveRotY}°
              </div>
            </div>

            {/* 3D Model Stage Canvas */}
            <div
              ref={stageRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full flex-1 flex items-center justify-center my-6 cursor-grab active:cursor-grabbing"
              style={{
                perspective: "1100px",
              }}
            >
              {/* Dynamic finish radial glow */}
              <div
                aria-hidden="true"
                className={`absolute w-80 h-80 rounded-full bg-gradient-radial ${currentFinish.bgTint} blur-3xl pointer-events-none transition-all duration-700`}
                style={{ transform: "translateZ(-40px)" }}
              />

              {/* 3D Rotatable Phone Card with preserve-3d */}
              <div
                className="relative preserve-3d will-change-transform flex items-center justify-center"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `perspective(1100px) rotateX(${effectiveRotX}deg) rotateY(${effectiveRotY}deg) scale3d(${currentAngle.zoom}, ${currentAngle.zoom}, ${currentAngle.zoom})`,
                  transition: mouseOffset.isHovering
                    ? "transform 0.08s ease-out"
                    : "transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              >
                {/* 3D Device Render Layer */}
                <div
                  className="relative preserve-3d"
                  style={{
                    transform: "translateZ(30px)",
                  }}
                >
                  <img
                    src={ip16Img}
                    alt="iPhone 16 Pro Max 3D Showcase"
                    className="w-56 sm:w-68 max-h-[360px] object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.25)] select-none pointer-events-none transition-transform duration-500"
                  />

                  {/* 3D Hotspot Markers */}
                  {HOTSPOTS.map((spot) => {
                    const isSelected = activeHotspot?.id === spot.id;
                    return (
                      <button
                        key={spot.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHotspot(isSelected ? null : spot);
                        }}
                        aria-label={`Xem chi tiết ${spot.title}`}
                        className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#3B82F6] text-white scale-125 shadow-lg ring-4 ring-[#3B82F6]/30"
                            : "bg-[#18181B] text-white hover:scale-110 shadow-md ring-2 ring-white/90"
                        }`}
                        style={{
                          top: spot.top,
                          left: spot.left,
                          transform: `translate(-50%, -50%) translateZ(48px)`,
                          zIndex: 35,
                        }}
                      >
                        <span className="w-2 h-2 rounded-full bg-white" />
                      </button>
                    );
                  })}
                </div>

                {/* 3D Floating Popout Hotspot Detail HUD in VisionOS Spatial Glass (TranslateZ 80px) */}
                {activeHotspot && (
                  <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] sm:w-[330px] rounded-2xl spatial-glass-dark text-white p-5 shadow-2xl z-40"
                    style={{
                      transform: "translate(-50%, 0) translateZ(80px)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-[#60A5FA] font-mono tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#3B82F6]/20 border border-[#3B82F6]/30">
                        {activeHotspot.tag}
                      </span>
                      <button
                        onClick={() => setActiveHotspot(null)}
                        className="text-[14px] text-white/60 hover:text-white cursor-pointer px-1"
                      >
                        ✕
                      </button>
                    </div>
                    <h4 className="text-[14px] font-semibold text-white mb-1">
                      {activeHotspot.title}
                    </h4>
                    <p className="text-[12px] text-[#A1A1AA] leading-relaxed">
                      {activeHotspot.desc}
                    </p>
                  </div>
                )}
              </div>

              {/* 3D Ground Reflection Shadow */}
              <div
                aria-hidden="true"
                className="absolute -bottom-8 w-48 h-6 rounded-full bg-black/15 blur-lg pointer-events-none"
                style={{
                  transform: "rotateX(80deg) translateZ(-35px)",
                }}
              />
            </div>

            {/* Bottom Controls: Finish Color Palette Picker in Spatial Glass Capsule */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/60 z-20">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full spatial-glass-pill-light">
                <span className="text-[12px] text-[#71717A] font-medium mr-1">
                  Màu sắc:
                </span>
                {FINISHES.map((finish) => (
                  <button
                    key={finish.id}
                    onClick={() => setCurrentFinish(finish)}
                    className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                      currentFinish.id === finish.id
                        ? "ring-2 ring-offset-2 ring-[#3B82F6] scale-110 shadow-sm"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: finish.hex }}
                    aria-label={`Chọn màu ${finish.name}`}
                    title={finish.name}
                  />
                ))}
              </div>

              <span className="text-[12px] text-[#18181B] font-semibold font-mono" style={{ fontFamily: MONO_TEXT }}>
                {currentFinish.name}
              </span>
            </div>
          </div>

          {/* ─── RIGHT: TECHNICAL ARCHITECTURE & CALLOUT (5 Cols) in SPATIAL GLASS ─── */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Spec Card 1 */}
            <div className="p-6 sm:p-8 rounded-[2rem] spatial-glass transition-all hover:border-[#3B82F6]/50">
              <span className="text-[11px] text-[#71717A] uppercase tracking-wider font-mono" style={{ fontFamily: MONO_TEXT }}>
                KIẾN TRÚC VI MẠCH 3NM
              </span>
              <div className="flex items-baseline gap-3 mt-2 mb-3">
                <span className="text-[36px] font-bold text-[#18181B] leading-none tracking-tight" style={{ fontFamily: MONO_TEXT }}>
                  47.2%
                </span>
                <span className="text-[14px] text-[#3B82F6] font-semibold">
                  Băng thông bộ nhớ cao hơn
                </span>
              </div>
              <p className="text-[14px] text-[#71717A] leading-relaxed">
                GPU 6 lõi chuyên biệt cho đồ họa thế hệ mới với ray-tracing tăng tốc bằng phần cứng, render hình ảnh sống động chân thực gấp 2 lần.
              </p>
            </div>

            {/* Spec Card 2 */}
            <div className="p-6 sm:p-8 rounded-[2rem] spatial-glass transition-all hover:border-[#3B82F6]/50">
              <span className="text-[11px] text-[#71717A] uppercase tracking-wider font-mono" style={{ fontFamily: MONO_TEXT }}>
                CHU KỲ NĂNG LƯỢNG
              </span>
              <div className="flex items-baseline gap-3 mt-2 mb-3">
                <span className="text-[36px] font-bold text-[#18181B] leading-none tracking-tight" style={{ fontFamily: MONO_TEXT }}>
                  33 giờ
                </span>
                <span className="text-[14px] text-[#10B981] font-semibold">
                  Xem video liên tục
                </span>
              </div>
              <p className="text-[14px] text-[#71717A] leading-relaxed">
                Tối ưu hóa năng lượng toàn diện nhờ chip xử lý tiết kiệm điện và thiết kế tản nhiệt cấu trúc graphite tái chế 100%.
              </p>
            </div>

            {/* Single Primary Action Button */}
            <div className="pt-2">
              <Link
                to="/products?cate=phone"
                className="w-full inline-flex items-center justify-center min-h-[48px] py-4 px-8 rounded-full bg-[#18181B] text-white font-semibold text-[15px] transition-all hover:bg-[#27272A] active:scale-[0.98] shadow-md no-underline text-center cursor-pointer"
              >
                Cấu hình & Mua ngay
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

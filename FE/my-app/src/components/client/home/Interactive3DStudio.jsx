import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { SF_DISPLAY, SF_TEXT, MONO_TEXT } from "@/constants/typography";
import iphone18ProMaxImage from "@/assets/iphone18ProMax.webp";

const ANGLES = [
  { id: "iso", label: "Isometric 3D", rotX: 18, rotY: -28, zoom: 1.05 },
  { id: "hero", label: "Điện ảnh 45°", rotX: 6, rotY: -42, zoom: 1.08 },
  { id: "front", label: "Trực diện", rotX: 0, rotY: 0, zoom: 1.0 },
  { id: "profile", label: "Nghiêng cạnh", rotX: -12, rotY: 32, zoom: 1.02 },
];

const HOTSPOTS = [
  {
    id: "camera",
    top: "32%",
    left: "72%",
    title: "Camera Fusion 48MP",
    desc: "Camera chính có khẩu độ thay đổi từ ƒ/1.48 đến ƒ/4.0, điều chỉnh ánh sáng và độ sâu trường ảnh theo từng khung hình.",
    tag: "FUSION 48MP",
  },
  {
    id: "chip",
    top: "54%",
    left: "48%",
    title: "Vi Xử Lý A20 Pro 2nm",
    desc: "CPU 6 lõi, GPU 7 lõi và Dual 16-core Neural Engine đáp ứng xử lý đồ họa, ảnh và tác vụ AI trên thiết bị.",
    tag: "A20 PRO · 2NM",
  },
  {
    id: "unibody",
    top: "76%",
    left: "28%",
    title: "Thiết Kế Nhôm Nguyên Khối",
    desc: "Thân nhôm nguyên khối màu Burgundy, Ceramic Shield ở mặt trước và mặt sau cùng hệ thống tản nhiệt buồng hơi thế hệ mới.",
    tag: "ALUMINUM UNIBODY",
  },
];

export default function Interactive3DStudio() {
  const [currentAngle, setCurrentAngle] = useState(ANGLES[0]);
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
            iPhone 18 Pro Max. Khám phá từng chi tiết nguyên khối.
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
              {/* Burgundy finish radial glow */}
              <div
                aria-hidden="true"
                className="absolute w-80 h-80 rounded-full bg-gradient-radial from-[#754452]/25 to-transparent blur-3xl pointer-events-none transition-all duration-700"
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
                    src={iphone18ProMaxImage}
                    alt="iPhone 18 Pro Max màu Burgundy, mặt trước và mặt sau"
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

            {/* Finish label matches the photographed Burgundy device */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/60 z-20">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full spatial-glass-pill-light">
                <span className="text-[12px] text-[#71717A] font-medium mr-1">
                  Màu sắc:
                </span>
                <span
                  className="w-6 h-6 rounded-full bg-[#754452] ring-2 ring-offset-2 ring-[#3B82F6] shadow-sm"
                  aria-label="Burgundy"
                  role="img"
                />
              </div>

              <span className="text-[12px] text-[#18181B] font-semibold font-mono" style={{ fontFamily: MONO_TEXT }}>
                Burgundy
              </span>
            </div>
          </div>

          {/* ─── RIGHT: TECHNICAL ARCHITECTURE & CALLOUT (5 Cols) in SPATIAL GLASS ─── */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Spec Card 1 */}
            <div className="p-6 sm:p-8 rounded-[2rem] spatial-glass transition-all hover:border-[#3B82F6]/50">
              <span className="text-[11px] text-[#71717A] uppercase tracking-wider font-mono" style={{ fontFamily: MONO_TEXT }}>
                APPLE A20 PRO · KIẾN TRÚC 2NM
              </span>
              <div className="flex items-baseline gap-3 mt-2 mb-3">
                <span className="text-[36px] font-bold text-[#18181B] leading-none tracking-tight" style={{ fontFamily: MONO_TEXT }}>
                  7 lõi
                </span>
                <span className="text-[14px] text-[#3B82F6] font-semibold">
                  GPU với Neural Accelerators
                </span>
              </div>
              <p className="text-[14px] text-[#71717A] leading-relaxed">
                GPU 7 lõi với ray-tracing tăng tốc bằng phần cứng, kết hợp Dual 16-core Neural Engine cho xử lý đồ họa và AI.
              </p>
            </div>

            {/* Spec Card 2 */}
            <div className="p-6 sm:p-8 rounded-[2rem] spatial-glass transition-all hover:border-[#3B82F6]/50">
              <span className="text-[11px] text-[#71717A] uppercase tracking-wider font-mono" style={{ fontFamily: MONO_TEXT }}>
                CHU KỲ NĂNG LƯỢNG
              </span>
              <div className="flex items-baseline gap-3 mt-2 mb-3">
                <span className="text-[36px] font-bold text-[#18181B] leading-none tracking-tight" style={{ fontFamily: MONO_TEXT }}>
                  45 giờ
                </span>
                <span className="text-[14px] text-[#10B981] font-semibold">
                  Phát video tối đa
                </span>
              </div>
              <p className="text-[14px] text-[#71717A] leading-relaxed">
                Thời lượng phát video lên đến 45 giờ theo thử nghiệm của Apple. Thời lượng thực tế thay đổi theo cách sử dụng và cài đặt.
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

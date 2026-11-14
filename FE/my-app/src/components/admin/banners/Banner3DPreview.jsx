import Card3D from "@/components/client/home/Card3D";
import { SF_DISPLAY, SF_TEXT, MONO_TEXT } from "@/constants/typography";
import { resolveProductImageUrl } from "@/utils/imageHelper";

export default function Banner3DPreview({ formData, previewImage }) {
  const isHero = formData.position === "hero_slide";
  const displayImage = previewImage || formData.image_url || "/src/assets/iphone18ProMax.webp";

  return (
    <div
      className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0c0d0f] border border-white/10 text-white relative overflow-hidden select-none"
      style={{ fontFamily: SF_TEXT }}
    >
      {/* Background Subtle Spatial Ambient Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header bar */}
      <div className="w-full flex items-center justify-between mb-4 z-10">
        <span
          className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5"
          style={{ fontFamily: MONO_TEXT }}
        >
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          Interactive 3D Preview
        </span>
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#60A5FA]"
          style={{ fontFamily: MONO_TEXT }}
        >
          {isHero ? "Hero Stage 3D" : "Trade-in Card 3D"}
        </span>
      </div>

      {/* Card 3D Viewer */}
      <div className="w-full flex items-center justify-center py-4 z-10">
        <Card3D
          maxRotation={15}
          className="w-[280px] sm:w-[320px] min-h-[380px] rounded-[2rem] spatial-glass-dark p-5 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative border border-white/15"
        >
          {/* Top Pill / Badge */}
          <div
            className="flex items-center justify-between w-full z-20"
            style={{ transform: "translateZ(50px)" }}
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full spatial-glass-pill text-[#60A5FA] text-[11px] font-semibold"
              style={{ fontFamily: MONO_TEXT }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
              {formData.chip_badge || formData.badge || "PRO 3D"}
            </span>
            <span
              className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-wider"
              style={{ fontFamily: MONO_TEXT }}
            >
              3D DEPTH
            </span>
          </div>

          {/* Device visual with dynamic ambient light */}
          <div
            className="w-full flex-1 flex items-center justify-center relative py-6"
            style={{ transform: "translateZ(35px)" }}
          >
            {/* Dynamic Ambient Glow */}
            <div
              aria-hidden="true"
              className="absolute w-44 h-44 rounded-full blur-2xl pointer-events-none transition-colors duration-500"
              style={{
                backgroundColor: formData.ambient_color || "rgba(59, 130, 246, 0.28)",
                transform: "translateZ(-20px)",
              }}
            />

            <img
              src={resolveProductImageUrl(displayImage)}
              alt="3D Preview"
              className="max-w-[200px] max-h-[220px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] transition-transform duration-300 hover:scale-105 pointer-events-none"
            />
          </div>

          {/* Bottom HUD bar */}
          <div
            className="p-3 rounded-xl spatial-glass-pill flex items-center justify-between z-30"
            style={{ transform: "translateZ(60px)" }}
          >
            <div className="flex flex-col text-left">
              <span
                className="text-[15px] font-bold text-white tracking-tight leading-none"
                style={{ fontFamily: MONO_TEXT }}
              >
                {formData.metric_value || "48MP"}
              </span>
              <span className="text-[10px] text-[#A1A1AA] mt-1">
                {formData.metric_label || "Fusion Camera"}
              </span>
            </div>

            <span className="text-[10px] font-medium text-[#60A5FA] px-2.5 py-1 rounded-lg bg-[#3B82F6]/20 border border-[#3B82F6]/30">
              Live Preview
            </span>
          </div>
        </Card3D>
      </div>

      {/* Guide text */}
      <p className="text-[12px] text-[#94A3B8] mt-3 z-10" style={{ fontFamily: SF_DISPLAY }}>
        Di chuột trên khung thẻ để trải nghiệm góc nghiêng 3D thực tế
      </p>
    </div>
  );
}

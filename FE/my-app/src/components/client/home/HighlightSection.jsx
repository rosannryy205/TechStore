import { Link } from "react-router-dom";
import { SF_DISPLAY, SF_TEXT, MONO_TEXT } from "@/constants/typography";
import banner2Img from "@/assets/banner2.jpg";
import Card3D from "./Card3D";

export default function HighlightSection() {
  const perks = [
    {
      id: "express-delivery",
      num: "01",
      title: "Giao hỏa tốc 2 giờ",
      stat: "2h TẬN NƠI",
      description:
        "Đội ngũ kỹ thuật viên bàn giao tận tay, kích hoạt và chuyển dữ liệu bảo mật trực tiếp theo chuẩn Apple Authorized.",
      icon: (
        <svg className="w-6 h-6 text-[#3B82F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      id: "warranty",
      num: "02",
      title: "Bảo hành 1 đổi 1 trong 30 ngày",
      stat: "30 NGÀY ĐỔI MỚI",
      description:
        "Cam kết linh kiện chính hãng 100%, bảo hành phần cứng toàn diện 12 tháng tại các trung tâm dịch vụ ủy quyền.",
      icon: (
        <svg className="w-6 h-6 text-[#3B82F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      id: "expert-support",
      num: "03",
      title: "Chuyên gia công nghệ đồng hành 24/7",
      stat: "HỖ TRỢ TRỌN ĐỜI",
      description:
        "Tư vấn giải pháp phần mềm, sao lưu đám mây và thiết lập tài khoản cá nhân an toàn tuyệt đối.",
      icon: (
        <svg className="w-6 h-6 text-[#3B82F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h.01M12 10h.01M16 10h.01" />
        </svg>
      ),
    },
  ];

  return (
    <section
      className="w-full bg-[#F9FAFB] py-16 lg:py-28"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* ─── TRADE-IN 3D EDITORIAL BANNER (Asymmetric Split, Spatial Glass Dark) ─── */}
        <div className="relative rounded-[2.5rem] spatial-glass-dark text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] mb-20 lg:mb-28 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Copy Side (7 Cols) - Left aligned, clean spatial zone */}
            <div className="p-8 sm:p-12 lg:p-16 lg:col-span-7 flex flex-col items-start z-10 text-left">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full spatial-glass-pill text-[#60A5FA] text-[11px] font-semibold uppercase tracking-wider mb-4"
                style={{ fontFamily: MONO_TEXT }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
                TECHSTORE TRADE-IN PROGRAM
              </div>

              <h2
                className="text-[32px] sm:text-[44px] lg:text-[52px] font-bold leading-[1.08] tracking-[-0.025em] mb-4 text-white"
                style={{ fontFamily: SF_DISPLAY }}
              >
                Thu cũ đổi mới.<br />Trợ giá đến 2.000.000₫.
              </h2>

              <p className="text-[16px] sm:text-[18px] text-[#A1A1AA] leading-[1.65] max-w-[520px] mb-8">
                Nâng cấp lên thiết bị đỉnh cao với quy trình thẩm định 15 phút. Nhận thêm 47.2% ưu đãi phụ kiện khi đổi máy trong tháng này.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/products?sale=true"
                  className="inline-flex items-center justify-center min-h-[48px] px-8 py-3.5 rounded-full bg-[#3B82F6] text-white text-[15px] font-semibold transition-all hover:bg-[#2563EB] active:scale-[0.98] shadow-md no-underline"
                >
                  Định giá thiết bị ngay
                </Link>

                <span
                  className="text-[13px] text-[#A1A1AA] font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10"
                  style={{ fontFamily: MONO_TEXT }}
                >
                  Thẩm định trực tiếp · 15 phút
                </span>
              </div>
            </div>

            {/* Visual Side (5 Cols) - 3D Perspective Spatial Glass Card Stage */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex justify-center items-center">
              <Card3D
                maxRotation={14}
                className="w-full max-w-[380px] h-[340px] rounded-[2rem] spatial-glass-pill p-6 flex flex-col justify-between relative"
              >
                <div
                  className="flex items-center justify-between z-10"
                  style={{ transform: "translateZ(30px)" }}
                >
                  <span
                    className="text-[11px] font-mono uppercase text-[#60A5FA] tracking-wider"
                    style={{ fontFamily: MONO_TEXT }}
                  >
                    THẨM ĐỊNH SPATIAL 3D
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                </div>

                <div
                  className="my-auto py-2 flex items-center justify-center"
                  style={{ transform: "translateZ(50px)" }}
                >
                  <img
                    src={banner2Img}
                    alt="Trade-in Device Showcase"
                    className="w-56 h-44 object-cover rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div
                  className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between backdrop-blur-md"
                  style={{ transform: "translateZ(35px)" }}
                >
                  <span
                    className="text-[13px] font-mono text-white font-semibold"
                    style={{ fontFamily: MONO_TEXT }}
                  >
                    47.2% KHÁCH HÀNG CHỌN
                  </span>
                  <span className="text-[12px] text-[#60A5FA] font-medium">
                    Trợ giá tối đa
                  </span>
                </div>
              </Card3D>
            </div>

          </div>
        </div>

        {/* ─── TECHSTORE PERKS (2-COLUMN ASYMMETRIC ZIG-ZAG LAYOUT in SPATIAL GLASS) ─── */}
        {/* Strictly avoids the banned "3 equal cards in a row" anti-pattern (Stitch DESIGN.md rule 73) */}
        <div>
          <div className="max-w-[720px] mb-12 lg:mb-16 text-left">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full spatial-glass-pill-light text-[#18181B] text-[12px] font-semibold tracking-wide uppercase mb-4"
              style={{ fontFamily: MONO_TEXT }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
              TIÊU CHUẨN DỊCH VỤ ĐỘC QUYỀN
            </div>
            <h3
              className="text-[30px] sm:text-[40px] font-bold text-[#18181B] tracking-[-0.025em] leading-[1.1] mb-4"
              style={{ fontFamily: SF_DISPLAY }}
            >
              Cam kết đồng hành cùng trải nghiệm của bạn.
            </h3>
            <p className="text-[16px] text-[#71717A] leading-[1.65]">
              Mọi sản phẩm phân phối bởi TechStore đều được bảo chứng bởi chính sách dịch vụ minh bạch, chuẩn hóa và tận tâm.
            </p>
          </div>

          {/* Asymmetric 2-Column Zig-Zag Grid: Card 1 spans full width or large 7/5 split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Primary Featured Perk (Spans 7 cols on Desktop) */}
            <div className="lg:col-span-7">
              <Card3D
                maxRotation={10}
                className="h-full rounded-[2.5rem] spatial-glass p-8 sm:p-12 flex flex-col justify-between text-left group overflow-hidden"
              >
                <div
                  className="flex items-center justify-between mb-8 z-10"
                  style={{ transform: "translateZ(25px)" }}
                >
                  <div className="w-14 h-14 rounded-2xl spatial-glass-pill-light flex items-center justify-center">
                    {perks[0].icon}
                  </div>
                  <span
                    className="text-[12px] font-mono text-[#3B82F6] font-semibold px-3.5 py-1.5 rounded-full spatial-glass-pill-light"
                    style={{ fontFamily: MONO_TEXT }}
                  >
                    {perks[0].stat}
                  </span>
                </div>

                <div style={{ transform: "translateZ(35px)" }}>
                  <h4 className="text-[22px] sm:text-[26px] font-bold text-[#18181B] tracking-tight mb-3">
                    {perks[0].title}
                  </h4>
                  <p className="text-[15px] sm:text-[16px] text-[#71717A] leading-relaxed max-w-[540px]">
                    {perks[0].description}
                  </p>
                </div>
              </Card3D>
            </div>

            {/* Stacked Secondary Perks (Spans 5 cols on Desktop) */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">
              {perks.slice(1).map((item) => (
                <Card3D
                  key={item.id}
                  maxRotation={10}
                  className="rounded-[2.5rem] spatial-glass p-7 sm:p-8 flex flex-col justify-between text-left group overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between mb-4 z-10"
                    style={{ transform: "translateZ(25px)" }}
                  >
                    <div className="w-12 h-12 rounded-xl spatial-glass-pill-light flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span
                      className="text-[11px] font-mono text-[#71717A] font-medium"
                      style={{ fontFamily: MONO_TEXT }}
                    >
                      {item.stat}
                    </span>
                  </div>

                  <div style={{ transform: "translateZ(30px)" }}>
                    <h4 className="text-[18px] sm:text-[20px] font-bold text-[#18181B] tracking-tight mb-2">
                      {item.title}
                    </h4>
                    <p className="text-[14px] text-[#71717A] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Card3D>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

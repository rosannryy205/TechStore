import { Link } from "react-router-dom";
import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";
import banner2Img from "@/assets/banner2.jpg";

export default function HighlightSection() {
  const perks = [
    {
      id: 1,
      title: "Giao hàng hỏa tốc",
      description: "Nhận máy tận tay chỉ trong 2 giờ tại nội thành. Miễn phí vận chuyển toàn quốc cho mọi đơn hàng.",
      icon: (
        <svg className="w-8 h-8 text-[#0066cc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      id: 2,
      title: "Bảo hành 1 đổi 1",
      description: "Đổi mới 100% trong 30 ngày đầu tiên nếu phát sinh lỗi từ nhà sản xuất. Bảo hành chính hãng 12 tháng.",
      icon: (
        <svg className="w-8 h-8 text-[#0066cc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 3,
      title: "Chuyên gia TechStore 24/7",
      description: "Tư vấn kỹ thuật chuyên sâu, hỗ trợ sao lưu dữ liệu và thiết lập thiết bị mới hoàn toàn miễn phí.",
      icon: (
        <svg className="w-8 h-8 text-[#0066cc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h.01M12 10h.01M16 10h.01" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-[#f5f5f7] py-16 lg:py-24" style={{ fontFamily: SF_TEXT }}>
      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10">
        
        {/* ─── TRADE-IN EDITORIAL BANNER ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-[#1d1d1f] text-white shadow-xl mb-16 lg:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Copy Side */}
            <div className="p-8 sm:p-12 lg:p-16 lg:col-span-7 flex flex-col items-start z-10">
              <span className="text-[13px] font-semibold uppercase tracking-widest text-[#2997ff] mb-3">
                TechStore Trade-in
              </span>
              
              <h2
                className="text-[28px] sm:text-[38px] lg:text-[46px] font-semibold leading-[1.1] tracking-tight mb-4 text-white"
                style={{ fontFamily: SF_DISPLAY }}
              >
                Thu cũ đổi mới.<br />Trợ giá đến 2.000.000₫.
              </h2>
              
              <p className="text-[16px] sm:text-[18px] text-[#cccccc] leading-relaxed max-w-140 mb-8">
                Nâng cấp lên thiết bị công nghệ bạn hằng mong ước với chi phí tối ưu nhất. Thẩm định nhanh chóng chỉ trong 15 phút.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/products?sale=true"
                  className="inline-flex items-center justify-center rounded-full bg-[#0066cc] text-white text-[15px] font-medium px-7 py-3.5 hover:bg-[#0071e3] transition-all no-underline active:scale-95"
                >
                  Định giá ngay
                </Link>
                
                <Link
                  to="/contact"
                  className="inline-flex items-center text-[15px] font-medium text-[#2997ff] hover:underline no-underline"
                >
                  Tìm hiểu thêm &rsaquo;
                </Link>
              </div>
            </div>

            {/* Image Side */}
            <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-full min-h-75 overflow-hidden flex items-center justify-center">
              <img
                src={banner2Img}
                alt="TechStore Trade-in"
                className="w-full h-full object-cover object-center opacity-85 transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t lg:bg-linear-to-r from-[#1d1d1f] via-transparent to-transparent" />
            </div>

          </div>
        </div>

        {/* ─── TECHSTORE PERKS (3 COLUMNS) ─── */}
        <div>
          <div className="text-center max-w-180 mx-auto mb-12">
            <h3
              className="text-[26px] sm:text-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-2"
              style={{ fontFamily: SF_DISPLAY }}
            >
              Đặc quyền chỉ có tại TechStore
            </h3>
            <p className="text-[16px] text-[#6e6e73]">
              Trải nghiệm mua sắm công nghệ an tâm, tiện lợi và chuẩn mực.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {perks.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-8 border border-[#e5e5e7] shadow-xs flex flex-col items-start transition-all hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                
                <h4 className="text-[19px] font-semibold text-[#1d1d1f] mb-3">
                  {item.title}
                </h4>
                
                <p className="text-[14px] sm:text-[15px] text-[#6e6e73] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";
import banner2Img from "@/assets/banner2.jpg";

export default function HighlightSection() {
  const banner = {
    title: "Ưu đãi thương hiệu chính hãng",
    subtitle:
      "Tối ưu lựa chọn cho bạn — tiết kiệm ngay, hỗ trợ nhanh, yên tâm sử dụng.",
    href: "/products?sale=true",
    cta: "Xem ưu đãi",
    image: banner2Img,
    alt: "Banner ưu đãi thương hiệu chính hãng",
  };

  return (
    <section className="w-full" style={{ backgroundColor: "#f5f5f7" }}>
      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
        <div className="max-w-245 mx-auto text-center mb-10 lg:mb-12">
          <h2
            className="text-[28px] md:text-[34px] lg:text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] text-[#1d1d1f]"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Section tạo điểm nhấn
          </h2>
          <p
            className="mt-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#cccccc]"
            style={{ fontFamily: SF_TEXT }}
          >
            Một đường link duy nhất, tập trung đúng thứ bạn cần — nhanh, gọn,
            Apple-like.
          </p>
        </div>

        <div className="flex justify-center">
          <article
            className="relative overflow-hidden w-[92vw] max-w-245 h-[80vh] max-h-130"
            style={{ borderRadius: 0 }}
          >
            <img
              src={banner.image}
              alt={banner.alt}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                boxShadow: "rgba(0, 0, 0, 0.22) 3px 5px 30px 0",
                borderRadius: 0,
              }}
              loading="lazy"
            />

            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: "rgba(245, 245, 247, 0.25)" }}
            >
              <div className="text-center px-4 sm:px-6 lg:px-10 max-w-180">
                <h3
                  className="text-[#1d1d1f] text-[28px] md:text-[34px] font-semibold leading-[1.1] tracking-[-0.374px]"
                  style={{ fontFamily: SF_DISPLAY }}
                >
                  {banner.title}
                </h3>

                <p
                  className="mt-4 text-[#333333] text-[17px] leading-[1.47] tracking-[-0.374px]"
                  style={{ fontFamily: SF_TEXT }}
                >
                  {banner.subtitle}
                </p>

                <div className="mt-8">
                  <a
                    href={banner.href}
                    className="inline-flex items-center justify-center rounded-full bg-[#0066cc] text-white text-[18px] font-light leading-none px-7 py-3.5 hover:bg-[#0071e3] active:scale-95 transition-all no-underline"
                    style={{ fontFamily: SF_TEXT }}
                  >
                    {banner.cta}
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";
import { resolveProductImageUrl } from "@/utils/imageHelper";

export default function RelatedProducts({ products = [], error }) {
  return (
    <div className="bg-[#ffffff]">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-[12px] font-semibold tracking-[0.231px] leading-none text-[#7a7a7a] mb-3">
              SẢN PHẨM LIÊN QUAN
            </div>
            <h2
              className="text-[40px] font-semibold tracking-[-0.374px] leading-[1.1] text-[#1d1d1f]"
              style={{ fontFamily: SF_DISPLAY }}
            >
              Gợi ý dành cho bạn
            </h2>
          </div>
        </div>

        {error ? (
          <p className="mt-10 text-center text-[14px] text-red-600">{error}</p>
        ) : products.length === 0 ? null : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((p) => {
              const imgUrl = resolveProductImageUrl(p.image);
              return (
                <article
                  key={p.id}
                  className="rounded-lg overflow-hidden flex flex-col items-center text-center border border-transparent transition-transform duration-300 ease-out group text-[#1d1d1f] relative"
                >
                  <div className="w-full">
                    <img
                      src={imgUrl}
                      alt={p.name}
                      className="w-full h-55 sm:h-65 lg:h-70 object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                      style={{
                        boxShadow: "rgba(0, 0, 0, 0.22) 3px 5px 30px 0",
                        borderRadius: 18,
                      }}
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-8 transition-transform duration-300 ease-out group-hover:-translate-y-1">
                    <h3
                      className="text-[17px] sm:text-[18px] font-semibold leading-[1.24] tracking-[-0.374px]"
                      style={{ fontFamily: SF_TEXT }}
                    >
                      {p.name}
                    </h3>
                    <p
                      title={p.tagline}
                      className="w-full min-w-0 mt-2 text-[17px] leading-[1.47] tracking-[-0.374px] line-clamp-2 h-12.5 overflow-hidden text-ellipsis text-[#1d1d1f]"
                      style={{ fontFamily: SF_TEXT }}
                    >
                      {p.tagline}
                    </p>

                    <div className="mt-6">
                      <a
                        href={p.href}
                        className="inline-flex items-center justify-center rounded-full bg-[#0066cc] text-white text-[18px] font-light leading-none px-7 py-3.5 hover:bg-[#0071e3] active:scale-95 transition-all no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                        style={{ fontFamily: SF_TEXT }}
                        aria-label={`Xem ${p.name}`}
                      >
                        {p.cta}
                      </a>
                    </div>
                  </div>

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-lg border border-transparent transition-opacity duration-300 ease-out opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 ring-1 ring-[#0071e3]/20 group-hover:ring-[#0071e3]/40 group-focus-within:ring-[#0071e3]/40"
                  />
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

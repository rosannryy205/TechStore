import { SF_TEXT } from "@/constants/typography";
import { resolveProductImageUrl } from "@/utils/imageHelper";

export default function ProductCard({ product }) {
  const imageUrl = resolveProductImageUrl(product.image);

  return (
    <article
      className={[
        "relative",
        "rounded-lg",
        "overflow-hidden",
        "flex flex-col items-center",
        "text-center",
        "border",
        "border-transparent",
        "transition-transform duration-300 ease-out",
        "group",
        "text-[#1d1d1f]",
      ].join(" ")}
    >
      <div className="w-full">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-60 sm:h-65 lg:h-70 object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
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
          {product.name}
        </h3>

        <p
          title={product.tagline}
          className="w-full min-w-0 mt-2 text-[17px] leading-[1.47] tracking-[-0.374px] line-clamp-2 h-12.5 overflow-hidden text-ellipsis"
          style={{
            fontFamily: SF_TEXT,
            fontWeight: 400,
            color: "#333333",
          }}
        >
          {product.tagline}
        </p>

        <div className="mt-6">
          <a
            href={product.href}
            className="inline-flex items-center justify-center rounded-full bg-[#0066cc] text-white text-[18px] font-light leading-none px-7 py-3.5 hover:bg-[#0071e3] active:scale-95 transition-all no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
            style={{ fontFamily: SF_TEXT }}
            aria-label={`Xem ${product.name}`}
          >
            {product.cta}
          </a>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-0 rounded-lg",
          "border border-transparent",
          "transition-opacity duration-300 ease-out",
          "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          "ring-1 ring-[#0071e3]/20 group-hover:ring-[#0071e3]/40 group-focus-within:ring-[#0071e3]/40",
        ].join(" ")}
      />
    </article>
  );
}

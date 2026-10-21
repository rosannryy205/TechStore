import { useEffect, useRef, useState } from "react";
import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";
import ProductCard from "./productCard";

const productTileBase = "px-4 sm:px-6 lg:px-10 py-16 lg:py-24 text-center";

export default function ProductGridSection({
  toneBg,
  title,
  subtitle,
  items_product = [],
  renderCardTone = "light",
  align = "center",
  id,
}) {
  const alignClass =
    align === "start"
      ? "items-start text-left"
      : align === "end"
        ? "items-end text-right"
        : "items-center text-center";

  const tone = {
    light: {
      title: "#1d1d1f",
      subtitle: "#6e6e73",
      articleText: "#1d1d1f",
      tagline: "#6e6e73",
    },
    parchment: {
      title: "#1d1d1f",
      subtitle: "#6e6e73",
      articleText: "#1d1d1f",
      tagline: "#6e6e73",
    },
    dark: {
      title: "#ffffff",
      subtitle: "#a1a1a6",
      articleText: "#ffffff",
      tagline: "#a1a1a6",
    },
  }[renderCardTone] || {
    title: "#1d1d1f",
    subtitle: "#6e6e73",
    articleText: "#1d1d1f",
    tagline: "#6e6e73",
  };

  const sectionRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsActive(entry.isIntersecting);
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!items_product || items_product.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id={id}
      className="w-full transition-colors duration-500"
      style={{ backgroundColor: toneBg }}
    >
      <div
        className={[
          "transition-all duration-700 ease-out",
          isActive ? "opacity-100 translate-y-0" : "opacity-90 translate-y-3",
        ].join(" ")}
      >
        <div className={`mx-auto max-w-360 ${productTileBase}`}>
          <div className="max-w-245 mx-auto mb-10 lg:mb-14">
            <div className={`flex flex-col ${alignClass} gap-3`}>
              <h2
                className="text-[28px] sm:text-[36px] lg:text-[44px] font-semibold leading-tight tracking-tight"
                style={{ fontFamily: SF_DISPLAY, color: tone.title }}
              >
                {title}
              </h2>
              {subtitle ? (
                <p
                  className="text-[16px] sm:text-[18px] leading-relaxed max-w-180"
                  style={{
                    fontFamily: SF_TEXT,
                    color: tone.subtitle,
                  }}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items_product.map((p) => (
              <ProductCard
                key={p.id ?? p.name}
                product={p}
                tone={tone}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

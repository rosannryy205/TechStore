import { useEffect, useRef, useState } from "react";
import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";
import ProductCard from "./ProductCard";

const productTileBase = "px-6 sm:px-8 lg:px-10 py-16 lg:py-20 text-center";

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
      ? "items-start"
      : align === "end"
        ? "items-end"
        : "items-center";

  const tone = {
    light: {
      title: "#1d1d1f",
      subtitle: "#1d1d1f",
      articleText: "#1d1d1f",
      tagline: "#1d1d1f",
    },
    parchment: {
      title: "#1d1d1f",
      subtitle: "#1d1d1f",
      articleText: "#1d1d1f",
      tagline: "#1d1d1f",
    },
    dark: {
      title: "#ffffff",
      subtitle: "#cccccc",
      articleText: "#ffffff",
      tagline: "#cccccc",
    },
  }[renderCardTone] || {
    title: "#1d1d1f",
    subtitle: "#1d1d1f",
    articleText: "#1d1d1f",
    tagline: "#1d1d1f",
  };

  const sectionRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const scrollerRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsActive(entry.isIntersecting);
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleWheelToHorizontal(e) {
    const el = scrollerRef.current;
    if (!el) return;

    if (el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(e.deltaY) < 2) return;

    el.scrollLeft += e.deltaY;
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      className="w-full"
      style={{ backgroundColor: toneBg }}
    >
      <div
        className={[
          `transition-all duration-500 ease-out`,
          isActive ? "opacity-100 translate-y-0" : "opacity-90 translate-y-2",
        ].join(" ")}
      >
        <div className={`mx-auto max-w-360 ${productTileBase}`}>
          <div className="max-w-245 mx-auto mb-10 lg:mb-12">
            <div
              className={`flex flex-col ${alignClass} gap-3`}
              style={{ fontFamily: SF_DISPLAY }}
            >
              <h2
                className="text-[28px] md:text-[34px] lg:text-[40px] font-semibold leading-[1.1] tracking-[-0.374px]"
                style={{ color: tone.title }}
              >
                {title}
              </h2>
              {subtitle ? (
                <p
                  className="text-[17px] leading-[1.47] tracking-[-0.374px]"
                  style={{
                    fontFamily: SF_TEXT,
                    fontWeight: 400,
                    color: tone.subtitle,
                  }}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <div
            ref={scrollerRef}
            onWheel={handleWheelToHorizontal}
            className={[
              "overflow-x-auto",
              "overflow-y-hidden",
              "scrollbar-none",
              "[-ms-overflow-style:none] [scrollbar-width:none]",
            ].join(" ")}
          >
            <div
              className={[
                "grid gap-6 sm:gap-8",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
                "min-w-full",
              ].join(" ")}
            >
              {items_product.map((p) => (
                <ProductCard
                  key={p.id ?? p.name}
                  product={p}
                  tone={tone}
                  isActive={isActive}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

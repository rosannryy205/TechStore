import { useEffect, useRef, useState } from "react";
import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";
import ProductCard from "./productCard";

export default function ProductGridSection({
  toneBg = "#FFFFFF",
  title,
  subtitle,
  items_product = [],
  renderCardTone = "light",
  align = "start",
  id,
}) {
  const alignClass =
    align === "start"
      ? "items-start text-left"
      : align === "end"
        ? "items-end text-right"
        : "items-center text-center";

  const isDark = renderCardTone === "dark";
  const tone = {
    title: isDark ? "#FFFFFF" : "#18181B",
    subtitle: isDark ? "#A1A1AA" : "#71717A",
    articleText: isDark ? "#FFFFFF" : "#18181B",
    tagline: isDark ? "#A1A1AA" : "#71717A",
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
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!items_product || items_product.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id={id}
      className="w-full py-16 lg:py-24 transition-colors duration-500 border-b border-slate-200/60"
      style={{ backgroundColor: toneBg, fontFamily: SF_TEXT }}
    >
      <div
        className={[
          "max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 transition-all duration-700 ease-out",
          isActive ? "opacity-100 translate-y-0" : "opacity-90 translate-y-3",
        ].join(" ")}
      >
        <div className="max-w-[720px] mb-12 text-left">
          <div className={`flex flex-col ${alignClass} gap-3`}>
            <h2
              className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold leading-tight tracking-[-0.025em]"
              style={{ fontFamily: SF_DISPLAY, color: tone.title }}
            >
              {title}
            </h2>
            {subtitle ? (
              <p
                className="text-[16px] sm:text-[18px] leading-relaxed"
                style={{
                  color: tone.subtitle,
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {items_product.map((p) => (
            <ProductCard
              key={p.id ?? p.name}
              product={p}
              tone={tone}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

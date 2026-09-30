import Banner from "../../components/Banner";
import Loading from "../../components/loading";
import React from "react";

const SF_DISPLAY = "SF Pro Display, system-ui, -apple-system, sans-serif";
const SF_TEXT = "SF Pro Text, system-ui, -apple-system, sans-serif";

const productTileBase = "px-6 sm:px-8 lg:px-10 py-16 lg:py-20 text-center";

function ProductGridSection({
  toneBg,
  title,
  subtitle,
  items_product,
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
  }[renderCardTone];

  const sectionRef = React.useRef(null);
  const [isActive, setIsActive] = React.useState(false);
  const scrollerRef = React.useRef(null);

  React.useEffect(() => {
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

    // Chỉ chuyển đổi khi có khả năng cuộn ngang (mobile/tablet sẽ hưởng ứng tốt hơn)
    if (el.scrollWidth <= el.clientWidth) return;

    // Tránh block native scroll quá nặng tay: chỉ khi deltaY đủ lớn
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
              // Giữ grid desktop như cũ; wrapper overflow-x cho wheel “hợp lý”
              "scrollbar-none",
              "[-ms-overflow-style:none] [scrollbar-width:none]",
            ].join(" ")}
          >
            <div
              className={[
                "grid gap-6 sm:gap-8",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
                // Không cho wrap khi cuộn ngang
                "min-w-full",
              ].join(" ")}
            >
              {items_product.map((p) => (
                <article
                  key={p.name}
                  className={[
                    "rounded-lg",
                    "overflow-hidden",
                    "flex flex-col items-center",
                    "text-center",
                    "border",
                    "border-transparent",
                    "transition-transform duration-300 ease-out",
                    "group",
                    tone.articleText === "#ffffff"
                      ? "text-white"
                      : "text-[#1d1d1f]",
                    isActive ? "translate-y-0" : "translate-y-0",
                  ].join(" ")}
                >
                  <div className="w-full">
                    <img
                      src={
                        p.image?.startsWith("http") || p.image?.startsWith("data:")
                          ? p.image
                          : p.image?.includes("uploads/")
                            ? `http://localhost:3000/${p.image.replace(/^\//, "")}`
                            : p.image
                              ? `http://localhost:3000/uploads/products/${p.image}`
                              : "/src/assets/product.jpg"
                      }
                      alt={p.name}
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
                      {p.name}
                    </h3>
                    <p
                      title={p.tagline}
                      className="w-full min-w-0 mt-2 text-[17px] leading-[1.47] tracking-[-0.374px] line-clamp-2 h-12.5 overflow-hidden text-ellipsis"
                      style={{
                        fontFamily: SF_TEXT,
                        fontWeight: 400,
                        color: tone.tagline,
                      }}
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

                  {/* Ring hairline on hover (không dùng shadow chrome) */}
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HighlightSection() {
  const banner = {
    title: "Ưu đãi thương hiệu chính hãng",
    subtitle:
      "Tối ưu lựa chọn cho bạn — tiết kiệm ngay, hỗ trợ nhanh, yên tâm sử dụng.",
    href: "/products?sale=true",
    cta: "Xem ưu đãi",
    image: "../src/assets/banner2.jpg",
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

        {/* Highlight block: ~80% viewport, centered, background image fills full box */}
        <div className="flex justify-center">
          <article
            className="relative overflow-hidden w-[92vw] max-w-245 h-[80vh] max-h-130"
            style={{ borderRadius: 0 }}
          >
            {/* Product/image background */}
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

            {/* Overlay content */}
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

export default function Home() {
  const [newArrivals, setNewArrivals] = React.useState([]);
  const [featured, setFeatured] = React.useState([]);
  const [popular, setPopular] = React.useState([]);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const API_BASE_URL = "http://localhost:3000/api"; // Cập nhật nếu backend chạy ở cổng khác

    const mapProductsForHome = (products) => {
      return (products ?? []).map((p) => {
        const firstImage = (p.images && p.images[0]) || null;

        // BE model: ProductImage fields (img_url/image_url/url/path)
        const image =
          firstImage?.img_url ||
          firstImage?.image_url ||
          firstImage?.url ||
          firstImage?.path ||
          "";

        const productId = p.id ?? p._id;
        const tagline = p.description || p.slug || "";

        return {
          id: productId,
          name: p.name,
          tagline,
          image,
          href: productId
            ? `/product_detail?id=${productId}`
            : "/product_detail",
          cta: "Xem chi tiết",
        };
      });
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [resNewArrivals, resFeatures, resPopular] = await Promise.all([
          fetch(`${API_BASE_URL}/products/newarrival`),
          fetch(`${API_BASE_URL}/products/features`),
          fetch(`${API_BASE_URL}/products/popular`),
        ]);

        if (!resNewArrivals.ok)
          throw new Error(`HTTP newarrival ${resNewArrivals.status}`);
        if (!resFeatures.ok)
          throw new Error(`HTTP features ${resFeatures.status}`);
        if (!resPopular.ok)
          throw new Error(`HTTP popular ${resPopular.status}`);

        const [jsonNewArrivals, jsonFeatures, jsonPopular] = await Promise.all([
          resNewArrivals.json(),
          resFeatures.json(),
          resPopular.json(),
        ]);

        const newArrivalProducts = jsonNewArrivals?.data ?? [];
        const featuresProducts = jsonFeatures?.data ?? [];
        const popularProducts = jsonPopular?.data ?? [];

        setNewArrivals(mapProductsForHome(newArrivalProducts));
        setFeatured(mapProductsForHome(featuresProducts));
        setPopular(mapProductsForHome(popularProducts));
      } catch {
        setError("Error fetching product data.");
        setNewArrivals([]);
        setFeatured([]);
        setPopular([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section
        className="w-full"
        style={{ fontFamily: SF_TEXT, position: "relative", minHeight: 300 }}
      >
        <Loading
          variant="fullscreen"
          size="medium"
          text="Loading..."
          shouldShow={true}
          minDurationMs={1000}
          maxDurationMs={3000}
        />
      </section>
    );
  }

  return (
    <main className="w-full">
      {/* Keep existing banner */}
      <Banner />

      {/* Error banner (debug) */}
      {error ? (
        <div className="w-full bg-red-50 border border-red-200 text-red-700 px-6 py-4 my-4">
          {error}
        </div>
      ) : null}

      {/* 1) Sản phẩm mới ra mắt */}
      <ProductGridSection
        id="new-arrivals"
        toneBg="#ffffff"
        renderCardTone="light"
        title="Sản phẩm mới ra mắt"
        subtitle="Những lựa chọn vừa cập nhật — thiết kế tinh gọn, hiệu năng sẵn sàng."
        items_product={newArrivals}
      />

      {/* 2) Sản phẩm nổi bật */}
      <ProductGridSection
        id="featured"
        toneBg="#f5f5f7"
        renderCardTone="parchment"
        title="Sản phẩm nổi bật"
        subtitle="Được chọn lọc cho trải nghiệm mượt, hình ảnh rõ nét, thao tác nhanh."
        items_product={featured}
      />

      {/* 3) Sản phẩm phổ biến */}
      <ProductGridSection
        id="popular"
        toneBg="#f5f5f7"
        renderCardTone="parchment"
        title="Sản phẩm phổ biến"
        subtitle="Sản phẩm được nhiều người chọn — chất lượng ổn định, đáng tin cậy."
        items_product={popular}
      />

      {/* 4) Section tạo điểm nhấn */}
      <HighlightSection />
    </main>
  );
}

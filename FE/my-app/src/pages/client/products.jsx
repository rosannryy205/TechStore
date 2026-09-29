import React from "react";
import { useSearchParams } from "react-router-dom";
import Loading from "../../components/loading";

const SF_DISPLAY = "SF Pro Display, system-ui, -apple-system, sans-serif";
const SF_TEXT = "SF Pro Text, system-ui, -apple-system, sans-serif";

const API_BASE_URL = "http://localhost:3000/api";

// ======================
// Reusable UI: Product Card
// ======================
function ProductCard({ p }) {
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
          src={`../src/assets/${p.image}`}
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
            color: "#333333",
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

// ======================
// Main Page: Products.jsx
// - Render đúng theo slug category (cat) và brand (brand) ở FE
// - BE: /api/products/?category=<category_slug>&brand=<brand_slug?>
// ======================
export default function Products() {
  const PAGE_SIZE = 16;

  const [searchParams] = useSearchParams();

  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const [page, setPage] = React.useState(1);

  // Read query from FE Header:
  // - Header link: /products?cat=<category.slug>&brand=<brand.slug>
  const categorySlug = searchParams.get("cate");
  const brandSlug = searchParams.get("brand");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // BE cần "category" (bắt buộc). Nếu thiếu cat => BE sẽ trả [].
        const query = new URLSearchParams();
        if (categorySlug) query.set("category", categorySlug);
        if (brandSlug) query.set("brand", brandSlug);

        const res = await fetch(
          `${API_BASE_URL}/products/?${query.toString()}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const list = json?.data ?? [];

        // Map data BE -> data hiển thị cho ProductCard
        // BE include:
        // - brand (as "brand")
        // - variants (as "variants") (hiện chưa dùng cho card)
        // - images (as "images")
        const mapped = list.map((p) => {
          const firstImage = p.images?.[0] ?? null;

          // Ảnh: tùy BE trả field nào thì ưu tiên lần lượt
          const image =
            firstImage?.img_url ||
            firstImage?.image_url ||
            firstImage?.url ||
            firstImage?.path ||
            "";

          const productId = p.id ?? p._id;

          // Tagline: backend hiện trả description; nếu không có thì fallback slug
          const tagline = p.description || p.slug || "";

          // Link tới trang detail
          const href = productId
            ? `/product_detail?id=${productId}`
            : "/product_detail";

          return {
            id: productId,
            name: p.name,
            tagline,
            image,
            href,
            cta: "Xem chi tiết",
          };
        });

        setProducts(mapped);
        setPage(1); // reset trang khi đổi filter slug
      } catch {
        setError("Error fetching product data.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug, brandSlug]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));

  // Kẹp page an toàn khi render (thay cho effect setPage gây cascading renders)
  const safePage = Math.min(page, totalPages);

  const pageItems = React.useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return products.slice(start, end);
  }, [products, safePage]);

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

  if (error) {
    return (
      <section className="w-full" style={{ fontFamily: SF_TEXT }}>
        <div className="w-full px-4 py-8 bg-red-50 text-center text-red-700">
          {error}
        </div>
      </section>
    );
  }

  return (
    <main className="w-full">
      <section className="w-full" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
          {/* header */}
          <div className="max-w-245 mx-auto mb-8 text-center">
            <div
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#f5f5f7] border border-[#e0e0e0] px-4 py-2"
              style={{ fontFamily: SF_TEXT }}
            >
              <span className="text-[12px] font-semibold tracking-[0.231px] leading-none text-[#7a7a7a]">
                KẾT QUẢ
              </span>
              <span className="text-[14px] tracking-[-0.224px] text-[#1d1d1f]">
                {products.length} sản phẩm
              </span>
            </div>

            <h2
              className="mt-6 text-[28px] md:text-[34px] lg:text-[40px] font-semibold leading-[1.1] tracking-[-0.374px]"
              style={{ fontFamily: SF_DISPLAY }}
            >
              Danh sách sản phẩm
            </h2>
            <p
              className="mt-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#cccccc]"
              style={{ fontFamily: SF_TEXT }}
            >
              Mỗi trang hiển thị tối đa 16 sản phẩm — đồng bộ theo cat/brand từ
              Header.
            </p>
          </div>

          {/* grid */}
          <div className="max-w-360 mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {pageItems.map((p) => (
                <ProductCard key={p.id ?? p.href ?? p.name} p={p} />
              ))}
            </div>

            {products.length === 0 ? (
              <div
                className="text-center mt-14"
                style={{ fontFamily: SF_TEXT }}
              >
                <div className="text-[17px] tracking-[-0.374px] leading-[1.47] text-[#7a7a7a]">
                  Không có sản phẩm.
                </div>
              </div>
            ) : null}

            {/* pagination */}
            {products.length > PAGE_SIZE ? (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-full px-5.5 py-2.75 text-[17px] tracking-[-0.374px] leading-[1.47] transition-all"
                  style={{
                    fontFamily: SF_TEXT,
                    backgroundColor: page === 1 ? "#f0f0f0" : "#0066cc",
                    color: page === 1 ? "#7a7a7a" : "#ffffff",
                    opacity: page === 1 ? 0.85 : 1,
                    border: "none",
                  }}
                >
                  Trang trước
                </button>

                <div
                  className="rounded-full bg-[#f5f5f7] border border-[#e0e0e0] px-5 py-2"
                  style={{ fontFamily: SF_TEXT }}
                >
                  <span className="text-[14px] tracking-[-0.224px] text-[#1d1d1f]">
                    Trang {page} / {totalPages}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-full px-5.5 py-2.75 text-[17px] tracking-[-0.374px] leading-[1.47] transition-all"
                  style={{
                    fontFamily: SF_TEXT,
                    backgroundColor:
                      page === totalPages ? "#f0f0f0" : "#0066cc",
                    color: page === totalPages ? "#7a7a7a" : "#ffffff",
                    opacity: page === totalPages ? 0.85 : 1,
                    border: "none",
                  }}
                >
                  Trang sau
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

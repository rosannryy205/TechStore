import Banner from "@/components/banner";
import Loading from "@/components/loading";
import { SF_TEXT } from "@/constants/typography";
import { useHomeProducts } from "@/hooks/client/useHomeProducts";
import ProductGridSection from "@/components/client/home/productGridSection";
import CategoryRibbon from "@/components/client/home/categoryRibbon";
import HighlightSection from "@/components/client/home/highlightSection";

export default function Home() {
  const { newArrivals, featured, popular, loading, error } = useHomeProducts();

  if (loading) {
    return (
      <section
        className="w-full flex items-center justify-center"
        style={{ fontFamily: SF_TEXT, minHeight: "60vh" }}
      >
        <Loading
          variant="fullscreen"
          size="medium"
          text="Đang tải dữ liệu TechStore..."
          shouldShow={true}
          minDurationMs={500}
          maxDurationMs={2000}
        />
      </section>
    );
  }

  return (
    <main className="w-full" style={{ fontFamily: SF_TEXT }}>
      {/* ─── TẦNG 1: HERO SHOWCASE ─── */}
      <Banner />

      {/* ─── TẦNG 2: CATEGORY QUICK-NAV RIBBON ─── */}
      <CategoryRibbon />

      {/* Error Notice (nếu có lỗi fetch) */}
      {error && (
        <div className="max-w-360 mx-auto px-4 py-3 my-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        </div>
      )}

      {/* ─── TẦNG 3: FLAGSHIP SPOTLIGHT (KHỐI TỐI SANG TRỌNG #1d1d1f) ─── */}
      <ProductGridSection
        id="new-arrivals"
        toneBg="#1d1d1f"
        renderCardTone="dark"
        title="Sản phẩm mới ra mắt"
        subtitle="Đột phá công nghệ thế hệ mới — thiết kế nguyên khối tinh xảo, hiệu năng bứt phá mọi giới hạn."
        items_product={newArrivals}
      />

      {/* ─── TẦNG 4A: BENTO GRID - SẢN PHẨM NỔI BẬT (NỀN TRẮNG #ffffff) ─── */}
      <ProductGridSection
        id="featured"
        toneBg="#ffffff"
        renderCardTone="light"
        title="Sản phẩm nổi bật"
        subtitle="Lựa chọn hoàn hảo cho trải nghiệm đỉnh cao — màn hình sắc nét, camera chuẩn điện ảnh."
        items_product={featured}
      />

      {/* ─── TẦNG 4B: BENTO GRID - SẢN PHẨM PHỔ BIẾN (NỀN GIẤY #f5f5f7) ─── */}
      <ProductGridSection
        id="popular"
        toneBg="#f5f5f7"
        renderCardTone="parchment"
        title="Sản phẩm bán chạy nhất"
        subtitle="Được đông đảo khách hàng tin tưởng lựa chọn với mức giá tốt và chất lượng bền bỉ."
        items_product={popular}
      />

      {/* ─── TẦNG 5: TECHSTORE PERKS & TRADE-IN EDITORIAL BANNER ─── */}
      <HighlightSection />
    </main>
  );
}

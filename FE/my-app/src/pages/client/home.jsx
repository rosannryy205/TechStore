import Banner from "@/components/banner";
import Loading from "@/components/loading";
import { SF_TEXT } from "@/constants/typography";
import { useHomeProducts } from "@/hooks/client/useHomeProducts";
import ProductGridSection from "@/components/client/home/ProductGridSection";
import HighlightSection from "@/components/client/home/HighlightSection";

export default function Home() {
  const { newArrivals, featured, popular, loading, error } = useHomeProducts();

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
      <Banner />

      {error ? (
        <div className="w-full bg-red-50 border border-red-200 text-red-700 px-6 py-4 my-4">
          {error}
        </div>
      ) : null}

      <ProductGridSection
        id="new-arrivals"
        toneBg="#ffffff"
        renderCardTone="light"
        title="Sản phẩm mới ra mắt"
        subtitle="Những lựa chọn vừa cập nhật — thiết kế tinh gọn, hiệu năng sẵn sàng."
        items_product={newArrivals}
      />

      <ProductGridSection
        id="featured"
        toneBg="#f5f5f7"
        renderCardTone="parchment"
        title="Sản phẩm nổi bật"
        subtitle="Được chọn lọc cho trải nghiệm mượt, hình ảnh rõ nét, thao tác nhanh."
        items_product={featured}
      />

      <ProductGridSection
        id="popular"
        toneBg="#f5f5f7"
        renderCardTone="parchment"
        title="Sản phẩm phổ biến"
        subtitle="Sản phẩm được nhiều người chọn — chất lượng ổn định, đáng tin cậy."
        items_product={popular}
      />

      <HighlightSection />
    </main>
  );
}

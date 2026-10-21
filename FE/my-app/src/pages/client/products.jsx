import { useState } from "react";
import Loading from "@/components/loading";
import { SF_TEXT } from "@/constants/typography";
import { useProducts } from "@/hooks/client/useProducts";
import ProductListHeader from "@/components/client/products/productListHeader";
import ProductFilter from "@/components/client/products/productFilter";
import ProductGrid from "@/components/client/products/productGrid";
import ProductPagination from "@/components/client/products/productPagination";

export default function Products() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const {
    pageItems,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    categories,
    activeCategory,
    activeBrand,
    activePrice,
    activeSale,
    activeSort,
    activeFiltersCount,
    setFilter,
    resetFilters,
    setPage,
  } = useProducts();

  if (loading) {
    return (
      <section
        className="w-full flex items-center justify-center bg-white"
        style={{ fontFamily: SF_TEXT, minHeight: "65vh" }}
      >
        <Loading
          variant="fullscreen"
          size="medium"
          text="Đang tải danh sách sản phẩm..."
          shouldShow={true}
          minDurationMs={400}
          maxDurationMs={2000}
        />
      </section>
    );
  }

  if (error) {
    return (
      <main className="w-full bg-white py-16" style={{ fontFamily: SF_TEXT }}>
        <div className="max-w-360 mx-auto px-4">
          <div className="p-8 bg-red-50 border border-red-200 text-center rounded-2xl">
            <h3 className="text-red-800 font-semibold text-lg mb-2">
              Đã xảy ra lỗi
            </h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 cursor-pointer"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-[#fbfbfd] min-h-screen" style={{ fontFamily: SF_TEXT }}>
      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        {/* Header với tiêu đề, breadcrumbs, search count và sort */}
        <ProductListHeader
          count={totalCount}
          categories={categories}
          activeCategory={activeCategory}
          activeBrand={activeBrand}
          activePrice={activePrice}
          activeSale={activeSale}
          activeSort={activeSort}
          activeCount={activeFiltersCount}
          onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
          onSortChange={(sortId) => setFilter("sort", sortId)}
          onRemoveFilter={(key) => setFilter(key, "all")}
          onResetAll={resetFilters}
        />

        {/* Khung nội dung chính: Sidebar Lọc + Lưới sản phẩm */}
        <div className="flex gap-8 items-start">
          {/* Bộ lọc Desktop & Mobile Drawer */}
          <ProductFilter
            categories={categories}
            activeCategory={activeCategory}
            activeBrand={activeBrand}
            activePrice={activePrice}
            activeSale={activeSale}
            activeCount={activeFiltersCount}
            onSelectCategory={(slug) => setFilter("cate", slug)}
            onSelectBrand={(slug) => setFilter("brand", slug)}
            onSelectPrice={(priceId) => setFilter("price", priceId)}
            onToggleSale={(val) => setFilter("sale", val)}
            onReset={resetFilters}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* Lưới sản phẩm & Phân trang */}
          <div className="flex-1 min-w-0">
            <ProductGrid
              products={pageItems}
              onResetFilters={resetFilters}
            />

            <ProductPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

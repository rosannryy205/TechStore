import { useState } from "react";
import { SF_TEXT } from "@/constants/typography";
import { useProducts } from "@/hooks/client/useProducts";
import ProductListHeader from "@/components/client/products/ProductListHeader";
import ProductFilter from "@/components/client/products/productFilter";
import ProductGrid from "@/components/client/products/ProductGrid";
import ProductPagination from "@/components/client/products/ProductPagination";
import ProductSearchForm from "@/components/client/search/productSearchForm";

/** Giữ form/filter khi tải hoặc lỗi; chỉ vùng kết quả thay đổi theo request. */
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
    categoryError,
    activeQuery,
    activeCategory,
    activeBrand,
    activePrice,
    activeSale,
    activeSort,
    activeFiltersCount,
    setFilter,
    resetFilters,
    clearQuery,
    setPage,
    retry,
  } = useProducts();

  return (
    <main
      className="min-h-screen w-full bg-[#fbfbfd]"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <ProductListHeader
          count={loading ? "…" : totalCount}
          activeQuery={activeQuery}
          categories={categories}
          activeCategory={activeCategory}
          activeBrand={activeBrand}
          activePrice={activePrice}
          activeSale={activeSale}
          activeSort={activeSort}
          activeCount={activeFiltersCount}
          onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
          onSortChange={(id) => setFilter("sort", id)}
          onRemoveFilter={(key) =>
            setFilter(key, key === "sale" ? false : "all")
          }
          onResetAll={resetFilters}
        />
        {/* key chỉ đổi khi q đã submit/Back; khách vẫn gõ tiếp được khi đổi filter. */}
        <ProductSearchForm
          key={activeQuery}
          initialQuery={activeQuery}
          onSearch={(query) => setFilter("q", query)}
          onClear={clearQuery}
        />
        {categoryError && (
          <div
            role="alert"
            className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"
          >
            {categoryError}{" "}
            <button type="button" onClick={retry} className="underline">
              Thử lại
            </button>
          </div>
        )}
        <div className="flex items-start gap-8">
          <ProductFilter
            categories={categories}
            activeCategory={activeCategory}
            activeBrand={activeBrand}
            activePrice={activePrice}
            activeSale={activeSale}
            activeCount={activeFiltersCount}
            onSelectCategory={(slug) => setFilter("cate", slug)}
            onSelectBrand={(slug) => setFilter("brand", slug)}
            onSelectPrice={(id) => setFilter("price", id)}
            onToggleSale={(value) => setFilter("sale", value)}
            onReset={resetFilters}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />
          <div className="min-w-0 flex-1" aria-busy={loading}>
            {loading ? (
              <div
                role="status"
                className="flex min-h-64 items-center justify-center text-zinc-600"
              >
                Đang tải sản phẩm…
              </div>
            ) : error ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800"
              >
                <p>{error}</p>
                <button
                  type="button"
                  onClick={retry}
                  className="mt-4 rounded-full bg-red-700 px-5 py-2 text-white"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={pageItems}
                  query={activeQuery}
                  onClearQuery={activeQuery ? clearQuery : undefined}
                  onResetFilters={activeFiltersCount ? resetFilters : undefined}
                />
                <ProductPagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

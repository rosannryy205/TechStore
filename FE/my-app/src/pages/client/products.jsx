import Loading from "@/components/loading";
import { SF_TEXT } from "@/constants/typography";
import { useProducts } from "@/hooks/client/useProducts";
import ProductListHeader from "@/components/client/products/productListHeader";
import ProductGrid from "@/components/client/products/productGrid";
import ProductPagination from "@/components/client/products/productPagination";

export default function Products() {
  const { products, pageItems, loading, error, page, totalPages, setPage } =
    useProducts();

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
      <section className="w-full bg-white">
        <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
          <ProductListHeader count={products.length} />

          <div className="max-w-360 mx-auto">
            <ProductGrid products={pageItems} />
            <ProductPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

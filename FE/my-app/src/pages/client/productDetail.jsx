import Notification from "@/components/notification";
import { CommentSection } from "@/components/comments";
import { useAuth } from "@/contexts/authContext";
import { SF_TEXT } from "@/constants/typography";
import { useProductDetail } from "@/hooks/client/useProductDetail";
import ProductGallery from "@/components/client/productDetail/ProductGallery";
import ProductInfo from "@/components/client/productDetail/ProductInfo";
import ProductActions from "@/components/client/productDetail/ProductActions";
import ProductDescription from "@/components/client/productDetail/ProductDescription";
import RelatedProducts from "@/components/client/productDetail/RelatedProducts";

export default function ProductDetail() {
  const { user, isAuthenticated } = useAuth();
  const detail = useProductDetail();

  if (detail.loading) {
    return <section className="w-full py-16 text-center" style={{ fontFamily: SF_TEXT }}>Loading...</section>;
  }

  if (detail.error) {
    return <section className="w-full py-8 bg-red-50 text-center text-red-700" style={{ fontFamily: SF_TEXT }}>{detail.error}</section>;
  }

  return (
    <section aria-label="Chi tiết sản phẩm" className="w-full" style={{ fontFamily: SF_TEXT }}>
      <div className="min-h-svh bg-white overflow-hidden">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 pt-8 sm:pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-8 lg:gap-10">
            <ProductGallery image={detail.mainImage} productName={detail.product?.name} />
            <div className="w-full">
              <ProductInfo
                product={detail.product}
                displayPrice={detail.displayPrice}
                variantOptions={detail.variantOptions}
                selected={detail.selected}
                selectedVariant={detail.selectedVariant}
                onSelectOption={detail.selectOption}
              />
              <ProductActions
                selectedVariant={detail.selectedVariant}
                inCart={detail.inCart}
                isPosting={detail.isPosting}
                saved={detail.saved}
                onAddToCart={detail.handleAddToCart}
                onToggleSave={detail.toggleSave}
              />
            </div>
          </div>
        </div>
      </div>

      <ProductDescription
        productName={detail.product?.name}
        description={detail.product?.description}
      />

      <div className="bg-white border-t border-[#e0e0e0]">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <CommentSection
            productId={detail.productId}
            isAuthenticated={isAuthenticated}
            user={user}
            onRequireLogin={detail.requireLogin}
          />
        </div>
      </div>

      <RelatedProducts products={detail.relatedProducts} error={detail.relatedError} />

      <Notification
        isOpen={!!detail.notification}
        type={detail.notification?.type ?? "success"}
        message={detail.notification?.message ?? ""}
        actionLabel={detail.notification?.actionLabel}
        onAction={detail.notification?.onAction}
        onClose={detail.closeNotification}
      />
    </section>
  );
}

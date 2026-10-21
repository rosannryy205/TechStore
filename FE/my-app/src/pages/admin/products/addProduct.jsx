import Notification from "@/components/notification";
import { useAddProduct } from "@/hooks/admin/useAddProduct";
import { ProductBasicInfo } from "@/components/admin/products/add/productBasicInfo";
import { ProductVariantsSection } from "@/components/admin/products/add/productVariantsSection";
import { ProductImagesUploader } from "@/components/admin/products/add/productImagesUploader";
import { ProductFormActions } from "@/components/admin/products/add/productFormActions";
import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";

export default function AddProduct() {
  const form = useAddProduct();

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[#f5f5f7]">
      <Notification
        isOpen={form.notification.isOpen}
        message={form.notification.message}
        type={form.notification.type}
        onClose={form.closeNotification}
      />
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1
            className="text-[34px] font-semibold text-[#1d1d1f]"
            style={{ fontFamily: SF_DISPLAY, letterSpacing: "-0.374px", lineHeight: 1.1 }}
          >
            Add New Product
          </h1>
          <p
            className="mt-1 text-[17px] text-[#7a7a7a]"
            style={{ fontFamily: SF_TEXT, letterSpacing: "-0.374px" }}
          >
            Create a new product with details and variants.
          </p>
        </div>

        <form onSubmit={form.handleSubmit} className="space-y-8">
          <ProductBasicInfo
            productData={form.productData}
            categories={form.categories}
            brands={form.brands}
            onChange={form.handleInputChange}
          />

          <ProductVariantsSection
            variantAttributes={form.variantAttributes}
            productAttributes={form.productAttributes}
            onAddAttribute={form.handleAddProductAttribute}
            onChangeAttribute={form.handleProductAttributeChange}
            onRemoveAttribute={form.handleRemoveProductAttribute}
            onGenerateVariants={form.handleGenerateVariants}
            variants={form.variants}
            bulkPrice={form.bulkPrice}
            onBulkPriceChange={form.setBulkPrice}
            bulkSalePrice={form.bulkSalePrice}
            onBulkSalePriceChange={form.setBulkSalePrice}
            bulkStock={form.bulkStock}
            onBulkStockChange={form.setBulkStock}
            onApplyBulk={form.handleBulkApply}
            onVariantChange={form.handleVariantChange}
            onRemoveVariant={form.handleRemoveVariant}
          />

          <ProductImagesUploader
            images={form.images}
            onImageChange={form.handleImageChange}
            onRemoveImage={form.handleRemoveImage}
          />

          <ProductFormActions
            submitting={form.submitting}
            onCancel={form.onCancel}
          />
        </form>
      </div>
    </div>
  );
}

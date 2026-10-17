import { ProductAttributesBuilder } from "./ProductAttributesBuilder";
import { ProductBulkSettings } from "./ProductBulkSettings";
import { ProductVariantMatrixTable } from "./ProductVariantMatrixTable";

export function ProductVariantsSection({
  variantAttributes,
  productAttributes,
  onAddAttribute,
  onChangeAttribute,
  onRemoveAttribute,
  onGenerateVariants,
  variants,
  bulkPrice,
  onBulkPriceChange,
  bulkSalePrice,
  onBulkSalePriceChange,
  bulkStock,
  onBulkStockChange,
  onApplyBulk,
  onVariantChange,
  onRemoveVariant,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <ProductAttributesBuilder
        variantAttributes={variantAttributes}
        productAttributes={productAttributes}
        onAddAttribute={onAddAttribute}
        onChangeAttribute={onChangeAttribute}
        onRemoveAttribute={onRemoveAttribute}
        onGenerateVariants={onGenerateVariants}
      />

      {variants.length > 0 && (
        <ProductBulkSettings
          bulkPrice={bulkPrice}
          onBulkPriceChange={onBulkPriceChange}
          bulkSalePrice={bulkSalePrice}
          onBulkSalePriceChange={onBulkSalePriceChange}
          bulkStock={bulkStock}
          onBulkStockChange={onBulkStockChange}
          onApply={onApplyBulk}
        />
      )}

      <ProductVariantMatrixTable
        variants={variants}
        onVariantChange={onVariantChange}
        onRemoveVariant={onRemoveVariant}
      />
    </div>
  );
}

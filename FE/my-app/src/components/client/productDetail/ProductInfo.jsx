import { SF_DISPLAY } from "@/constants/typography";
import { formatVnd } from "@/utils/formatCurrency";
import ProductOptionGroup from "./productOptionGroup";

export default function ProductInfo({
  product,
  displayPrice,
  variantOptions,
  selected,
  selectedVariant,
  onSelectOption,
}) {
  const categoryName = product?.category || product?.brand?.name || "";
  const description = product?.description || "";
  const shortDescription = description
    ? description.slice(0, 120) + (description.length > 120 ? "..." : "")
    : "";

  return (
    <div className="pt-4 sm:pt-6 lg:pt-2">
      <div className="text-[12px] font-normal tracking-[-0.12px] leading-none text-[#7a7a7a] mb-3">
        {categoryName}
      </div>

      <h1
        className="text-[40px] sm:text-[44px] font-semibold tracking-[-0.374px] leading-[1.1] text-[#1d1d1f]"
        style={{ fontFamily: SF_DISPLAY }}
      >
        {product?.name || "Sản phẩm"}
      </h1>

      {shortDescription ? (
        <p className="text-[17px] font-normal tracking-[-0.374px] leading-[1.47] text-[#1d1d1f] mt-3">
          {shortDescription}
        </p>
      ) : null}

      <div className="mt-7">
        <div className="text-[12px] font-semibold tracking-[0.231px] leading-none text-[#7a7a7a]">
          GIÁ
        </div>
        <div className="text-[34px] font-semibold tracking-[-0.374px] leading-[1.47] text-[#1d1d1f] mt-2">
          {displayPrice ? formatVnd(displayPrice) : "Liên hệ"}
        </div>
      </div>

      <div className="mt-8">
        {variantOptions.map((attr, idx) => (
          <div key={attr.key} className={idx > 0 ? "mt-6" : ""}>
            <ProductOptionGroup
              label={attr.label}
              name={attr.label}
              items={attr.options}
              selectedId={selected[attr.key]}
              onSelect={(optionId) => onSelectOption(attr.key, optionId)}
            />
          </div>
        ))}

        <div className="mt-4 text-[14px] text-[#1d1d1f]">
          {selectedVariant && typeof selectedVariant.stock === "number" ? (
            <span className="text-[#7a7a7a]">
              Còn lại:{" "}
              <b className="text-[#1d1d1f]">{selectedVariant.stock}</b>
            </span>
          ) : (
            Object.keys(selected).length > 0 &&
            !selectedVariant && (
              <span className="text-red-500 font-medium">
                Phiên bản này hiện không khả dụng
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

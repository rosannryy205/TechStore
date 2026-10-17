import { SF_DISPLAY } from "@/constants/typography";
import { formatVnd } from "@/utils/formatCurrency";
import { resolveProductImageUrl } from "@/utils/imageHelper";

export default function OrderItemsSummary({ items = [], totalAmount, subtotal, shippingFee }) {
  return (
    <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] p-6 sm:p-8 mb-6">
      <h2
        className="text-[21px] font-semibold tracking-[-0.374px] mb-6"
        style={{ fontFamily: SF_DISPLAY }}
      >
        Order Summary
      </h2>

      <div className="divide-y divide-[#e0e0e0]">
        {items.map((item) => {
          const rawImg =
            item.variant?.img_url ||
            item.variant?.image_url ||
            item.variant?.product?.images?.[0]?.img_url ||
            item.variant?.product?.images?.[0]?.image_url;
          const imgUrl = resolveProductImageUrl(rawImg);

          const variantDesc = [
            item.variant?.color,
            item.variant?.ram,
            item.variant?.storage,
          ]
            .filter(Boolean)
            .join(" • ");

          return (
            <div key={item.id} className="py-4 flex gap-4 items-center">
              <div className="w-16 h-16 bg-[#f5f5f7] rounded-lg p-2 shrink-0 border border-[#e0e0e0] flex items-center justify-center">
                <img
                  src={imgUrl}
                  alt={item.variant?.product?.name || "Product"}
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-[#1d1d1f] truncate">
                  {item.variant?.product?.name || "Product"}
                </div>
                {variantDesc && (
                  <div className="text-[13px] text-[#7a7a7a] truncate mt-0.5">
                    {variantDesc}
                  </div>
                )}
                <div className="text-[13px] text-[#7a7a7a] mt-1">
                  Qty: {item.quantity}
                </div>
              </div>

              <div className="text-[15px] font-semibold text-[#1d1d1f] shrink-0">
                {formatVnd(item.total || Number(item.price) * Number(item.quantity))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 pt-6 border-t border-[#e0e0e0] text-[15px] mt-2">
        <div className="flex justify-between items-center text-[#7a7a7a]">
          <span>Subtotal</span>
          <span className="font-semibold text-[#1d1d1f]">
            {formatVnd(subtotal || totalAmount)}
          </span>
        </div>
        <div className="flex justify-between items-center text-[#7a7a7a]">
          <span>Shipping</span>
          <span className="font-semibold text-[#1d1d1f]">
            {Number(shippingFee) > 0 ? formatVnd(shippingFee) : "FREE"}
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-[#e0e0e0] text-[18px]">
          <span className="font-semibold text-[#1d1d1f]">Total</span>
          <span className="font-semibold text-[#1d1d1f]">
            {formatVnd(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}

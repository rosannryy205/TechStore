import { SF_DISPLAY } from "@/constants/typography";
import { formatVnd } from "@/utils/formatCurrency";
import { resolveProductImageUrl } from "@/utils/imageHelper";

export default function CheckoutOrderSummary({
  cartItems,
  cartTotal,
  isSubmitting,
}) {
  return (
    <div className="w-full lg:w-96 xl:w-105 shrink-0">
      <div className="bg-[#f5f5f7] rounded-2xl p-6 sm:p-8">
        <h2
          className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px] mb-6"
          style={{ fontFamily: SF_DISPLAY }}
        >
          In Your Bag
        </h2>

        {/* Item List */}
        <div className="divide-y divide-[#e0e0e0] max-h-96 overflow-y-auto mb-6 pr-2">
          {cartItems.map((item) => {
            const imgUrl = resolveProductImageUrl(item.image);
            return (
              <div key={item.id} className="py-4 flex gap-4 items-center">
                <div className="w-16 h-16 bg-white rounded-lg p-2 shrink-0 border border-[#e0e0e0] flex items-center justify-center">
                  <img
                    src={imgUrl}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-[#1d1d1f] truncate">
                    {item.name}
                  </div>
                  <div className="text-[13px] text-[#7a7a7a] truncate mt-0.5">
                    {item.tagline}
                  </div>
                  <div className="text-[13px] text-[#7a7a7a] mt-1">
                    Qty: {item.quantity}
                  </div>
                </div>
                <div className="text-[15px] font-semibold text-[#1d1d1f] shrink-0">
                  {formatVnd(item.price * item.quantity)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="space-y-3 pt-6 border-t border-[#e0e0e0] text-[15px]">
          <div className="flex justify-between items-center text-[#7a7a7a]">
            <span>Subtotal</span>
            <span className="font-semibold text-[#1d1d1f]">
              {formatVnd(cartTotal)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[#7a7a7a]">
            <span>Shipping</span>
            <span className="font-semibold text-[#1d1d1f]">FREE</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-[#e0e0e0] text-[18px]">
            <span className="font-semibold text-[#1d1d1f]">Total</span>
            <span className="font-semibold text-[#1d1d1f]">
              {formatVnd(cartTotal)}
            </span>
          </div>
        </div>

        {/* Place Order CTA Button */}
        <button
          type="submit"
          form="checkout-form"
          disabled={isSubmitting || cartItems.length === 0}
          className="w-full mt-8 bg-[#0066cc] text-white py-3.5 px-6 rounded-full text-[17px] font-normal hover:bg-[#0071e3] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}

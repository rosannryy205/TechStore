import { SF_DISPLAY } from "@/constants/typography";
import { formatVnd } from "@/utils/formatCurrency";

export default function CartSummary({ cartTotal, onCheckout, isDisabled }) {
  return (
    <div className="mt-10 md:mt-16 ml-auto md:w-1/2 lg:w-5/12 fade-in-up">
      <div className="flex justify-between items-center py-4 border-b border-[#e0e0e0]">
        <span className="text-[17px] font-normal">Subtotal</span>
        <span className="text-[17px] font-semibold">{formatVnd(cartTotal)}</span>
      </div>
      <div className="flex justify-between items-center py-4 border-b border-[#e0e0e0]">
        <span className="text-[17px] font-normal">Shipping</span>
        <span className="text-[17px] font-semibold">FREE</span>
      </div>
      <div className="flex justify-between items-center py-6">
        <span
          className="text-[24px] md:text-[28px] font-semibold leading-[1.14] tracking-[0.196px]"
          style={{ fontFamily: SF_DISPLAY }}
        >
          Total
        </span>
        <span
          className="text-[24px] md:text-[28px] font-semibold leading-[1.14] tracking-[0.196px]"
          style={{ fontFamily: SF_DISPLAY }}
        >
          {formatVnd(cartTotal)}
        </span>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onCheckout}
          className="w-full sm:w-auto bg-[#0066cc] text-[#ffffff] px-7 py-3.5 rounded-full text-[18px] font-normal hover:bg-[#0071e3] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          aria-label="Check out your bag"
          disabled={isDisabled}
        >
          Check Out
        </button>
      </div>
    </div>
  );
}

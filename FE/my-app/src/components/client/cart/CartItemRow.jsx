import Loading from "@/components/loading";
import { SF_DISPLAY } from "@/constants/typography";
import { formatVnd } from "@/utils/formatCurrency";
import { resolveProductImageUrl } from "@/utils/imageHelper";

export default function CartItemRow({
  item,
  index,
  hasMounted,
  updatingItemId,
  onChangeQuantity,
  onRemoveItem,
}) {
  const imageUrl = resolveProductImageUrl(item.image);

  return (
    <div
      className={`flex flex-col md:flex-row items-center md:items-start gap-8 py-10 border-b border-[#e0e0e0] ${
        !hasMounted ? "animate-fade-in" : ""
      }`}
      style={!hasMounted ? { animationDelay: `${index * 100}ms` } : undefined}
    >
      <div className="w-48 h-48 shrink-0">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>

      <div className="flex-1 w-full flex flex-col md:flex-row justify-between gap-6">
        <div className="flex flex-col text-center md:text-left">
          <h2
            className="text-[24px] md:text-[28px] font-semibold leading-[1.14] tracking-[0.196px] mb-1"
            style={{ fontFamily: SF_DISPLAY }}
          >
            {item.name}
          </h2>
          <p className="text-[17px] text-[#7a7a7a] font-normal">{item.tagline}</p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-4">
          <div
            className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px]"
            style={{ fontFamily: SF_DISPLAY }}
          >
            {formatVnd(item.price * item.quantity)}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f7] text-[20px] text-[#1d1d1f] hover:opacity-100 opacity-80 transition-opacity disabled:opacity-40 cursor-pointer"
                aria-label="Decrease quantity"
                disabled={item.quantity <= 1 || updatingItemId === item.id}
                onClick={() => onChangeQuantity(item, -1)}
              >
                -
              </button>

              <span className="text-[17px] font-semibold w-8 text-center relative flex items-center justify-center">
                {updatingItemId === item.id ? (
                  <span className="inline-flex items-center justify-center">
                    <Loading variant="inline" size="small" />
                  </span>
                ) : (
                  item.quantity
                )}
              </span>

              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f7] text-[20px] text-[#1d1d1f] hover:opacity-100 opacity-80 transition-opacity disabled:opacity-40 cursor-pointer"
                aria-label="Increase quantity"
                disabled={updatingItemId === item.id}
                onClick={() => onChangeQuantity(item, +1)}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="text-[#0066cc] text-[17px] font-normal hover:underline opacity-80 transition-opacity disabled:opacity-40 cursor-pointer"
              disabled={updatingItemId === item.id}
              onClick={() => onRemoveItem(item)}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

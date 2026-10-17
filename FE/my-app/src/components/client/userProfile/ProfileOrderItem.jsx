import { ORDER_STATUS_MAP } from "@/constants/orderStatus";
import { formatVnd } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

export default function ProfileOrderItem({
  order,
  compact = false,
  cancellingId,
  onCancel,
}) {
  const statusInfo = ORDER_STATUS_MAP[order.order_status] || {
    label: order.order_status,
    color: "text-[#7a7a7a]",
    bg: "bg-[#f5f5f7]",
  };

  const firstItem = order.items?.[0];
  const itemName = firstItem?.variant?.product?.name || "Product";
  const itemVariant = [
    firstItem?.variant?.color,
    firstItem?.variant?.ram,
    firstItem?.variant?.storage,
  ]
    .filter(Boolean)
    .join(" • ");
  const itemCount = order.items?.length || 0;

  if (compact) {
    return (
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-5 bg-[#f5f5f7] rounded-[11px] border border-transparent hover:border-[#e0e0e0] transition-colors mb-4 last:mb-0">
        <div className="flex-1 min-w-0">
          <div className="text-[17px] font-semibold mb-1 tracking-[-0.374px] truncate">
            {itemName}
            {itemCount > 1 ? ` +${itemCount - 1} more` : ""}
          </div>
          {itemVariant && (
            <div className="text-[14px] text-[#7a7a7a] mb-1">{itemVariant}</div>
          )}
          <div className="text-[14px] text-[#7a7a7a] tracking-[-0.224px]">
            Order {order.order_code || `#${order.id}`} •{" "}
            {formatDate(order.created_at)}
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-1">
          <span className="text-[17px] font-semibold tracking-[-0.374px]">
            {formatVnd(order.total_amount)}
          </span>
          <span
            className={`inline-block text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6 border border-[#e0e0e0] rounded-[18px] hover:border-[#0066cc]/30 hover:shadow-[0_4px_12px_rgba(0,102,204,0.06)] transition-all">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <span className="text-[15px] font-semibold text-[#1d1d1f]">
            Order {order.order_code || `#${order.id}`}
          </span>
          <span className="text-[14px] text-[#7a7a7a] ml-2">
            {formatDate(order.created_at)}
          </span>
        </div>
        <span
          className={`inline-block text-[12px] font-semibold px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color} self-start sm:self-auto`}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {order.items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-b-0"
          >
            <div className="flex-1 min-w-0">
              <span className="text-[15px] font-medium text-[#1d1d1f]">
                {item.variant?.product?.name || "Product"}
              </span>
              {item.variant?.color && (
                <span className="text-[13px] text-[#7a7a7a] ml-1">
                  (
                  {[item.variant.color, item.variant.ram, item.variant.storage]
                    .filter(Boolean)
                    .join(" • ")}
                  )
                </span>
              )}
            </div>
            <div className="text-right shrink-0 ml-4">
              <div className="text-[14px] font-medium text-[#1d1d1f]">
                {formatVnd(item.total)}
              </div>
              <div className="text-[12px] text-[#7a7a7a]">
                {item.quantity} x {formatVnd(item.price)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 pt-2 border-t border-[#f0f0f0]">
        <div className="flex justify-between text-[14px]">
          <span className="text-[#7a7a7a]">Subtotal</span>
          <span>{formatVnd(order.subtotal)}</span>
        </div>
        {Number(order.shipping_fee) > 0 && (
          <div className="flex justify-between text-[14px]">
            <span className="text-[#7a7a7a]">Shipping</span>
            <span>{formatVnd(order.shipping_fee)}</span>
          </div>
        )}
        <div className="flex justify-between text-[17px] font-semibold pt-2">
          <span>Total</span>
          <span>{formatVnd(order.total_amount)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-[#7a7a7a] pt-2 border-t border-[#f0f0f0]">
        <span>Payment: {order.payment_method?.toUpperCase() || "N/A"}</span>
        <span>
          Payment status:{" "}
          <span
            className={
              order.payment_status === "paid"
                ? "text-[#1d8a3d]"
                : order.payment_status === "failed"
                  ? "text-[#e30000]"
                  : "text-[#ca7600]"
            }
          >
            {order.payment_status}
          </span>
        </span>
        {order.address && <span>Ship to: {order.address}</span>}
      </div>

      {order.order_status === "pending" && (
        <div className="pt-2 border-t border-[#f0f0f0] flex justify-end">
          <button
            type="button"
            disabled={cancellingId === order.id}
            onClick={() => onCancel(order.id)}
            className="text-[14px] text-[#e30000] hover:underline disabled:opacity-40 cursor-pointer"
          >
            {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      )}
    </div>
  );
}

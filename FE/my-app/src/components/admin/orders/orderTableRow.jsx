import { EyeIcon, CheckIcon } from "@heroicons/react/24/outline";
import { formatVnd } from "@/utils/formatCurrency";
import { formatDateVi } from "@/utils/formatDate";
import {
  ORDER_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  PAYMENT_METHOD_MAP,
} from "@/constants/orderStatus";

export default function OrderTableRow({
  order,
  isSelected = false,
  onToggleSelect,
  onOpenDetail,
  onQuickAdvance,
}) {
  const firstItem = order.items && order.items[0];
  const otherItemsCount = order.items ? order.items.length - 1 : 0;

  const statusConfig = ORDER_STATUS_MAP[order.order_status] || {
    label: order.order_status,
    color: "text-gray-600",
    bg: "bg-gray-100",
    dot: "bg-gray-400",
  };

  const paymentConfig = PAYMENT_STATUS_MAP[order.payment_status] || {
    label: order.payment_status,
    color: "text-gray-600",
    bg: "bg-gray-100",
    dot: "bg-gray-400",
  };

  const methodConfig = PAYMENT_METHOD_MAP[order.payment_method] || {
    shortLabel: (order.payment_method || "").toUpperCase(),
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200",
  };

  return (
    <tr
      className={[
        "transition-colors duration-100 hover:bg-[#fbfbfd]",
        isSelected ? "bg-blue-50/40" : "",
      ].join(" ")}
    >
      {/* Checkbox */}
      <td className="py-4 pl-4 pr-3 sm:pl-6 w-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onToggleSelect(order.id, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#0066cc] focus:ring-[#0066cc] cursor-pointer"
        />
      </td>

      {/* Cột 1: Mã đơn & Ngày giờ */}
      <td className="py-4 px-3 text-left">
        <button
          type="button"
          onClick={() => onOpenDetail(order)}
          className="text-left font-semibold text-[#1d1d1f] hover:text-[#0066cc] transition-colors cursor-pointer text-[14px]"
        >
          {order.order_code}
        </button>
        <p className="text-xs text-gray-400 mt-0.5">{formatDateVi(order.created_at)}</p>
      </td>

      {/* Cột 2: Khách hàng */}
      <td className="py-4 px-3 text-left">
        <div className="font-medium text-[#1d1d1f] text-[14px]">{order.receiver_name}</div>
        <div className="text-xs text-gray-500 font-mono mt-0.5">{order.receiver_phone}</div>
      </td>

      {/* Cột 3: Mặt hàng tóm tắt */}
      <td className="py-4 px-3 text-left">
        {firstItem ? (
          <div className="flex items-center gap-2.5">
            <img
              src={firstItem.image}
              alt={firstItem.product_name}
              className="h-10 w-10 rounded-lg object-cover ring-1 ring-black/5 bg-gray-50 shrink-0"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&auto=format&fit=crop&q=80";
              }}
            />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[#1d1d1f] truncate max-w-[200px]">
                {firstItem.product_name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-500">
                  {firstItem.attributes?.map((a) => a.value).join(" • ") || "Mặc định"}
                </span>
                <span className="text-xs text-gray-400">x{firstItem.quantity}</span>
                {otherItemsCount > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-gray-100 text-[11px] font-medium text-gray-600">
                    +{otherItemsCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>

      {/* Cột 4: Tổng tiền & Phương thức */}
      <td className="py-4 px-3 text-left">
        <div className="font-semibold text-[#1d1d1f] text-[14px]">
          {formatVnd(order.total_amount)}
        </div>
        <span
          className={[
            "inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium mt-1 border",
            methodConfig.bg,
            methodConfig.color,
            methodConfig.border,
          ].join(" ")}
        >
          {methodConfig.shortLabel}
        </span>
      </td>

      {/* Cột 5: Trạng thái thanh toán */}
      <td className="py-4 px-3 text-left">
        <span
          className={[
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            paymentConfig.bg,
            paymentConfig.color,
          ].join(" ")}
        >
          <span className={["h-1.5 w-1.5 rounded-full", paymentConfig.dot].join(" ")} />
          {paymentConfig.label}
        </span>
      </td>

      {/* Cột 6: Trạng thái đơn hàng */}
      <td className="py-4 px-3 text-left">
        <span
          className={[
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
            statusConfig.bg,
            statusConfig.color,
          ].join(" ")}
        >
          <span className={["h-1.5 w-1.5 rounded-full", statusConfig.dot].join(" ")} />
          {statusConfig.label}
        </span>
      </td>

      {/* Cột 7: Thao tác */}
      <td className="py-4 pl-3 pr-4 sm:pr-6 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1.5">
          {/* Nút hành động nhanh 1-click nếu là pending */}
          {order.order_status === "pending" && (
            <button
              type="button"
              onClick={() => onQuickAdvance(order)}
              title="Xác nhận đơn ngay (1-Click)"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#0066cc] bg-[#e8f4ff] hover:bg-[#d0e8ff] transition-colors cursor-pointer"
            >
              <CheckIcon className="h-3.5 w-3.5 stroke-2" />
              <span>Xác nhận</span>
            </button>
          )}

          {/* Nút Xem chi tiết */}
          <button
            type="button"
            onClick={() => onOpenDetail(order)}
            title="Xem chi tiết đơn hàng"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:text-[#0066cc] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <EyeIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Chi tiết</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

import {
  ChevronRightIcon,
  ArrowPathIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { ORDER_STATUS_MAP } from "@/constants/orderStatus";
import { formatVnd } from "@/utils/formatCurrency";
import { formatDateVi } from "@/utils/formatDate";
import { SF_DISPLAY } from "@/constants/typography";
import OrderTrackingStepper from "./OrderTrackingStepper";

export default function ProfileOrderCard({
  order,
  onViewDetails,
  onCancel,
  onReorder,
  cancellingId,
  reorderingId,
}) {
  const statusInfo = ORDER_STATUS_MAP[order.order_status] || {
    label: order.order_status,
    color: "text-zinc-600",
    bg: "bg-zinc-100",
    border: "border-zinc-200",
  };

  const canCancel = order.order_status === "pending";
  const canReorder = order.order_status === "completed" || order.order_status === "cancelled";

  return (
    <div className="bg-white rounded-[24px] border border-zinc-200/80 p-6 sm:p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-zinc-300 hover:shadow-[0_24px_48px_-15px_rgba(0,0,0,0.08)] transition-all flex flex-col gap-5">
      {/* 1. Header: Mã đơn hàng + Ngày đặt + Trạng thái */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="text-base font-semibold text-[#18181B] tracking-tight"
              style={{ fontFamily: SF_DISPLAY }}
            >
              Đơn {order.order_code || `#${order.id}`}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border || "border-transparent"}`}
            >
              {statusInfo.label}
            </span>
          </div>
          <p className="text-xs text-[#71717A] mt-1">
            Đặt lúc: {formatDateVi(order.created_at)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(order)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066cc] hover:text-[#0071e3] transition-colors self-start sm:self-auto cursor-pointer py-1"
        >
          <TruckIcon className="w-4 h-4" />
          <span>Theo dõi chi tiết</span>
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Mini Stepper: Nhìn nhanh tiến trình */}
      <div className="py-1">
        <OrderTrackingStepper order={order} variant="mini" />
      </div>

      {/* 3. Danh sách sản phẩm mua */}
      <div className="divide-y divide-zinc-100 py-1">
        {order.items?.map((item) => {
          const variantSpecs = [
            item.variant?.color,
            item.variant?.ram,
            item.variant?.storage,
          ]
            .filter(Boolean)
            .join(" • ");

          return (
            <div
              key={item.id}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-[#18181B] truncate block">
                  {item.variant?.product?.name || "Thiết bị công nghệ"}
                </span>
                {variantSpecs && (
                  <span className="text-xs text-[#71717A] block mt-0.5">
                    {variantSpecs}
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-medium text-[#18181B] block">
                  {formatVnd(item.total)}
                </span>
                <span className="text-xs text-[#71717A] block">
                  {item.quantity} × {formatVnd(item.price)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Tổng tiền & Thanh toán tóm tắt */}
      <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="text-xs text-[#71717A] space-y-0.5">
          <div>
            Hình thức:{" "}
            <span className="font-medium text-zinc-800">
              {order.payment_method?.toUpperCase() || "COD"}
            </span>
          </div>
          {order.address && (
            <div className="truncate max-w-xs sm:max-w-md">
              Giao đến: <span className="text-zinc-800">{order.address}</span>
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between sm:justify-end gap-2">
          <span className="text-xs text-[#71717A]">Tổng thanh toán:</span>
          <span
            className="text-lg font-bold text-[#18181B]"
            style={{ fontFamily: SF_DISPLAY }}
          >
            {formatVnd(order.total_amount)}
          </span>
        </div>
      </div>

      {/* 5. Cụm nút hành động */}
      <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3 flex-wrap">
        {canCancel && (
          <button
            type="button"
            disabled={cancellingId === order.id}
            onClick={() => onCancel(order.id)}
            className="min-h-[44px] px-4.5 py-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-98 transition-all text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            {cancellingId === order.id ? "Đang hủy..." : "Hủy đơn hàng"}
          </button>
        )}

        {canReorder && (
          <button
            type="button"
            disabled={reorderingId === order.id}
            onClick={() => onReorder(order)}
            className="min-h-[44px] px-4.5 py-2 rounded-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:scale-98 transition-all text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${reorderingId === order.id ? "animate-spin" : ""}`} />
            <span>Mua lại</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onViewDetails(order)}
          className="min-h-[44px] px-5 py-2 rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] active:scale-98 transition-all text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>Xem chi tiết</span>
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

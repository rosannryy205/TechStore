import { useState } from "react";
import {
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  CreditCardIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  ORDER_STATUS_MAP,
  PAYMENT_METHOD_MAP,
  PAYMENT_STATUS_MAP,
} from "@/constants/orderStatus";
import { formatVnd } from "@/utils/formatCurrency";
import { formatDateVi } from "@/utils/formatDate";
import { SF_DISPLAY } from "@/constants/typography";
import OrderTrackingStepper from "./OrderTrackingStepper";

export default function OrderTrackingDrawer({
  isOpen,
  order,
  onClose,
  onCancelOrder,
  onReorder,
  cancellingId,
  reorderingId,
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const statusInfo = ORDER_STATUS_MAP[order.order_status] || {
    label: order.order_status,
    color: "text-zinc-600",
    bg: "bg-zinc-100",
    border: "border-zinc-200",
  };

  const paymentMethodInfo = PAYMENT_METHOD_MAP[order.payment_method] || {
    label: order.payment_method?.toUpperCase() || "COD",
    color: "text-zinc-700",
    bg: "bg-zinc-100",
  };

  const paymentStatusInfo = PAYMENT_STATUS_MAP[order.payment_status] || {
    label: order.payment_status || "Chờ xử lý",
    color: "text-amber-700",
    bg: "bg-amber-50",
  };

  const handleCopyCode = () => {
    const code = order.order_code || `#${order.id}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canCancel = order.order_status === "pending";
  const canReorder = order.order_status === "completed" || order.order_status === "cancelled";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-xl bg-[#F9FAFB] text-[#18181B] shadow-2xl flex flex-col justify-between border-l border-zinc-200/80 animate-slideInRight">
          
          {/* Header */}
          <div className="px-6 py-5 bg-white border-b border-zinc-200/80 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-lg font-semibold tracking-tight text-[#18181B]"
                  style={{ fontFamily: SF_DISPLAY }}
                >
                  Đơn {order.order_code || `#${order.id}`}
                </span>
                <button
                  onClick={handleCopyCode}
                  title="Sao chép mã đơn"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 active:scale-95 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                >
                  {copied ? (
                    <CheckIcon className="w-4 h-4 text-emerald-600 stroke-2" />
                  ) : (
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  )}
                </button>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border || "border-transparent"}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-[#71717A] mt-1">
                Đặt lúc: {formatDateVi(order.created_at)}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer ml-3 shrink-0"
              aria-label="Đóng bảng chi tiết"
            >
              <XMarkIcon className="w-5 h-5 stroke-2" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Lộ trình theo dõi đơn hàng */}
            <div className="bg-white rounded-[20px] p-6 border border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3
                className="text-sm font-semibold text-[#18181B] mb-5 uppercase tracking-wider text-xs text-zinc-400"
                style={{ fontFamily: SF_DISPLAY }}
              >
                Hành trình vận chuyển
              </h3>
              <OrderTrackingStepper order={order} variant="detailed" />
            </div>

            {/* Thông tin nhận hàng & Vận chuyển */}
            <div className="bg-white rounded-[20px] p-6 border border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
              <h3
                className="text-sm font-semibold uppercase tracking-wider text-xs text-zinc-400"
                style={{ fontFamily: SF_DISPLAY }}
              >
                Địa chỉ nhận hàng
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-zinc-800">
                  <UserIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="font-semibold">{order.receiver_name || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-700">
                  <PhoneIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>{order.receiver_phone || "—"}</span>
                </div>
                <div className="flex items-start gap-3 text-zinc-700">
                  <MapPinIcon className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{order.address || "Nhận tại cửa hàng"}</span>
                </div>
                {order.note && (
                  <div className="p-3 bg-zinc-50 rounded-xl text-xs text-zinc-600 mt-2 border border-zinc-100">
                    <span className="font-medium text-zinc-900">Ghi chú:</span> {order.note}
                  </div>
                )}
              </div>
            </div>

            {/* Danh sách sản phẩm mua */}
            <div className="bg-white rounded-[20px] p-6 border border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3
                className="text-sm font-semibold uppercase tracking-wider text-xs text-zinc-400 mb-4"
                style={{ fontFamily: SF_DISPLAY }}
              >
                Kiện hàng ({order.items?.length || 0} sản phẩm)
              </h3>
              <div className="divide-y divide-zinc-100">
                {order.items?.map((item) => {
                  const variantSpecs = [
                    item.variant?.color,
                    item.variant?.ram,
                    item.variant?.storage,
                  ]
                    .filter(Boolean)
                    .join(" • ");

                  return (
                    <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#18181B] truncate">
                          {item.variant?.product?.name || "Thiết bị công nghệ"}
                        </h4>
                        {variantSpecs && (
                          <p className="text-xs text-[#71717A] mt-0.5">{variantSpecs}</p>
                        )}
                        <span className="inline-block text-xs text-zinc-500 mt-1">
                          Số lượng: {item.quantity}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold text-[#18181B]">
                          {formatVnd(item.total)}
                        </div>
                        <div className="text-xs text-[#71717A]">
                          {formatVnd(item.price)} / máy
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phương thức thanh toán & Bảng kê tài chính */}
            <div className="bg-white rounded-[20px] p-6 border border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <CreditCardIcon className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs uppercase font-medium text-zinc-500 tracking-wider">
                    Thanh toán
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${paymentMethodInfo.bg} ${paymentMethodInfo.color}`}>
                    {paymentMethodInfo.label}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${paymentStatusInfo.bg} ${paymentStatusInfo.color}`}>
                    {paymentStatusInfo.label}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-[#71717A]">
                  <span>Tạm tính hàng mục</span>
                  <span className="text-[#18181B] font-medium">{formatVnd(order.subtotal)}</span>
                </div>
                {Number(order.shipping_fee) > 0 && (
                  <div className="flex justify-between text-[#71717A]">
                    <span>Phí vận chuyển</span>
                    <span className="text-[#18181B] font-medium">{formatVnd(order.shipping_fee)}</span>
                  </div>
                )}
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Ưu đãi áp dụng</span>
                    <span className="font-medium">-{formatVnd(order.discount_amount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-zinc-100 flex justify-between items-baseline">
                  <span className="text-base font-semibold text-[#18181B]">Tổng thanh toán</span>
                  <span
                    className="text-xl font-bold text-[#0066cc]"
                    style={{ fontFamily: SF_DISPLAY }}
                  >
                    {formatVnd(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-6 bg-white border-t border-zinc-200/80 flex items-center justify-end gap-3">
            {canCancel && (
              <button
                type="button"
                disabled={cancellingId === order.id}
                onClick={() => onCancelOrder(order.id)}
                className="min-h-[44px] px-5 py-2.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 active:scale-98 transition-all text-sm font-medium disabled:opacity-50 cursor-pointer"
              >
                {cancellingId === order.id ? "Đang hủy..." : "Hủy đơn hàng"}
              </button>
            )}

            {canReorder && (
              <button
                type="button"
                disabled={reorderingId === order.id}
                onClick={() => onReorder(order)}
                className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#0066cc] text-white hover:bg-[#0071e3] active:scale-98 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {reorderingId === order.id ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Đang thêm vào giỏ...</span>
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-4 h-4" />
                    <span>Mua lại đơn này</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 rounded-full bg-zinc-100 text-[#18181B] hover:bg-zinc-200 active:scale-98 transition-all text-sm font-medium cursor-pointer"
            >
              Đóng
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

import {
  XMarkIcon,
  PrinterIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  CubeIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { formatVnd } from "@/utils/formatCurrency";
import { formatDateVi } from "@/utils/formatDate";
import {
  ORDER_STATUS_MAP,
  ORDER_STATUS_FLOW,
  PAYMENT_STATUS_MAP,
  PAYMENT_METHOD_MAP,
} from "@/constants/orderStatus";

const STEPS = [
  { key: "pending", label: "Chờ xác nhận", icon: ClockIcon },
  { key: "confirmed", label: "Đã xác nhận", icon: CheckCircleIcon },
  { key: "processing", label: "Đang chuẩn bị", icon: CubeIcon },
  { key: "shipping", label: "Đang giao", icon: TruckIcon },
  { key: "completed", label: "Đã giao", icon: ShieldCheckIcon },
];

export default function OrderDetailDrawer({
  isOpen = false,
  order = null,
  onClose,
  onUpdateStatus,
  onOpenCancelModal,
  onOpenPrint,
  onUpdatePaymentStatus,
}) {
  if (!isOpen || !order) return null;

  const currentStatusIndex = ORDER_STATUS_FLOW.indexOf(order.order_status);
  const isCancelled = order.order_status === "cancelled";
  const isCompleted = order.order_status === "completed";

  const nextStatus =
    currentStatusIndex !== -1 && currentStatusIndex < ORDER_STATUS_FLOW.length - 1
      ? ORDER_STATUS_FLOW[currentStatusIndex + 1]
      : null;

  const nextStatusLabel = nextStatus ? ORDER_STATUS_MAP[nextStatus]?.label : null;

  const statusMeta = ORDER_STATUS_MAP[order.order_status] || {
    label: order.order_status,
    color: "text-gray-700",
    bg: "bg-gray-100",
  };

  const paymentMeta = PAYMENT_STATUS_MAP[order.payment_status] || {
    label: order.payment_status,
    color: "text-gray-700",
    bg: "bg-gray-100",
  };

  const methodMeta = PAYMENT_METHOD_MAP[order.payment_method] || {
    label: order.payment_method,
    shortLabel: (order.payment_method || "").toUpperCase(),
    color: "text-gray-700",
    bg: "bg-gray-100",
    border: "border-gray-200",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-2xl w-full flex pl-10">
        <div className="w-full bg-[#fbfbfd] shadow-2xl flex flex-col h-full ring-1 ring-black/10 overflow-hidden">
          {/* ════════ HEADER ════════ */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                  {order.order_code}
                </h2>
                <span
                  className={[
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                    statusMeta.bg,
                    statusMeta.color,
                  ].join(" ")}
                >
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Đặt lúc: {formatDateVi(order.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenPrint(order)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                title="In phiếu đóng hàng"
              >
                <PrinterIcon className="h-4 w-4 text-gray-500" />
                <span className="hidden sm:inline">In phiếu</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ════════ BODY (SCROLLABLE) ════════ */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. STEPPER VÒNG ĐỜI TRẠNG THÁI */}
            <div className="bg-white p-5 rounded-2xl ring-1 ring-black/5 shadow-xs">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Chu trình xử lý đơn hàng
              </h3>

              {isCancelled ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs">
                  <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                    <ExclamationCircleIcon className="h-5 w-5" />
                    <span>Đơn hàng đã bị hủy</span>
                  </div>
                  <p className="mt-2 text-red-600">
                    <span className="font-semibold">Lý do hủy:</span>{" "}
                    {order.cancellation_reason || "Admin hủy theo yêu cầu"}
                  </p>
                  {order.cancelled_by && (
                    <p className="mt-1 text-gray-500">
                      Người thực hiện: {order.cancelled_by}
                    </p>
                  )}
                  <div className="mt-2 text-[11px] text-gray-500 italic">
                    * Số lượng tồn kho (Stock) của các biến thể đã được tự động hoàn trả.
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative flex items-center justify-between">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-gray-200 -z-0" />
                    <div
                      className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-[#0066cc] -z-0 transition-all duration-300"
                      style={{
                        width: `${(Math.max(0, currentStatusIndex) / (STEPS.length - 1)) * 100}%`,
                      }}
                    />

                    {STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      const isPast = idx <= currentStatusIndex;
                      const isCurrent = idx === currentStatusIndex;

                      return (
                        <div
                          key={step.key}
                          className="relative z-10 flex flex-col items-center group"
                        >
                          <div
                            className={[
                              "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200",
                              isCurrent
                                ? "bg-[#0066cc] text-white ring-4 ring-blue-100"
                                : isPast
                                ? "bg-[#0066cc] text-white"
                                : "bg-white border-2 border-gray-300 text-gray-400",
                            ].join(" ")}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span
                            className={[
                              "text-[11px] font-medium mt-1.5 whitespace-nowrap hidden sm:block",
                              isCurrent
                                ? "text-[#0066cc] font-semibold"
                                : isPast
                                ? "text-gray-700"
                                : "text-gray-400",
                            ].join(" ")}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Nút thao tác chuyển trạng thái */}
                  {!isCompleted && (
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onOpenCancelModal(order.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Hủy đơn hàng
                      </button>

                      {nextStatus && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, nextStatus)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0066cc] hover:bg-[#0071e3] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Chuyển sang: {nextStatusLabel}</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 2. DANH SÁCH BIẾN THỂ SẢN PHẨM (ORDER ITEMS) */}
            <div className="bg-white p-5 rounded-2xl ring-1 ring-black/5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mặt hàng đã mua ({order.items?.length || 0})
                </h3>
                <span className="text-xs text-gray-400">Đơn vị: VNĐ</span>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-start gap-3">
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="h-14 w-14 rounded-xl object-cover ring-1 ring-black/5 bg-gray-50 shrink-0"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&auto=format&fit=crop&q=80";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#1d1d1f] leading-snug">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.attributes?.map((a) => `${a.name}: ${a.value}`).join(" • ") ||
                          "Mặc định"}
                      </p>
                      <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                        SKU: {item.sku}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-[#1d1d1f]">
                        {formatVnd(item.total)}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {formatVnd(item.price)} × {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. THÔNG TIN KHÁCH HÀNG & GIAO HÀNG */}
            <div className="bg-white p-5 rounded-2xl ring-1 ring-black/5 shadow-xs">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Khách hàng & Giao nhận
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Người nhận:</span>
                    <span className="text-sm font-semibold text-[#1d1d1f]">
                      {order.receiver_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-700">
                    <PhoneIcon className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="font-mono font-medium">{order.receiver_phone}</span>
                  </div>

                  {order.receiver_email && (
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="truncate">{order.receiver_email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Địa chỉ giao hàng:</span>
                    <div className="flex items-start gap-1.5 text-gray-700 leading-relaxed">
                      <MapPinIcon className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                      <span>{order.address}</span>
                    </div>
                  </div>

                  {order.note && (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 mt-2">
                      <span className="font-semibold text-gray-700">Ghi chú từ khách:</span>{" "}
                      {order.note}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. THANH TOÁN & TỔNG KẾT TÀI CHÍNH */}
            <div className="bg-white p-5 rounded-2xl ring-1 ring-black/5 shadow-xs">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Thanh toán & Chi phí
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 block mb-1">Phương thức thanh toán</span>
                  <span
                    className={[
                      "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border",
                      methodMeta.bg,
                      methodMeta.color,
                      methodMeta.border,
                    ].join(" ")}
                  >
                    {methodMeta.label}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400 block mb-1">Trạng thái thanh toán</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={[
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                        paymentMeta.bg,
                        paymentMeta.color,
                      ].join(" ")}
                    >
                      <span className={["h-1.5 w-1.5 rounded-full", paymentMeta.dot].join(" ")} />
                      {paymentMeta.label}
                    </span>

                    {/* Quick switch payment status */}
                    {order.payment_status !== "paid" && (
                      <button
                        type="button"
                        onClick={() => onUpdatePaymentStatus(order.id, "paid")}
                        className="text-[11px] font-medium text-[#0066cc] hover:underline cursor-pointer"
                      >
                        Đánh dấu Đã thanh toán
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Chi tiết tài chính */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính tiền hàng:</span>
                  <span className="font-medium text-gray-800">
                    {formatVnd(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí giao hàng:</span>
                  <span className="font-medium text-gray-800">
                    {order.shipping_fee > 0 ? formatVnd(order.shipping_fee) : "Miễn phí"}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Giảm giá khuyến mãi:</span>
                    <span className="font-medium">-{formatVnd(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-[#1d1d1f] pt-2 border-t border-gray-100">
                  <span>Tổng thanh toán:</span>
                  <span className="text-base text-[#0066cc]">
                    {formatVnd(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ════════ FOOTER ════════ */}
          <div className="bg-white px-6 py-3.5 border-t border-gray-100 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => onOpenPrint(order)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>In phiếu giao hàng</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

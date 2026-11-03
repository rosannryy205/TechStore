import {
  CheckIcon,
  ClockIcon,
  CubeIcon,
  TruckIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ORDER_STATUS_FLOW } from "@/constants/orderStatus";
import { formatDateVi } from "@/utils/formatDate";
import { SF_DISPLAY } from "@/constants/typography";

const TRACKING_STEPS = [
  {
    key: "pending",
    label: "Chờ xác nhận",
    shortLabel: "Đặt đơn",
    desc: "Đơn hàng đã được tạo thành công, đang chờ hệ thống duyệt",
    icon: ClockIcon,
  },
  {
    key: "confirmed",
    label: "Đã xác nhận",
    shortLabel: "Xác nhận",
    desc: "Đơn hàng đã được xác nhận và kiểm tra thông tin thanh toán",
    icon: ShieldCheckIcon,
  },
  {
    key: "processing",
    label: "Đang chuẩn bị",
    shortLabel: "Đóng gói",
    desc: "Kỹ thuật viên đang kiểm tra ngoại quan và đóng gói niêm phong",
    icon: CubeIcon,
  },
  {
    key: "shipping",
    label: "Đang giao hàng",
    shortLabel: "Vận chuyển",
    desc: "Kiện hàng đã bàn giao cho đối tác vận chuyển chuyên dụng",
    icon: TruckIcon,
  },
  {
    key: "completed",
    label: "Đã giao thành công",
    shortLabel: "Hoàn tất",
    desc: "Kiện hàng đã được giao tận tay quý khách thành công",
    icon: CheckIcon,
  },
];

export default function OrderTrackingStepper({ order, variant = "mini" }) {
  if (!order) return null;

  const isCancelled = order.order_status === "cancelled";
  const currentIndex = isCancelled ? -1 : ORDER_STATUS_FLOW.indexOf(order.order_status);

  // ─── 1. BẢN THU GỌN TRÊN THẺ DANH SÁCH (MINI STEPPER) ───
  if (variant === "mini") {
    if (isCancelled) {
      return (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50/70 border border-rose-200/80 text-rose-700 text-xs">
          <XMarkIcon className="w-4 h-4 shrink-0 text-rose-600 stroke-2" />
          <span className="font-medium">Đơn hàng đã hủy</span>
          <span className="text-rose-500/80 ml-auto text-[11px]">
            {formatDateVi(order.updated_at || order.created_at)}
          </span>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="flex items-center justify-between relative">
          {/* Đường ray nối các mốc */}
          <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-100 z-0" />
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 h-0.5 bg-[#0066cc] transition-all duration-500 z-0"
            style={{
              width: `${Math.max(0, Math.min(100, (currentIndex / (TRACKING_STEPS.length - 1)) * 100))}%`,
            }}
          />

          {TRACKING_STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10 group">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-[#0066cc] text-white"
                      : isCurrent
                        ? "bg-white border-2 border-[#0066cc] text-[#0066cc] shadow-sm"
                        : "bg-white border border-zinc-200 text-zinc-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-3 h-3 stroke-3" />
                  ) : isCurrent ? (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066cc] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066cc]" />
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                  )}
                </div>

                <span
                  className={`text-[11px] mt-1.5 hidden sm:block whitespace-nowrap transition-colors ${
                    isCurrent
                      ? "font-semibold text-[#18181B]"
                      : isCompleted
                        ? "font-medium text-[#71717A]"
                        : "text-[#94A3B8]"
                  }`}
                >
                  {step.shortLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── 2. BẢN CHI TIẾT TRONG SLIDE-OVER DRAWER (DETAILED STEPPER) ───
  if (isCancelled) {
    return (
      <div className="p-5 rounded-[20px] bg-zinc-900 text-white border border-rose-500/30 shadow-[0_20px_40px_-15px_rgba(225,29,72,0.15)]">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
            <ExclamationTriangleIcon className="w-5 h-5 stroke-2" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-rose-200" style={{ fontFamily: SF_DISPLAY }}>
                Đơn hàng đã được hủy
              </h4>
              <span className="text-xs text-zinc-400">
                {formatDateVi(order.updated_at || order.created_at)}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
              Đơn hàng này đã được xác nhận hủy an toàn. Số lượng tồn kho của các sản phẩm trong đơn đã được tự động hoàn lại hệ thống.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pl-2">
      {/* Cột mốc dọc */}
      <div className="space-y-6 relative">
        {TRACKING_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex items-start gap-4 relative">
              {/* Đoạn nối dọc */}
              {idx < TRACKING_STEPS.length - 1 && (
                <div
                  className={`absolute left-4 top-8 w-0.5 -bottom-6 -ml-px transition-colors duration-500 ${
                    isCompleted ? "bg-[#0066cc]" : "bg-zinc-100"
                  }`}
                />
              )}

              {/* Node biểu tượng */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                  isCompleted
                    ? "bg-[#0066cc] text-white shadow-xs"
                    : isCurrent
                      ? "bg-blue-50 border-2 border-[#0066cc] text-[#0066cc] shadow-xs"
                      : "bg-zinc-50 border border-zinc-200 text-zinc-400"
                }`}
              >
                {isCompleted ? (
                  <CheckIcon className="w-4 h-4 stroke-2" />
                ) : isCurrent ? (
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-[#0066cc] opacity-40" />
                    <StepIcon className="w-4 h-4 relative z-10 stroke-2" />
                  </div>
                ) : (
                  <StepIcon className="w-4 h-4 stroke-1.5" />
                )}
              </div>

              {/* Nội dung bước */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h4
                    className={`text-sm font-semibold transition-colors ${
                      isCurrent
                        ? "text-[#18181B]"
                        : isCompleted
                          ? "text-zinc-800"
                          : "text-[#94A3B8]"
                    }`}
                  >
                    {step.label}
                  </h4>
                  <span className="text-[11px] text-[#94A3B8] font-mono">
                    {idx === 0
                      ? formatDateVi(order.created_at)
                      : isCurrent
                        ? formatDateVi(order.updated_at || order.created_at)
                        : isCompleted
                          ? "Hoàn tất"
                          : "Dự kiến"}
                  </span>
                </div>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    isCurrent ? "text-[#71717A]" : "text-[#94A3B8]"
                  }`}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

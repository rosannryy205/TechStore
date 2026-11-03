import { useState } from "react";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

const PRESET_REASONS = [
  "Khách hàng yêu cầu hủy đơn (đổi ý/đổi cấu hình)",
  "Không liên lạc được khách hàng để xác nhận đơn",
  "Hết hàng biến thể tạm thời trong kho",
  "Đơn hàng bị tạo trùng lặp",
  "Sai sót địa chỉ nhận hàng không thể chuyển phát",
  "Khác (Nhập lý do cụ thể bên dưới)",
];

export default function OrderCancelModal({
  isOpen = false,
  orderCode = "",
  onClose,
  onConfirm,
}) {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason =
      selectedReason === PRESET_REASONS[PRESET_REASONS.length - 1]
        ? customReason.trim()
        : selectedReason;

    if (!finalReason) return;
    onConfirm(finalReason);
  };

  const isCustom = selectedReason === PRESET_REASONS[PRESET_REASONS.length - 1];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-[24px] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg p-6">
          <div className="flex items-start justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <ExclamationTriangleIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-[#1d1d1f]">
                  Hủy đơn hàng {orderCode}
                </h3>
                <p className="text-xs text-gray-500">
                  Vui lòng chọn hoặc cung cấp lý do hủy đơn
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Lý do hủy đơn hàng <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {PRESET_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={[
                      "flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors",
                      selectedReason === reason
                        ? "border-[#0066cc] bg-[#f0f7ff] text-[#0066cc] font-medium"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="h-4 w-4 text-[#0066cc] focus:ring-[#0066cc]"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {isCustom && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Nhập lý do chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs text-[#1d1d1f] focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] outline-none"
                  placeholder="Ghi rõ lý do hủy đơn..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Note cảnh báo hoàn tồn */}
            <div className="rounded-xl bg-amber-50/80 p-3.5 border border-amber-200/80 text-xs text-amber-800">
              <span className="font-semibold">Lưu ý nghiệp vụ:</span> Khi hủy đơn, hệ thống sẽ tự động hoàn trả số lượng tồn kho (Stock) cho các biến thể trong đơn hàng.
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isCustom && !customReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Xác nhận hủy đơn
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

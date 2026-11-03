import { CheckCircleIcon, CubeIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function OrderBulkActionBar({
  selectedCount = 0,
  onBulkAdvance,
  onClearSelection,
}) {
  if (selectedCount === 0) return null;

  return (
    <aside aria-label="Thao tác đơn hàng hàng loạt" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#1d1d1f] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 ring-1 ring-white/10 text-xs sm:text-sm">
        <div className="flex items-center gap-2 pr-2 border-r border-white/15">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#0066cc] text-white text-[11px] font-bold">
            {selectedCount}
          </span>
          <span className="font-medium whitespace-nowrap">đơn đã chọn</span>
        </div>

        {/* Tác vụ 1: Xác nhận đơn */}
        <button
          type="button"
          onClick={() => onBulkAdvance("confirmed")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          <CheckCircleIcon className="h-4 w-4 text-[#34c759]" />
          <span>Duyệt đơn</span>
        </button>

        {/* Tác vụ 2: Chuẩn bị hàng */}
        <button
          type="button"
          onClick={() => onBulkAdvance("processing")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          <CubeIcon className="h-4 w-4 text-[#5e5ce6]" />
          <span>Chuẩn bị hàng</span>
        </button>

        {/* Tác vụ 3: Bỏ chọn */}
        <button
          type="button"
          onClick={onClearSelection}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
          title="Bỏ chọn tất cả"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export function InventoryHeader({ onExport }) {
  return (
    <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
      <div>
        <h1 className="text-[40px] leading-[1.1] font-semibold tracking-tight text-[#1d1d1f]">
          Quản lý tồn kho
        </h1>
        <p className="mt-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#7a7a7a]">
          Theo dõi và cập nhật số lượng tồn kho của tất cả sản phẩm.
        </p>
      </div>
      <div className="flex items-center">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center justify-center bg-[#0066cc] text-white text-[17px] font-normal rounded-full px-5.5 py-2.75 hover:bg-[#0071e3] transition-transform active:scale-95"
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          Xuất báo cáo
        </button>
      </div>
    </div>
  );
}

import { ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function OrderManagementHeader({
  totalOrders = 0,
  onExportCsv,
  onRefresh,
}) {
  return (
    <div className="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-[32px] md:text-[38px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">
            Quản lý đơn hàng
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#f5f5f7] text-gray-600 border border-gray-200">
            {totalOrders} đơn
          </span>
        </div>
        <p className="mt-2 text-[15px] sm:text-[16px] text-gray-500 font-normal">
          Theo dõi chu trình xử lý, đóng gói vận chuyển, thanh toán và in phiếu giao hàng.
        </p>
      </div>

      <div className="mt-4 sm:mt-0 flex items-center gap-2 sm:gap-3 flex-wrap">
        <button type="button" onClick={onRefresh} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-700"><ArrowPathIcon className="h-4 w-4" />Tải lại</button>
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center justify-center rounded-full bg-[#0066cc] px-4 py-2.5 text-[14px] font-medium text-white shadow-sm hover:bg-[#0071e3] transition-colors cursor-pointer"
        >
          <ArrowDownTrayIcon className="-ml-0.5 mr-1.5 h-4 w-4 text-white" aria-hidden="true" />
          Xuất CSV
        </button>
      </div>
    </div>
  );
}

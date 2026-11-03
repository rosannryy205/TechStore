import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";

export default function OrderFilterBar({
  searchTerm = "",
  onSearchChange,
  paymentMethod = "all",
  onPaymentMethodChange,
  paymentStatus = "all",
  onPaymentStatusChange,
  dateRange = "all",
  onDateRangeChange,
  sortBy = "newest",
  onSortByChange,
  onResetFilters,
}) {
  const isFiltering =
    searchTerm !== "" ||
    paymentMethod !== "all" ||
    paymentStatus !== "all" ||
    dateRange !== "all" ||
    sortBy !== "newest";

  return (
    <div className="bg-white p-4 rounded-2xl ring-1 ring-black/5 shadow-xs mb-6 space-y-3">
      {/* Hàng 1: Tìm kiếm */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-9 text-[#1d1d1f] ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0066cc] text-[14px] bg-[#fbfbfd] transition-all outline-none"
            placeholder="Tìm theo mã đơn #TS-..., tên khách hàng, số điện thoại hoặc email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Nút reset bộ lọc nếu đang áp dụng */}
        {isFiltering && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-600 hover:text-[#0066cc] bg-gray-100 hover:bg-gray-200/80 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <XMarkIcon className="h-3.5 w-3.5 mr-1" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Hàng 2: Các bộ lọc dạng dropdown */}
      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-100 text-xs">
        <div className="flex items-center text-gray-400 mr-1">
          <FunnelIcon className="h-3.5 w-3.5 mr-1" />
          <span className="font-medium text-gray-500">Lọc theo:</span>
        </div>

        {/* Phương thức thanh toán */}
        <select
          value={paymentMethod}
          onChange={(e) => onPaymentMethodChange(e.target.value)}
          className="rounded-lg bg-gray-50 border border-gray-200 py-1.5 px-2.5 text-gray-700 text-xs font-medium focus:ring-1 focus:ring-[#0066cc] focus:bg-white outline-none cursor-pointer"
        >
          <option value="all">Tất cả phương thức</option>
          <option value="cod">COD (Tiền mặt)</option>
          <option value="vnpay">VNPAY QR</option>
          <option value="momo">Ví MoMo</option>
        </select>

        {/* Trạng thái thanh toán */}
        <select
          value={paymentStatus}
          onChange={(e) => onPaymentStatusChange(e.target.value)}
          className="rounded-lg bg-gray-50 border border-gray-200 py-1.5 px-2.5 text-gray-700 text-xs font-medium focus:ring-1 focus:ring-[#0066cc] focus:bg-white outline-none cursor-pointer"
        >
          <option value="all">Tất cả TT thanh toán</option>
          <option value="pending">Chờ thanh toán</option>
          <option value="paid">Đã thanh toán</option>
          <option value="failed">Thất bại / Hủy</option>
        </select>

        {/* Khoảng thời gian */}
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="rounded-lg bg-gray-50 border border-gray-200 py-1.5 px-2.5 text-gray-700 text-xs font-medium focus:ring-1 focus:ring-[#0066cc] focus:bg-white outline-none cursor-pointer"
        >
          <option value="all">Tất cả thời gian</option>
          <option value="today">Hôm nay</option>
          <option value="7days">7 ngày qua</option>
          <option value="30days">30 ngày qua</option>
        </select>

        {/* Sắp xếp */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-gray-400 font-normal">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="rounded-lg bg-gray-50 border border-gray-200 py-1.5 px-2.5 text-gray-700 text-xs font-medium focus:ring-1 focus:ring-[#0066cc] focus:bg-white outline-none cursor-pointer"
          >
            <option value="newest">Mới nhất trước</option>
            <option value="oldest">Cũ nhất trước</option>
            <option value="total_desc">Giá trị cao ➔ thấp</option>
            <option value="total_asc">Giá trị thấp ➔ cao</option>
          </select>
        </div>
      </div>
    </div>
  );
}

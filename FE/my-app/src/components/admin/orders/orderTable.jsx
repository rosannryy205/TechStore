import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import OrderTableRow from "./orderTableRow";

export default function OrderTable({
  orders = [],
  loading = false,
  selectedOrderIds = [],
  currentPage = 1,
  totalPages = 1,
  totalOrders = 0,
  onPageChange,
  onToggleSelectOne,
  onToggleSelectAll,
  onOpenDetail,
  onQuickAdvance,
}) {
  const isAllPageSelected =
    orders.length > 0 && orders.every((o) => selectedOrderIds.includes(o.id));
  const isSomeSelected =
    orders.some((o) => selectedOrderIds.includes(o.id)) && !isAllPageSelected;

  const startRecord = totalOrders === 0 ? 0 : (currentPage - 1) * 8 + 1;
  const endRecord = Math.min(currentPage * 8, totalOrders);

  return (
    <div className="flow-root">
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-xs ring-1 ring-black/5 rounded-[20px]">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-[#f5f5f7]">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sm:pl-6 w-10"
                  >
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={(e) => onToggleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#0066cc] focus:ring-[#0066cc] cursor-pointer"
                    />
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Mã đơn & Thời gian
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Khách hàng
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Sản phẩm
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Tổng tiền & PT
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Thanh toán
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Trạng thái
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-100 border-t-[#0066cc] mb-3"></div>
                        <p className="text-[14px] text-gray-500 font-medium">
                          Đang tải dữ liệu đơn hàng...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <OrderTableRow
                      key={order.id}
                      order={order}
                      isSelected={selectedOrderIds.includes(order.id)}
                      onToggleSelect={onToggleSelectOne}
                      onOpenDetail={onOpenDetail}
                      onQuickAdvance={onQuickAdvance}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-20 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                          <MagnifyingGlassIcon className="h-6 w-6" />
                        </div>
                        <p className="font-semibold text-[#1d1d1f] text-[15px]">
                          Không tìm thấy đơn hàng nào
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Phân trang (Pagination) */}
            {!loading && totalOrders > 0 && (
              <div className="flex items-center justify-between px-4 py-3.5 bg-[#fbfbfd] border-t border-gray-100 sm:px-6">
                <div className="hidden sm:block text-xs text-gray-500">
                  Hiển thị <span className="font-semibold text-gray-700">{startRecord}</span> -{" "}
                  <span className="font-semibold text-gray-700">{endRecord}</span> trên tổng số{" "}
                  <span className="font-semibold text-gray-700">{totalOrders}</span> đơn hàng
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === currentPage;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        className={[
                          "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                          isCurrent
                            ? "bg-[#0066cc] text-white"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
                        ].join(" ")}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

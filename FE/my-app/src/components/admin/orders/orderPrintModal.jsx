import { XMarkIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { formatVnd } from "@/utils/formatCurrency";
import { formatDateVi } from "@/utils/formatDate";

export default function OrderPrintModal({
  isOpen = false,
  order = null,
  onClose,
}) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCod = order.payment_method === "cod";
  const codAmountToCollect =
    isCod && order.payment_status !== "paid" ? order.total_amount : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop — ẩn khi in */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity print:hidden"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center print:p-0">
        <div className="relative transform overflow-hidden rounded-[20px] bg-white text-left shadow-2xl transition-all sm:my-6 sm:w-full sm:max-w-2xl p-6 print:p-0 print:shadow-none print:rounded-none print:max-w-none print:w-full">
          {/* Thanh công cụ Modal — ẩn khi in */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 print:hidden mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#1d1d1f]">
                Xem trước phiếu đóng hàng & hóa đơn
              </h3>
              <p className="text-xs text-gray-500">
                Khổ giấy chuẩn A4 / A5 tương thích tất cả máy in văn phòng
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0066cc] text-white text-xs font-medium hover:bg-[#0071e3] transition-colors cursor-pointer"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>In phiếu ngay</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ════════════ PHIẾU IN (PRINT DOCUMENT) ════════════ */}
          <div id="print-slip" className="p-4 sm:p-6 bg-white font-sans text-black">
            {/* Header thương hiệu & Barcode */}
            <div className="flex items-start justify-between pb-4 border-b-2 border-gray-900">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-gray-950">
                    TECHSTORE
                  </span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-800">
                    FLAGSHIP
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Địa chỉ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM
                </p>
                <p className="text-xs text-gray-600">
                  Hotline: 1800 6868 • Website: www.techstore.vn
                </p>
              </div>

              {/* Mã vạch đơn hàng Barcode CSS */}
              <div className="text-right">
                <div className="inline-block p-1 bg-white border border-gray-300 rounded">
                  <div className="flex items-center justify-center gap-[2px] h-8 px-2">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 1, 4, 2, 1, 3, 2].map(
                      (w, idx) => (
                        <div
                          key={idx}
                          className="bg-black h-full"
                          style={{ width: `${w}px` }}
                        />
                      )
                    )}
                  </div>
                  <div className="text-center font-mono font-bold text-xs tracking-wider mt-1 text-gray-900">
                    {order.order_code}
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Ngày đặt: {formatDateVi(order.created_at)}
                </p>
              </div>
            </div>

            {/* Tiêu đề phiếu */}
            <div className="text-center my-4">
              <h2 className="text-lg font-bold uppercase tracking-wider text-gray-950">
                PHIẾU GIAO HÀNG KIÊM HÓA ĐƠN BÁN LẺ
              </h2>
            </div>

            {/* Thông tin người gửi & người nhận */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg text-xs mb-4 border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Bên gửi hàng:
                </p>
                <p className="font-semibold text-gray-800">Trung tâm Điều vận TechStore VN</p>
                <p className="text-gray-600 mt-0.5">Kho hàng: Tân Thuận, Quận 7, TP.HCM</p>
                <p className="text-gray-600">SĐT hỗ trợ: 1800 6868</p>
              </div>

              <div>
                <p className="font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Người nhận hàng:
                </p>
                <p className="font-semibold text-gray-950 text-sm">
                  {order.receiver_name}
                </p>
                <p className="font-mono text-gray-800 font-medium">
                  {order.receiver_phone}
                </p>
                <p className="text-gray-700 mt-0.5">{order.address}</p>
                {order.note && (
                  <p className="text-amber-800 font-medium mt-1">
                    Ghi chú: {order.note}
                  </p>
                )}
              </div>
            </div>

            {/* Bảng sản phẩm */}
            <table className="min-w-full divide-y divide-gray-200 text-xs mb-4">
              <thead>
                <tr className="bg-gray-100 text-gray-800 font-semibold">
                  <th className="py-2 px-2 text-left w-8">STT</th>
                  <th className="py-2 px-2 text-left">Tên sản phẩm & Biến thể</th>
                  <th className="py-2 px-2 text-left">Mã SKU</th>
                  <th className="py-2 px-2 text-center w-12">SL</th>
                  <th className="py-2 px-2 text-right">Đơn giá</th>
                  <th className="py-2 px-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items?.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="py-2 px-2 text-center text-gray-600">{idx + 1}</td>
                    <td className="py-2 px-2">
                      <div className="font-semibold text-gray-900">
                        {item.product_name}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {item.attributes?.map((a) => `${a.name}: ${a.value}`).join(", ")}
                      </div>
                    </td>
                    <td className="py-2 px-2 font-mono text-gray-600">{item.sku}</td>
                    <td className="py-2 px-2 text-center font-semibold text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-700">
                      {formatVnd(item.price)}
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-gray-900">
                      {formatVnd(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bảng tổng kết thanh toán */}
            <div className="flex justify-end mb-6">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{formatVnd(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span>{formatVnd(order.shipping_fee)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Giảm giá voucher:</span>
                    <span>-{formatVnd(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-950 text-sm pt-2 border-t border-gray-200">
                  <span>Tổng đơn hàng:</span>
                  <span>{formatVnd(order.total_amount)}</span>
                </div>

                {/* Tiền thu COD */}
                <div className="p-2 rounded bg-gray-100 border border-gray-300 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">TIỀN THU COD:</span>
                    <span className="text-sm font-extrabold text-red-600">
                      {formatVnd(codAmountToCollect)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {codAmountToCollect > 0
                      ? "(Shipper thu đúng số tiền trên khi bàn giao kiện hàng)"
                      : "(Đơn hàng đã thanh toán trước qua cổng điện tử)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Chữ ký xác nhận */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs pt-4 border-t border-gray-200">
              <div>
                <p className="font-bold text-gray-900">Người lập phiếu</p>
                <p className="text-[11px] text-gray-500 mt-0.5">(Ký, ghi rõ họ tên)</p>
                <div className="h-16" />
                <p className="font-semibold text-gray-800">TechStore Admin</p>
              </div>

              <div>
                <p className="font-bold text-gray-900">Nhân viên đóng gói</p>
                <p className="text-[11px] text-gray-500 mt-0.5">(Ký, ghi rõ họ tên)</p>
                <div className="h-16" />
                <p className="font-semibold text-gray-800">Bộ phận kho vận</p>
              </div>

              <div>
                <p className="font-bold text-gray-900">Người nhận hàng</p>
                <p className="text-[11px] text-gray-500 mt-0.5">(Đã kiểm tra & nhận đủ)</p>
                <div className="h-16" />
                <p className="font-semibold text-gray-800">{order.receiver_name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

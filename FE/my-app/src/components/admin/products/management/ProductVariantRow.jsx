import { PlusIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { formatVnd } from "@/utils/formatCurrency";

export default function ProductVariantRow({ variants = [] }) {
  return (
    <tr>
      <td colSpan="7" className="bg-[#fafafc] p-0 border-b border-gray-100">
        <div className="pl-18 sm:pl-26 pr-6 py-4">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="text-[12px] text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="text-left font-semibold py-2">
                  Mẫu / Màu sắc / Dung lượng
                </th>
                <th className="text-left font-semibold py-2">Giá bán</th>
                <th className="text-left font-semibold py-2">Tồn kho</th>
                <th className="text-right font-semibold py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variants.map((variant) => (
                <tr key={variant.id} className="hover:bg-white transition-colors">
                  <td className="py-3 text-[14px] text-gray-700">{variant.name}</td>
                  <td className="py-3 text-[14px] font-medium text-[#1d1d1f]">
                    {formatVnd(variant.price)}
                  </td>
                  <td className="py-3 text-[14px] text-gray-600">
                    {variant.stock > 0 ? (
                      <span className="text-emerald-600">{variant.stock}</span>
                    ) : (
                      <span className="text-rose-600">Hết hàng</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        className="text-[#0066cc] hover:bg-blue-50 p-1 rounded-md transition-colors cursor-pointer"
                        title="Chỉnh sửa biến thể"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3">
            <button className="text-[14px] text-[#0066cc] hover:text-[#0071e3] font-medium inline-flex items-center transition-colors cursor-pointer">
              <PlusIcon className="h-4 w-4 mr-1" /> Thêm biến thể
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

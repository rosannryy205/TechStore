import {
  PencilSquareIcon,
  TrashIcon,
  EyeSlashIcon,
  EyeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { formatVnd } from "@/utils/formatCurrency";
import { resolveProductImageUrl } from "@/utils/imageHelper";

function getStatusColor(status) {
  switch (status) {
    case "Còn hàng":
      return "bg-emerald-100 text-emerald-700 ring-emerald-600/20";
    case "Sắp hết":
      return "bg-amber-100 text-amber-700 ring-amber-600/20";
    case "Hết hàng":
      return "bg-rose-100 text-rose-700 ring-rose-600/20";
    default:
      return "bg-gray-100 text-gray-700 ring-gray-500/20";
  }
}

export default function ProductTableRow({
  product,
  isExpanded,
  onToggleRow,
  onToggleHide,
}) {
  const imageUrl = resolveProductImageUrl(product.image);

  return (
    <tr
      className={
        "transition-colors hover:bg-gray-50/80 " +
        (product.isHidden ? "bg-gray-50/50 opacity-75 grayscale-20" : "")
      }
    >
      <td className="whitespace-nowrap py-4 pl-4 pr-1 sm:pl-6 text-center">
        {product.variants && product.variants.length > 0 && (
          <button
            onClick={() => onToggleRow(product.id)}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc] cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-[14px]">
        <div className="flex items-center">
          <div className="h-11 w-11 shrink-0 hidden sm:block relative">
            <img
              className="h-11 w-11 rounded-lg object-cover border border-gray-200 shadow-sm"
              src={imageUrl}
              alt={product.name}
            />
            {product.isHidden && (
              <div className="absolute inset-0 bg-white/60 rounded-lg flex items-center justify-center">
                <EyeSlashIcon className="h-5 w-5 text-gray-600" />
              </div>
            )}
          </div>
          <div className="sm:ml-4">
            <div className="font-semibold text-[#1d1d1f] text-[17px] truncate max-w-37.5 sm:max-w-50 lg:max-w-62.5">
              {product.name}
            </div>
            {product.variants && product.variants.length > 0 && (
              <div className="text-[12px] text-gray-500 mt-0.5">
                {product.variants.length} biến thể
              </div>
            )}
            {product.isHidden && (
              <span className="mt-1 inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 sm:hidden">
                Ẩn
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-[17px] text-gray-500 hidden sm:table-cell">
        {product.category}
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-[17px] text-[#1d1d1f] font-medium">
        {formatVnd(product.price)}
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-[14px] text-gray-500 hidden md:table-cell">
        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
          {product.stock}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-[14px] hidden lg:table-cell">
        <span
          className={
            "inline-flex items-center rounded-md px-2 py-1 font-medium ring-1 ring-inset " +
            getStatusColor(product.status)
          }
        >
          {product.status}
        </span>
      </td>
      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-[14px] font-medium sm:pr-6">
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={() => onToggleHide(product.id)}
            className={
              "p-1.5 rounded-lg transition-colors cursor-pointer " +
              (product.isHidden
                ? "text-amber-600 hover:text-amber-900 hover:bg-amber-50"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100")
            }
            title={product.isHidden ? "Hiển thị sản phẩm" : "Ẩn sản phẩm"}
          >
            {product.isHidden ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>

          <button
            className="text-[#0066cc] hover:text-[#0071e3] p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
            title="Chỉnh sửa"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>

          <button
            className="text-rose-600 hover:text-rose-900 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            title="Xóa"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

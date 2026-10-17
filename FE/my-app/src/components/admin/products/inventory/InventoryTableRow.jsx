import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function InventoryTableRow({ item, onUpdateStock }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "text-[#1d1d1f]";
      case "Low Stock":
        return "text-[#e5a00d]";
      case "Out of Stock":
        return "text-[#ff3b30]";
      default:
        return "text-[#7a7a7a]";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "In Stock":
        return "Bình thường";
      case "Low Stock":
        return "Sắp hết";
      case "Out of Stock":
        return "Hết hàng";
      default:
        return status;
    }
  };

  return (
    <tr className="hover:bg-[#fafafc] transition-colors">
      <td className="whitespace-nowrap py-5 pl-6 pr-3 text-[14px] font-normal text-[#1d1d1f]">
        {item.sku}
      </td>
      <td className="py-5 px-3 text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.374px]">
        {item.name}
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-[14px] font-medium tracking-[-0.224px]">
        <span className={`flex items-center gap-1.5 ${getStatusColor(item.status)}`}>
          {item.status === "Low Stock" || item.status === "Out of Stock" ? (
            <ExclamationTriangleIcon className="w-4 h-4" />
          ) : null}
          {getStatusText(item.status)}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-right text-[17px] text-[#7a7a7a] hidden sm:table-cell">
        {item.minStock}
      </td>
      <td className="whitespace-nowrap px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onUpdateStock(item.id, item.stock - 1)}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e0e0e0] transition-colors active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            disabled={item.stock <= 0}
          >
            -
          </button>
          <span className="w-12 text-center text-[17px] font-semibold text-[#1d1d1f]">
            {item.stock}
          </span>
          <button
            type="button"
            onClick={() => onUpdateStock(item.id, item.stock + 1)}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e0e0e0] transition-colors active:scale-95"
          >
            +
          </button>
        </div>
      </td>
    </tr>
  );
}

import { TrashIcon } from "@heroicons/react/24/outline";

export function ProductVariantMatrixTable({
  variants,
  onVariantChange,
  onRemoveVariant,
}) {
  if (variants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
        No combinations generated yet. Select options above and click Generate.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 uppercase text-gray-700">
          <tr>
            <th className="px-4 py-3">Attributes</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Price (VND)</th>
            <th className="px-4 py-3">Sale Price (VND)</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant, index) => (
            <tr key={index} className="border-t border-gray-200 bg-white">
              <td className="px-4 py-3 font-medium text-gray-900">
                {variant.attributes?.map((a) => a.value).join(" - ")}
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={variant.sku || ""}
                  onChange={(e) => onVariantChange(index, "sku", e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#0066cc]"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={variant.price ?? ""}
                  onChange={(e) => onVariantChange(index, "price", e.target.value)}
                  min="0"
                  required
                  className="w-24 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#0066cc]"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={variant.salePrice ?? variant.sale_price ?? ""}
                  onChange={(e) => onVariantChange(index, "salePrice", e.target.value)}
                  min="0"
                  className="w-24 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#0066cc]"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  value={variant.stock ?? ""}
                  onChange={(e) => onVariantChange(index, "stock", e.target.value)}
                  min="0"
                  required
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-[#0066cc]"
                />
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={() => onRemoveVariant(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="h-4 w-4 inline" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProductBulkSettings({
  bulkPrice,
  onBulkPriceChange,
  bulkSalePrice,
  onBulkSalePriceChange,
  bulkStock,
  onBulkStockChange,
  onApply,
}) {
  return (
    <div className="mb-6 rounded-xl border border-gray-100 bg-blue-50 p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Set Price for All
          </label>
          <input
            type="number"
            value={bulkPrice}
            onChange={(e) => onBulkPriceChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
            placeholder="0"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Set Sale Price for All
          </label>
          <input
            type="number"
            value={bulkSalePrice}
            onChange={(e) => onBulkSalePriceChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
            placeholder="0"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Set Stock for All
          </label>
          <input
            type="number"
            value={bulkStock}
            onChange={(e) => onBulkStockChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
            placeholder="0"
          />
        </div>
        <button
          type="button"
          onClick={onApply}
          className="rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

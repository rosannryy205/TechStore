import { PlusIcon, TrashIcon, ViewColumnsIcon } from "@heroicons/react/24/outline";

export function ProductAttributesBuilder({
  variantAttributes,
  productAttributes,
  onAddAttribute,
  onChangeAttribute,
  onRemoveAttribute,
  onGenerateVariants,
}) {
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#1d1d1f]">
            Product Variants (Cartesian Generator)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Select options to generate combinations automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerateVariants}
          className="flex items-center gap-2 rounded-lg bg-[#0066cc] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0071e3]"
        >
          <ViewColumnsIcon className="h-4 w-4" />
          <span>Generate Combinations</span>
        </button>
      </div>

      {/* Attribute Selector */}
      <div className="mb-8 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <h3 className="text-sm font-medium text-gray-700">
          Tùy chọn biến thể (Admin thêm thủ công):
        </h3>
        {productAttributes.map((pa, index) => (
          <div
            key={pa.localId}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
          >
            <div className="w-full sm:w-1/3">
              <select
                value={pa.attribute_id}
                onChange={(e) =>
                  onChangeAttribute(index, "attribute_id", e.target.value)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
              >
                <option value="">-- Chọn thuộc tính --</option>
                {variantAttributes.map((attr) => (
                  <option key={attr.id} value={attr.id}>
                    {attr.display_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-2/3 flex gap-2">
              <input
                type="text"
                value={pa.values}
                onChange={(e) =>
                  onChangeAttribute(index, "values", e.target.value)
                }
                placeholder="Nhập giá trị, cách nhau bằng dấu phẩy (vd: Đen, Trắng, Đỏ)"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
              />
              <button
                type="button"
                onClick={() => onRemoveAttribute(index)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddAttribute}
          className="flex items-center gap-1 text-sm font-medium text-[#0066cc] hover:text-[#005bb5]"
        >
          <PlusIcon className="h-4 w-4" />
          Thêm thuộc tính khác
        </button>
      </div>
    </div>
  );
}

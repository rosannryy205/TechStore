import { InventoryTableRow } from "./inventoryTableRow";

export function InventoryTable({ items, loading, onUpdateStock }) {
  return (
    <div className="bg-white border border-[#e0e0e0] rounded-[18px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#f0f0f0]">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-5 pl-6 pr-3 text-left text-[14px] font-semibold text-[#7a7a7a] tracking-[-0.224px]"
              >
                SKU
              </th>
              <th
                scope="col"
                className="px-3 py-5 text-left text-[14px] font-semibold text-[#7a7a7a] tracking-[-0.224px]"
              >
                Tên sản phẩm
              </th>
              <th
                scope="col"
                className="px-3 py-5 text-left text-[14px] font-semibold text-[#7a7a7a] tracking-[-0.224px]"
              >
                Trạng thái
              </th>
              <th
                scope="col"
                className="px-3 py-5 text-right text-[14px] font-semibold text-[#7a7a7a] tracking-[-0.224px] hidden sm:table-cell"
              >
                Mức tối thiểu
              </th>
              <th
                scope="col"
                className="px-6 py-5 text-right text-[14px] font-semibold text-[#7a7a7a] tracking-[-0.224px]"
              >
                Tồn kho
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f0]">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-24 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#e0e0e0] border-t-[#0066cc]"></div>
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => (
                <InventoryTableRow
                  key={item.id}
                  item={item}
                  onUpdateStock={onUpdateStock}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="py-24 text-center text-[17px] text-[#7a7a7a] tracking-[-0.374px]"
                >
                  Không tìm thấy sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

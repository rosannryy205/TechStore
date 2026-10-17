import CategoryTableRow from "./CategoryTableRow";

export default function CategoryTable({ categories = [] }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#e0e0e0] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#e0e0e0] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.374px]">
          Danh sách danh mục
        </h2>
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Tìm kiếm danh mục"
            className="block w-full rounded-full border border-[#e0e0e0] bg-white px-5 py-3 text-[17px] text-[#1d1d1f] transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#f0f0f0]">
          <thead className="bg-[#fafafc]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-[#7a7a7a]">
                Tên danh mục
              </th>
              <th scope="col" className="px-6 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-[#7a7a7a]">
                Đường dẫn
              </th>
              <th scope="col" className="px-6 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-[#7a7a7a]">
                Thương hiệu
              </th>
              <th scope="col" className="px-6 py-3 text-left text-[12px] font-medium uppercase tracking-wider text-[#7a7a7a]">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3 text-right text-[12px] font-medium uppercase tracking-wider text-[#7a7a7a]">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f0] bg-white">
            {categories.map((cat) => (
              <CategoryTableRow key={cat.id || cat._id} cat={cat} />
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  Chưa có danh mục nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#e0e0e0] bg-white px-6 py-4 sm:px-6">
        <div className="text-sm text-gray-700">
          Hiển thị <span className="font-medium">{categories.length > 0 ? 1 : 0}</span> đến{" "}
          <span className="font-medium">{categories.length}</span> trong số{" "}
          <span className="font-medium">{categories.length}</span> danh mục
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
            Trước
          </button>
          <button className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}

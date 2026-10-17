import BrandTableRow from "./BrandTableRow";

export default function BrandTable({ brands = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-[#1d1d1f]">
          Danh sách thương hiệu
        </h2>
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Tìm kiếm thương hiệu..."
            className="block w-full rounded-full border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Thương hiệu
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Đường dẫn (Slug)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {brands.map((brand) => (
              <BrandTableRow key={brand.id || brand._id} brand={brand} />
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  Chưa có thương hiệu nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 sm:px-6">
        <div className="text-sm text-gray-700">
          Hiển thị <span className="font-medium">{brands.length > 0 ? 1 : 0}</span> đến{" "}
          <span className="font-medium">{brands.length}</span> trong số{" "}
          <span className="font-medium">{brands.length}</span> thương hiệu
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

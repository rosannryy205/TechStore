import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function ProductFilterBar({ searchTerm, onSearch }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="relative max-w-md w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          className="block w-full rounded-full border-0 py-3 pl-11 pr-4 text-[#1d1d1f] ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0066cc] text-[17px] shadow-sm transition-shadow outline-none"
          placeholder="Tìm kiếm sản phẩm hoặc danh mục..."
          value={searchTerm}
          onChange={onSearch}
        />
      </div>
    </div>
  );
}

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export function InventorySearchBar({ searchTerm, onSearch }) {
  return (
    <div className="mb-8">
      <div className="relative max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <MagnifyingGlassIcon className="h-5 w-5 text-[#7a7a7a]" aria-hidden="true" />
        </div>
        <input
          type="text"
          className="block w-full bg-white border border-[#e0e0e0] text-[#1d1d1f] text-[17px] rounded-full py-3 pl-12 pr-5 focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-colors placeholder:text-[#7a7a7a]"
          placeholder="Tìm kiếm theo mã SKU hoặc tên..."
          value={searchTerm}
          onChange={onSearch}
        />
      </div>
    </div>
  );
}

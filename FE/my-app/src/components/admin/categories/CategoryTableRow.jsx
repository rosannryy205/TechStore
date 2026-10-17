import { TagIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function CategoryTableRow({ cat }) {
  const categoryBrands = cat.category_brands && Array.isArray(cat.category_brands)
    ? cat.category_brands.map((cb) => cb.brand).filter(Boolean)
    : cat.brands && Array.isArray(cat.brands)
      ? cat.brands
      : [];

  return (
    <tr className="transition-colors hover:bg-[#fafafc]">
      <td className="whitespace-nowrap px-6 py-4">
        <div className="text-[14px] font-medium text-[#1d1d1f]">{cat.name}</div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-[14px] text-[#7a7a7a]">
        {cat.slug}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1.5 max-w-xs">
          {categoryBrands.length > 0 ? (
            categoryBrands.map((b, idx) => {
              const brandName = typeof b === "object" ? b.name : b;
              return (
                <span
                  key={b?.id || idx}
                  className="inline-flex items-center gap-1 rounded-md bg-[#f5f5f7] px-2 py-1 text-[12px] font-medium text-[#333333] border border-[#e0e0e0]"
                >
                  <TagIcon className="h-3 w-3 text-[#7a7a7a]" />
                  {brandName}
                </span>
              );
            })
          ) : (
            <span className="text-[12px] text-[#7a7a7a] italic">Chưa liên kết</span>
          )}
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <span
          className={
            "inline-flex rounded-full px-3.5 py-2 text-[14px] font-normal " +
            (cat.status === 1
              ? "bg-[#f5f5f7] text-[#0066cc]"
              : "bg-[#f5f5f7] text-[#7a7a7a]")
          }
        >
          {cat.status === 1 ? "Hoạt động" : "Ngừng"}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right text-[14px] font-medium">
        <button className="mx-2 text-[#0066cc] transition-colors hover:text-[#0071e3] cursor-pointer">
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        <button className="text-red-500 transition-colors hover:text-red-700 cursor-pointer">
          <TrashIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
}

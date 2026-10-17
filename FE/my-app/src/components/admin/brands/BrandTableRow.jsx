import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { resolveProductImageUrl } from "@/utils/imageHelper";

export default function BrandTableRow({ brand }) {
  const logoUrl = brand.logo ? resolveProductImageUrl(brand.logo) : null;

  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded border border-gray-200 bg-white">
            {logoUrl ? (
              <img src={logoUrl} alt={brand.name} className="h-full w-full object-contain p-0.5" />
            ) : (
              <span className="text-xs font-bold text-gray-400">
                {brand.name ? brand.name.charAt(0) : "B"}
              </span>
            )}
          </div>
          <div className="text-sm font-medium text-gray-900">{brand.name}</div>
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        {brand.slug}
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            brand.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {brand.status === 1 ? "Đang hợp tác" : "Ngừng KD"}
        </span>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
        <button className="mx-2 text-[#0066cc] transition-colors hover:text-[#005bb5] cursor-pointer">
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        <button className="text-red-500 transition-colors hover:text-red-700 cursor-pointer">
          <TrashIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
}

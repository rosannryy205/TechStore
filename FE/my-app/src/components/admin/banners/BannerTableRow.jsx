import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { SF_TEXT, MONO_TEXT } from "@/constants/typography";
import { resolveProductImageUrl } from "@/utils/imageHelper";

export default function BannerTableRow({
  banner,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const isHero = banner.position === "hero_slide";
  const isActive = Number(banner.status) === 1;

  return (
    <tr
      className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
      style={{ fontFamily: SF_TEXT }}
    >
      {/* Thumbnail with checkered transparency background */}
      <td className="py-4 px-4 w-28">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#ffffff_0%_50%)] bg-[length:12px_12px] shadow-inner">
          <img
            src={resolveProductImageUrl(banner.image_url)}
            alt={banner.title}
            className="w-full h-full object-contain p-1"
            loading="lazy"
          />
          {isHero && (
            <span
              className="absolute bottom-1 right-1 text-[9px] font-mono px-1 py-0.2 rounded bg-black/75 text-white"
              style={{ fontFamily: MONO_TEXT }}
            >
              3D
            </span>
          )}
        </div>
      </td>

      {/* Title & Eyebrow */}
      <td className="py-4 px-4 max-w-[280px]">
        <div className="flex flex-col text-left">
          {banner.badge && (
            <span
              className="text-[11px] font-mono text-[#3B82F6] font-semibold uppercase tracking-wider mb-0.5"
              style={{ fontFamily: MONO_TEXT }}
            >
              {banner.badge}
            </span>
          )}
          <span className="text-[14px] font-semibold text-[#18181B] line-clamp-1">
            {banner.title}
          </span>
          <span className="text-[12px] text-gray-500 line-clamp-1 mt-0.5">
            {banner.description || "Chưa có mô tả"}
          </span>
        </div>
      </td>

      {/* Position Badge */}
      <td className="py-4 px-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border ${
            isHero
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isHero ? "bg-blue-600" : "bg-emerald-600"
            }`}
          />
          {isHero ? "Hero 3D Showcase" : "Trade-in Program"}
        </span>
      </td>

      {/* Ambient Color Preview */}
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
            style={{ backgroundColor: banner.ambient_color || "#3B82F6" }}
          />
          <span
            className="text-[11px] text-gray-500 font-mono"
            style={{ fontFamily: MONO_TEXT }}
          >
            {banner.ambient_color ? banner.ambient_color.split(",")[0].replace("rgba(", "") : "Custom"}
          </span>
        </div>
      </td>

      {/* Display Order */}
      <td className="py-4 px-4 whitespace-nowrap text-center">
        <span
          className="inline-block px-3 py-1 rounded-lg bg-gray-100 text-gray-800 text-[12px] font-semibold font-mono"
          style={{ fontFamily: MONO_TEXT }}
        >
          #{banner.display_order ?? 1}
        </span>
      </td>

      {/* Status Toggle Switch */}
      <td className="py-4 px-4 whitespace-nowrap text-center">
        <button
          type="button"
          onClick={() => onToggleStatus(banner)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isActive ? "bg-[#3B82F6]" : "bg-gray-200"
          }`}
          role="switch"
          aria-checked={isActive}
          title={isActive ? "Bấm để ẩn banner" : "Bấm để hiển thị banner"}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isActive ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </td>

      {/* Actions */}
      <td className="py-4 px-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(banner)}
            className="p-2 text-gray-600 hover:text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Chỉnh sửa banner"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(banner)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Xóa banner"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

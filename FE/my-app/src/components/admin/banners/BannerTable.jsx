import { SF_TEXT, MONO_TEXT } from "@/constants/typography";
import BannerTableRow from "./BannerTableRow";

export default function BannerTable({
  banners,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  if (!banners || banners.length === 0) {
    return (
      <div
        className="rounded-2xl border border-gray-200 bg-white p-12 text-center"
        style={{ fontFamily: SF_TEXT }}
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#3B82F6] mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Chưa có banner nào
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Hiện tại chưa có banner nào thuộc danh mục này. Hãy nhấn nút &quot;Thêm Banner mới&quot; để thiết lập.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ fontFamily: SF_TEXT }}>
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-200 text-[12px] uppercase text-gray-500 font-semibold tracking-wider">
              <th className="py-3.5 px-4" style={{ fontFamily: MONO_TEXT }}>Thumbnail</th>
              <th className="py-3.5 px-4" style={{ fontFamily: MONO_TEXT }}>Tiêu đề & Nội dung</th>
              <th className="py-3.5 px-4" style={{ fontFamily: MONO_TEXT }}>Vị trí hiển thị</th>
              <th className="py-3.5 px-4" style={{ fontFamily: MONO_TEXT }}>Màu 3D</th>
              <th className="py-3.5 px-4 text-center" style={{ fontFamily: MONO_TEXT }}>Thứ tự</th>
              <th className="py-3.5 px-4 text-center" style={{ fontFamily: MONO_TEXT }}>Trạng thái</th>
              <th className="py-3.5 px-4 text-right" style={{ fontFamily: MONO_TEXT }}>Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {banners.map((banner) => (
              <BannerTableRow
                key={banner.id}
                banner={banner}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { PlusIcon, PhotoIcon } from "@heroicons/react/24/outline";

export default function BrandForm({
  formData,
  logoPreview,
  isLoading,
  error,
  onChange,
  onLogoChange,
  onSubmit,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-[#1d1d1f]">
        Thêm thương hiệu mới
      </h2>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
            Tên thương hiệu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="VD: Apple, Samsung..."
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-gray-700">
            Đường dẫn (Slug)
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={onChange}
            placeholder="vd: apple"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 transition-colors focus:border-[#0066cc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
          />
        </div>

        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-700">
            Trạng thái
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={onChange}
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
          >
            <option value="1">Đang hợp tác</option>
            <option value="0">Ngừng kinh doanh</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Logo thương hiệu
          </label>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-gray-50">
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="h-full w-full object-contain p-1" />
              ) : (
                <PhotoIcon className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <label className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <span>Chọn logo</span>
              <input type="file" accept="image/*" onChange={onLogoChange} className="sr-only" />
            </label>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0066cc] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 disabled:bg-blue-300 cursor-pointer"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <PlusIcon className="h-5 w-5" />
            )}
            <span>{isLoading ? "Đang xử lý..." : "Lưu thương hiệu"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

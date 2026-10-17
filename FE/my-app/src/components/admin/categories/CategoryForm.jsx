import { PlusIcon } from "@heroicons/react/24/outline";

export default function CategoryForm({
  formData,
  brands = [],
  isLoading,
  error,
  onChange,
  onSubmit,
}) {
  return (
    <div className="rounded-[18px] border border-[#e0e0e0] bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.374px]">
        Thêm danh mục mới
      </h2>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#1d1d1f]">
            Tên danh mục <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="VD: Laptops, Điện thoại di động..."
            className="block w-full rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-sm text-[#1d1d1f] transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-[#1d1d1f]">
            Đường dẫn (Slug) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={onChange}
            placeholder="vd: laptops"
            className="block w-full rounded-lg border border-[#e0e0e0] bg-gray-50 px-4 py-2.5 text-sm text-[#1d1d1f] transition-colors focus:border-[#0066cc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
            required
          />
        </div>

        <div>
          <label htmlFor="brandIds" className="mb-1.5 block text-sm font-medium text-[#1d1d1f]">
            Thương hiệu liên kết
          </label>
          <p className="mb-2 text-xs text-[#7a7a7a]">Giữ Ctrl để chọn nhiều thương hiệu</p>
          <select
            id="brandIds"
            name="brandIds"
            multiple
            value={formData.brandIds}
            onChange={onChange}
            className="block w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm text-[#1d1d1f] transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc] min-h-30"
          >
            {brands.map((brand) => (
              <option key={brand.id || brand._id} value={brand.id || brand._id} className="py-1">
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-[#1d1d1f]">
            Trạng thái
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={onChange}
            className="block w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm text-[#1d1d1f] transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
          >
            <option value={1}>Đang hoạt động</option>
            <option value={0}>Ngừng hoạt động</option>
          </select>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0066cc] px-5.5 py-2.75 text-[17px] font-normal text-white transition-colors hover:bg-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 disabled:bg-blue-300 cursor-pointer"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <PlusIcon className="h-5 w-5" />
            )}
            <span>{isLoading ? "Đang xử lý" : "Lưu danh mục"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

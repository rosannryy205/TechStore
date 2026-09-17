import { useState } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, TagIcon } from "@heroicons/react/24/outline";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([
    { id: 1, name: "Smartphones", slug: "smartphones", status: 1, brands: ["Apple", "Samsung", "Xiaomi"] },
    { id: 2, name: "Laptops", slug: "laptops", status: 1, brands: ["Apple", "Dell", "ASUS", "ACER"] },
    { id: 3, name: "Tablets", slug: "tablets", status: 1, brands: ["Apple", "Samsung"] },
  ]);
  const [brands] = useState([
    { id: 1, name: "Apple" },
    { id: 2, name: "Samsung" },
    { id: 3, name: "Xiaomi" },
    { id: 4, name: "Dell" },
    { id: 5, name: "ASUS" },
    { id: 6, name: "ACER" },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: 1, // 1: Active, 0: Inactive
    brandIds: [], // Multi-select for associated brands
  });

  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === "select-multiple") {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => parseInt(option.value));
      setFormData((prev) => ({ ...prev, [name]: selectedOptions }));
      return;
    }

    setFormData((prev) => {
      const newData = { ...prev, [name]: name === "status" ? parseInt(value) : value };
      if (name === "name" && prev.slug === generateSlug(prev.name)) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Mocking fetch API per .agentrules.md
      // const response = await fetch("http://localhost:5000/api/categories", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error("Lỗi khi thêm danh mục");
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));

      const selectedBrandNames = brands
        .filter(b => formData.brandIds.includes(b.id))
        .map(b => b.name);

      const newCategory = {
        id: Date.now(),
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        status: formData.status,
        brands: selectedBrandNames,
      };

      setCategories((prev) => [...prev, newCategory]);
      
      setFormData({
        name: "",
        slug: "",
        status: 1,
        brandIds: [],
      });

      // Simple alert for user feedback (could be replaced by toast)
      alert("Thêm danh mục thành công!");
    } catch (err) {
      console.error("Lỗi:", err);
      setError(err.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-4 md:p-6 lg:p-8" style={{ fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-[34px] font-semibold text-[#1d1d1f]"
            style={{ fontFamily: "SF Pro Display, system-ui, sans-serif", letterSpacing: "-0.374px", lineHeight: 1.1 }}
          >
            Quản lý danh mục
          </h1>
          <p className="mt-1 text-[17px] text-[#7a7a7a] tracking-[-0.374px]">
            Thêm, sửa, xóa và tổ chức cấu trúc danh mục sản phẩm, đồng thời liên kết với các thương hiệu.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Form Thêm */}
          <div className="lg:col-span-1">
            <div className="rounded-[18px] border border-[#e0e0e0] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.374px]">Thêm danh mục mới</h2>
              
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#1d1d1f]">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Laptops, Điện thoại di động..."
                    className="block w-full rounded-lg border border-[#e0e0e0] px-4 py-2.5 text-sm text-[#1d1d1f] transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-[#1d1d1f]">
                    Đường dẫn (Slug) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="vd: laptops"
                    className="block w-full rounded-lg border border-[#e0e0e0] bg-gray-50 px-4 py-2.5 text-sm text-[#1d1d1f] transition-colors focus:border-[#0066cc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                    required
                  />
                </div>

                {/* Brands Association (Multi-select) */}
                <div>
                  <label htmlFor="brandIds" className="mb-1.5 block text-sm font-medium text-[#1d1d1f]">
                    Thương hiệu liên kết
                  </label>
                  <p className="mb-2 text-xs text-[#7a7a7a]">Giữ phím Ctrl/Cmd để chọn nhiều thương hiệu</p>
                  <select
                    id="brandIds"
                    name="brandIds"
                    multiple
                    value={formData.brandIds}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm text-[#1d1d1f] transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc] min-h-30"
                  >
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id} className="py-1">
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-[#1d1d1f]">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm text-[#1d1d1f] transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                  >
                    <option value={1}>Đang hoạt động</option>
                    <option value={0}>Ngừng hoạt động</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0066cc] px-5.5 py-2.75 text-[17px] font-normal text-white transition-colors hover:bg-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 disabled:bg-blue-300"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <PlusIcon className="h-5 w-5" />
                    )}
                    <span>{isLoading ? "Đang xử lý..." : "Lưu danh mục"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Danh sách danh mục */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-[18px] border border-[#e0e0e0] bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-[#e0e0e0] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.374px]">Danh sách danh mục</h2>
                <div className="relative w-full max-w-xs">
                  <input
                    type="text"
                    placeholder="Tìm kiếm danh mục..."
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
                        Đường dẫn (Slug)
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
                      <tr key={cat.id} className="transition-colors hover:bg-[#fafafc]">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-[14px] font-medium text-[#1d1d1f]">{cat.name}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[14px] text-[#7a7a7a]">
                          {cat.slug}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-50">
                            {cat.brands && cat.brands.length > 0 ? (
                              cat.brands.map((b, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 rounded-md bg-[#f5f5f7] px-2 py-1 text-[12px] font-medium text-[#333333] border border-[#e0e0e0]">
                                  <TagIcon className="h-3 w-3" />
                                  {b}
                                </span>
                              ))
                            ) : (
                              <span className="text-[12px] text-[#7a7a7a] italic">Chưa liên kết</span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3.5 py-2 text-[14px] font-normal ${
                              cat.status === 1 ? "bg-[#f5f5f7] text-[#0066cc]" : "bg-[#f5f5f7] text-[#7a7a7a]"
                            }`}
                          >
                            {cat.status === 1 ? "Hoạt động" : "Đã ẩn"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-[14px] font-medium">
                          <button className="mx-2 text-[#0066cc] transition-colors hover:text-[#0071e3]">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button className="text-red-500 transition-colors hover:text-red-700">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-[#e0e0e0] bg-white px-6 py-4 sm:px-6">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{categories.length}</span> trong số <span className="font-medium">{categories.length}</span> danh mục
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Trước
                  </button>
                  <button className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Sau
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

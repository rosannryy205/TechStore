import { useState } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";

export default function CategoryManagement() {
  // Mock data cho danh sách danh mục
  const [categories, setCategories] = useState([
    { id: 1, name: "Smartphones", slug: "smartphones", parent: "None", status: "Active" },
    { id: 2, name: "Laptops", slug: "laptops", parent: "None", status: "Active" },
    { id: 3, name: "Tablets", slug: "tablets", parent: "None", status: "Active" },
    { id: 4, name: "Accessories", slug: "accessories", parent: "None", status: "Inactive" },
    { id: 5, name: "Gaming Laptops", slug: "gaming-laptops", parent: "Laptops", status: "Active" },
  ]);

  // State form
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent: "",
    status: "Active",
    description: "",
  });
  const [image, setImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Auto-generate slug if name changes and we are creating a new category (simplified logic)
      ...(name === "name" && { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") }),
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newCategory = {
      id: Date.now(),
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      parent: formData.parent || "None",
      status: formData.status,
    };

    setCategories((prev) => [...prev, newCategory]);
    
    // Reset form
    setFormData({
      name: "",
      slug: "",
      parent: "",
      status: "Active",
      description: "",
    });
    setImage(null);

    alert("Thêm danh mục thành công!");
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[#f5f5f7] min-h-screen">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-[34px] font-semibold text-[#1d1d1f]"
            style={{
              fontFamily: "SF Pro Display, system-ui, sans-serif",
              letterSpacing: "-0.374px",
              lineHeight: 1.1,
            }}
          >
            Quản lý danh mục
          </h1>
          <p
            className="mt-1 text-[17px] text-[#7a7a7a]"
            style={{
              fontFamily: "SF Pro Text, system-ui, sans-serif",
              letterSpacing: "-0.374px",
            }}
          >
            Thêm, sửa, xóa và tổ chức cấu trúc danh mục sản phẩm của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Form Thêm/Sửa */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-[#1d1d1f]">Thêm danh mục mới</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Điện thoại di động"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Đường dẫn (Slug)
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="vd: dien-thoai-di-dong"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 transition-colors focus:border-[#0066cc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                  />
                </div>

                {/* Parent Category */}
                <div>
                  <label htmlFor="parent" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Danh mục cha
                  </label>
                  <select
                    id="parent"
                    name="parent"
                    value={formData.parent}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                  >
                    <option value="">Không có (Danh mục gốc)</option>
                    <option value="smartphones">Smartphones</option>
                    <option value="laptops">Laptops</option>
                    <option value="tablets">Tablets</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                  >
                    <option value="Active">Hoạt động</option>
                    <option value="Inactive">Đã ẩn</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Mô tả ngắn về danh mục..."
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                  ></textarea>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Hình ảnh / Icon
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-gray-50">
                      {image ? (
                        <img src={image} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <PhotoIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <label className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                      <span>Chọn ảnh</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0066cc] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Lưu danh mục</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Danh sách danh mục */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-[#1d1d1f]">Danh sách danh mục</h2>
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    placeholder="Tìm kiếm danh mục..."
                    className="block w-full rounded-full border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên danh mục
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đường dẫn (Slug)
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Danh mục cha
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 text-sm">{cat.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cat.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cat.parent === "None" ? <span className="text-gray-400 italic">Gốc</span> : cat.parent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              cat.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {cat.status === "Active" ? "Hoạt động" : "Đã ẩn"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-[#0066cc] hover:text-[#005bb5] mx-2 transition-colors">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button className="text-red-500 hover:text-red-700 transition-colors">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Mock */}
              <div className="border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-between sm:px-6">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">5</span> trong số <span className="font-medium">24</span> danh mục
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

import { useState, useEffect } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Notification from "../../../components/notification";

export default function BrandManagement() {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  // State form
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "1",
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Fetch danh sách thương hiệu khi load trang
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/admin/brands");
        if (response.ok) {
          const data = await response.json();
          // Tuỳ vào response backend, giả sử trả về { data: [...] }
          if (data.data) {
            setBrands(data.data);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách thương hiệu:", err);
      }
    };
    fetchBrands();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Tự động tạo slug khi người dùng nhập tên thương hiệu
      ...(name === "name" && { slug: value.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-") }),
    }));
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("slug", formData.slug);
      payload.append("status", formData.status);
      
      if (logo) {
        payload.append("logo", logo);
      }

      const response = await fetch("http://localhost:3000/api/admin/brands", {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Lỗi khi thêm thương hiệu");
      }

      // Thêm brand mới vào danh sách hiện tại
      setBrands((prev) => [...prev, data.data]);
      
      // Reset form
      setFormData({
        name: "",
        slug: "",
        status: "1",
      });
      setLogo(null);
      setLogoPreview(null);

      setNotification({
        isOpen: true,
        message: "Thêm thương hiệu thành công!",
        type: "success",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-4 md:p-6 lg:p-8">
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
            Quản lý thương hiệu
          </h1>
          <p
            className="mt-1 text-[17px] text-[#7a7a7a]"
            style={{
              fontFamily: "SF Pro Text, system-ui, sans-serif",
              letterSpacing: "-0.374px",
            }}
          >
            Thêm mới, cập nhật thông tin và quản lý danh sách các đối tác thương hiệu.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Form Thêm/Sửa */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-[#1d1d1f]">Thêm thương hiệu mới</h2>
              
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Brand Name */}
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Tên thương hiệu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Apple, Samsung..."
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
                    placeholder="vd: apple"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 transition-colors focus:border-[#0066cc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                  />
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
                    <option value="1">Đang hợp tác</option>
                    <option value="0">Ngừng kinh doanh</option>
                  </select>
                </div>



                {/* Logo Upload */}
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
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="sr-only" />
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0066cc] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 disabled:bg-blue-300"
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
          </div>

          {/* Right Column: Danh sách thương hiệu */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-[#1d1d1f]">Danh sách thương hiệu</h2>
                <div className="relative w-full max-w-xs">
                  <input
                    type="text"
                    placeholder="Tìm kiếm thương hiệu..."
                    className="block w-full rounded-full border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Thương hiệu
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Đường dẫn (Slug)
                      </th>

                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {brands.map((brand) => (
                      <tr key={brand.id} className="transition-colors hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded border border-gray-200 bg-white">
                              {brand.logo ? (
                                <img src={`http://localhost:3000/${brand.logo}`} alt={brand.name} className="h-full w-full object-contain p-0.5" />
                              ) : (
                                <span className="text-xs font-bold text-gray-400">{brand.name.charAt(0)}</span>
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
                          <button className="mx-2 text-[#0066cc] transition-colors hover:text-[#005bb5]">
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
              
              {/* Pagination Mock */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 sm:px-6">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{brands.length}</span> trong số <span className="font-medium">{brands.length}</span> thương hiệu
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

      <Notification
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

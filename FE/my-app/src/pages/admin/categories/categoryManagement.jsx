import { useState, useEffect } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, TagIcon } from "@heroicons/react/24/outline";
import Loading from "../../../components/loading";
import Notification from "../../../components/notification";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [notif, setNotif] = useState({ isOpen: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: 1,
    brandIds: [],
  });

  const showNotification = (message, type = "success") => {
    setNotif({ isOpen: true, message, type });
  };

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
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
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

  const getCategoryBrands = (cat) => {
    if (cat.category_brands && Array.isArray(cat.category_brands)) {
      return cat.category_brands.map((cb) => cb.brand).filter(Boolean);
    }
    if (cat.brands && Array.isArray(cat.brands)) {
      return cat.brands;
    }
    return [];
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };
  useEffect(() => {
    let ignore = false;

    const loadInitialData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("http://localhost:3000/api/categories"),
          fetch("http://localhost:3000/api/admin/brands"),
        ]);
        const [catData, brandData] = await Promise.all([
          catRes.json(),
          brandRes.json(),
        ]);
        if (!ignore) {
          if (catData.success) setCategories(catData.data);
          if (brandData.success) setBrands(brandData.data);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Lỗi khi thêm danh mục");
      }
      
      showNotification("Thêm danh mục thành công", "success");
      
      setFormData({
        name: "",
        slug: "",
        status: 1,
        brandIds: [],
      });

      fetchCategories();
    } catch (err) {
      console.error("L?i:", err);
      setError(err.message);
      showNotification(err.message || "Thêm danh mục thất bại", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-4 md:p-6 lg:p-8" style={{ fontFamily: "SF Pro Text, system-ui, sans-serif" }}>
      <Notification
        isOpen={notif.isOpen}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif(prev => ({ ...prev, isOpen: false }))}
      />
      <Loading shouldShow={isLoading} variant="fullscreen" />
      
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1
            className="text-[34px] font-semibold text-[#1d1d1f]"
            style={{ fontFamily: "SF Pro Display, system-ui, sans-serif", letterSpacing: "-0.374px", lineHeight: 1.1 }}
          >
            Quản lý danh mục
          </h1>
          <p className="mt-1 text-[17px] text-[#7a7a7a] tracking-[-0.374px]">
            
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-[18px] border border-[#e0e0e0] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.374px]">Thêm danh mục mới</h2>
              
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm text-[#1d1d1f] transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc] min-h-30"
                  >
                    {brands.map(brand => (
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
                    onChange={handleInputChange}
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
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0066cc] px-5.5 py-2.75 text-[17px] font-normal text-white transition-colors hover:bg-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 disabled:bg-blue-300"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <PlusIcon className="h-5 w-5" />
                    )}
                    <span>{isLoading ? "Đang xử lý" : "Luu danh mục"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-[18px] border border-[#e0e0e0] bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-[#e0e0e0] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.374px]">Danh sách danh mục</h2>
                <div className="relative w-full max-w-xs">
                  <input
                    type="text"
                    placeholder="Tìm kiếm danh mục"
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
                        Đường dẫn
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
                      <tr key={cat.id || cat._id} className="transition-colors hover:bg-[#fafafc]">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-[14px] font-medium text-[#1d1d1f]">{cat.name}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[14px] text-[#7a7a7a]">
                          {cat.slug}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {(() => {
                              const categoryBrands = getCategoryBrands(cat);
                              return categoryBrands.length > 0 ? (
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
                              );
                            })()}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={"inline-flex rounded-full px-3.5 py-2 text-[14px] font-normal " + (
                              cat.status === 1 ? "bg-[#f5f5f7] text-[#0066cc]" : "bg-[#f5f5f7] text-[#7a7a7a]"
                            )}
                          >
                            {cat.status === 1 ? "Hoạt động" : "Ngừng"}
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
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                         Chưa có danh mục nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="flex items-center justify-between border-t border-[#e0e0e0] bg-white px-6 py-4 sm:px-6">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{categories.length > 0 ? 1 : 0}</span> đến <span className="font-medium">{categories.length}</span> trong số <span className="font-medium">{categories.length}</span> danh mục
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

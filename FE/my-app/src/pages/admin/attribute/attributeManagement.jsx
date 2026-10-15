import { useState } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Notification from "../../../components/notification";

export default function AttributeManagement() {
  const [attributes, setAttributes] = useState([
    { id: 1, name: "Màu sắc", values: "Đỏ, Đen, Trắng, Xanh", status: 1 },
    { id: 2, name: "Dung lượng", values: "128GB, 256GB, 512GB", status: 1 },
    { id: 3, name: "RAM", values: "8GB, 16GB", status: 1 },
  ]);
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
    values: "",
    status: "1",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Giả lập call API
    setTimeout(() => {
      const newAttribute = {
        id: Date.now(),
        name: formData.name,
        values: formData.values,
        status: parseInt(formData.status),
      };

      setAttributes((prev) => [...prev, newAttribute]);
      
      setFormData({
        name: "",
        values: "",
        status: "1",
      });

      setNotification({
        isOpen: true,
        message: "Thêm biến thể thành công!",
        type: "success",
      });
      setIsLoading(false);
    }, 500);
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
            Quản lý biến thể
          </h1>
          <p
            className="mt-1 text-[17px] text-[#7a7a7a]"
            style={{
              fontFamily: "SF Pro Text, system-ui, sans-serif",
              letterSpacing: "-0.374px",
            }}
          >
            Thêm mới, cập nhật thông tin và quản lý danh sách các thuộc tính biến thể của sản phẩm.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Form Thêm/Sửa */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-[#1d1d1f]">Thêm biến thể mới</h2>
              
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Attribute Name */}
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Tên biến thể <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Màu sắc, Dung lượng..."
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                    required
                  />
                </div>

                {/* Values */}
                <div>
                  <label htmlFor="values" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Các giá trị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="values"
                    name="values"
                    value={formData.values}
                    onChange={handleInputChange}
                    placeholder="Phân cách bằng dấu phẩy (Đỏ, Xanh...)"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Nhập các giá trị cách nhau bằng dấu phẩy (,).</p>
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
                    <option value="1">Đang hoạt động</option>
                    <option value="0">Tạm ẩn</option>
                  </select>
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
                    <span>{isLoading ? "Đang xử lý..." : "Lưu biến thể"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Danh sách biến thể */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-[#1d1d1f]">Danh sách biến thể</h2>
                <div className="relative w-full max-w-xs">
                  <input
                    type="text"
                    placeholder="Tìm kiếm biến thể..."
                    className="block w-full rounded-full border border-gray-300 px-4 py-2 text-sm transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Tên biến thể
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Các giá trị
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
                    {attributes.map((attribute) => (
                      <tr key={attribute.id} className="transition-colors hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{attribute.name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {attribute.values.split(',').map((val, idx) => (
                            <span key={idx} className="inline-block mr-1 mb-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                              {val.trim()}
                            </span>
                          ))}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              attribute.status === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {attribute.status === 1 ? "Đang hoạt động" : "Tạm ẩn"}
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
                  Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{attributes.length}</span> trong số <span className="font-medium">{attributes.length}</span> biến thể
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

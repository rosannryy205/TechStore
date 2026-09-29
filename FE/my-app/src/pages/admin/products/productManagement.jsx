import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Notification from '../../../components/notification';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  EyeSlashIcon,
  EyeIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState([]);

  const location = useLocation();
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    if (location.state?.message) {
      const timer = setTimeout(() => {
        setNotification({
          isOpen: true,
          message: location.state.message,
          type: location.state.type || "success"
        });
      }, 0);
      // Clear location state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/admin/products');
        const data = await response.json();
        if (data.success && data.data) {
          const mappedProducts = data.data.map(p => ({
            id: p.id,
            name: p.name,
            category: "Danh mục " + p.category_id,
            price: p.variants && p.variants.length > 0 ? p.variants[0].price : 0,
            stock: p.variants ? p.variants.reduce((acc, v) => acc + v.stock, 0) : 0,
            status: p.status === 1 ? 'Còn hàng' : 'Hết hàng',
            image: p.images && p.images.length > 0 ? 'http://localhost:3000' + p.images[0].img_url : 'https://placehold.co/100',
            isHidden: false,
            variants: p.variants ? p.variants.map(v => ({
              id: v.id,
              name: `${v.ram || ''} ${v.storage || ''} ${v.color || ''}`.trim() || 'Mặc định',
              price: v.price,
              stock: v.stock
            })) : []
          }));
          setProducts(mappedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleHideProduct = (id) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, isHidden: !product.isHidden } : product
    ));
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Còn hàng': return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
      case 'Sắp hết': return 'bg-amber-100 text-amber-700 ring-amber-600/20';
      case 'Hết hàng': return 'bg-rose-100 text-rose-700 ring-rose-600/20';
      default: return 'bg-gray-100 text-gray-700 ring-gray-500/20';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans text-[#1d1d1f]">
      <Notification
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      />
      {/* Header & Actions */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-[34px] md:text-[40px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">Quản lý sản phẩm</h1>
          <p className="mt-2 text-[17px] text-gray-500 font-normal">
            Kiểm soát danh mục sản phẩm, biến thể, giá bán, tồn kho và khả năng hiển thị.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link
            to="/admin/product/add-product"
            className="inline-flex items-center justify-center rounded-full bg-[#0066cc] px-6 py-3 text-[17px] font-normal text-white shadow-sm hover:scale-95 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] transition-transform sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative max-w-md w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border-0 py-3 pl-11 pr-4 text-[#1d1d1f] ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0066cc] text-[17px] shadow-sm transition-shadow"
            placeholder="Tìm kiếm sản phẩm hoặc danh mục..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-4 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden bg-white shadow-sm ring-1 ring-black/5 rounded-[18px]">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-[#f5f5f7]">
                  <tr>
                    <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sm:pl-6 w-10">
                    </th>
                    <th scope="col" className="py-4 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Danh mục
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Giá bán (Từ)
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Tổng tồn kho
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Trạng thái
                    </th>
                    <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Thao tác</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-100 border-t-[#0066cc] mb-4"></div>
                          <p className="text-[14px] text-gray-500 font-medium">Đang tải dữ liệu...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <React.Fragment key={product.id}>
                        <tr 
                          className={"transition-colors hover:bg-gray-50/80 " + (product.isHidden ? "bg-gray-50/50 opacity-75 grayscale-20" : "")}
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-1 sm:pl-6 text-center">
                            {product.variants && product.variants.length > 0 && (
                              <button 
                                onClick={() => toggleRow(product.id)}
                                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066cc]"
                              >
                                {expandedRows.includes(product.id) ? (
                                  <ChevronDownIcon className="h-5 w-5" />
                                ) : (
                                  <ChevronRightIcon className="h-5 w-5" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-[14px]">
                            <div className="flex items-center">
                              <div className="h-11 w-11 shrink-0 hidden sm:block relative">
                                <img className="h-11 w-11 rounded-lg object-cover border border-gray-200 shadow-sm" src={product.image} alt={product.name} />
                                {product.isHidden && (
                                  <div className="absolute inset-0 bg-white/60 rounded-lg flex items-center justify-center">
                                    <EyeSlashIcon className="h-5 w-5 text-gray-600" />
                                  </div>
                                )}
                              </div>
                              <div className="sm:ml-4">
                                <div className="font-semibold text-[#1d1d1f] text-[17px] truncate max-w-37.5 sm:max-w-50 lg:max-w-62.5">
                                  {product.name}
                                </div>
                                {product.variants && product.variants.length > 0 && (
                                  <div className="text-[12px] text-gray-500 mt-0.5">{product.variants.length} biến thể</div>
                                )}
                                {product.isHidden && <span className="mt-1 inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 sm:hidden">Ẩn</span>}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-[17px] text-gray-500 hidden sm:table-cell">
                            {product.category}
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-[17px] text-[#1d1d1f] font-medium">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-[14px] text-gray-500 hidden md:table-cell">
                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                              {product.stock}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-[14px] hidden lg:table-cell">
                            <span className={"inline-flex items-center rounded-md px-2 py-1 font-medium ring-1 ring-inset " + getStatusColor(product.status)}>
                              {product.status}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-[14px] font-medium sm:pr-6">
                            <div className="flex justify-end items-center gap-2">
                              {/* Nút Ẩn/Hiện */}
                              <button 
                                onClick={() => toggleHideProduct(product.id)}
                                className={"p-1.5 rounded-lg transition-colors " + (product.isHidden ? "text-amber-600 hover:text-amber-900 hover:bg-amber-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100")} 
                                title={product.isHidden ? "Hiển thị sản phẩm" : "Ẩn sản phẩm"}
                              >
                                {product.isHidden ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                              </button>
                              
                              <button className="text-[#0066cc] hover:text-[#0071e3] p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Chỉnh sửa">
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              
                              <button className="text-rose-600 hover:text-rose-900 p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="Xóa">
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Variant Row */}
                        {expandedRows.includes(product.id) && product.variants && product.variants.length > 0 && (
                          <tr>
                            <td colSpan="7" className="bg-[#fafafc] p-0 border-b border-gray-100">
                              <div className="pl-18 sm:pl-26 pr-6 py-4">
                                <table className="min-w-full divide-y divide-gray-100">
                                  <thead className="text-[12px] text-gray-500 uppercase tracking-wider">
                                    <tr>
                                      <th className="text-left font-semibold py-2">Mẫu / Màu sắc / Dung lượng</th>
                                      <th className="text-left font-semibold py-2">Giá bán</th>
                                      <th className="text-left font-semibold py-2">Tồn kho</th>
                                      <th className="text-right font-semibold py-2">Thao tác</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {product.variants.map(variant => (
                                      <tr key={variant.id} className="hover:bg-white transition-colors">
                                        <td className="py-3 text-[14px] text-gray-700">{variant.name}</td>
                                        <td className="py-3 text-[14px] font-medium text-[#1d1d1f]">{formatCurrency(variant.price)}</td>
                                        <td className="py-3 text-[14px] text-gray-600">
                                          {variant.stock > 0 ? (
                                            <span className="text-emerald-600">{variant.stock}</span>
                                          ) : (
                                            <span className="text-rose-600">Hết hàng</span>
                                          )}
                                        </td>
                                        <td className="py-3 text-right">
                                          <div className="flex justify-end gap-1">
                                            <button className="text-[#0066cc] hover:bg-blue-50 p-1 rounded-md transition-colors" title="Chỉnh sửa biến thể">
                                              <PencilSquareIcon className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div className="mt-3">
                                  <button className="text-[14px] text-[#0066cc] hover:text-[#0071e3] font-medium inline-flex items-center transition-colors">
                                    <PlusIcon className="h-4 w-4 mr-1" /> Thêm biến thể
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-16 text-center text-[14px] text-gray-500">
                        <div className="flex flex-col items-center">
                          <MagnifyingGlassIcon className="h-10 w-10 text-gray-300 mb-3" />
                          <p className="font-medium text-[#1d1d1f]">Không tìm thấy kết quả</p>
                          <p className="mt-1">Thử điều chỉnh từ khóa tìm kiếm của bạn.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  EyeSlashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// Mock API tĩnh - Thêm thuộc tính isHidden
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    category: 'Điện thoại',
    price: 29990000,
    stock: 45,
    status: 'Còn hàng',
    image: 'https://via.placeholder.com/150/000000/FFFFFF/?text=IP15',
    isHidden: false,
  },
  {
    id: 2,
    name: 'MacBook Air M2 8GB/256GB',
    category: 'Laptop',
    price: 24500000,
    stock: 12,
    status: 'Còn hàng',
    image: 'https://via.placeholder.com/150/000000/FFFFFF/?text=Mac',
    isHidden: false,
  },
  {
    id: 3,
    name: 'Tai nghe Bluetooth AirPods Pro 2',
    category: 'Phụ kiện',
    price: 5500000,
    stock: 0,
    status: 'Hết hàng',
    image: 'https://via.placeholder.com/150/000000/FFFFFF/?text=AirPods',
    isHidden: true,
  },
  {
    id: 4,
    name: 'Samsung Galaxy S24 Ultra 512GB',
    category: 'Điện thoại',
    price: 31990000,
    stock: 20,
    status: 'Còn hàng',
    image: 'https://via.placeholder.com/150/000000/FFFFFF/?text=S24',
    isHidden: false,
  },
  {
    id: 5,
    name: 'Bàn phím cơ Logitech MX Mechanical',
    category: 'Phụ kiện',
    price: 3900000,
    stock: 5,
    status: 'Sắp hết',
    image: 'https://via.placeholder.com/150/000000/FFFFFF/?text=Logi',
    isHidden: false,
  }
];

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Giả lập gọi API (Mock API)
  useEffect(() => {
    const fetchProducts = () => {
      setTimeout(() => {
        setProducts(MOCK_PRODUCTS);
        setLoading(false);
      }, 600);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý sản phẩm</h1>
          <p className="mt-2 text-sm text-gray-500">
            Kiểm soát danh mục sản phẩm, giá bán, tồn kho và khả năng hiển thị trên cửa hàng.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link
            to="/admin/product/add-product"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative max-w-md w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 shadow-sm transition-shadow"
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
            <div className="overflow-hidden bg-white shadow-sm ring-1 ring-black/5 sm:rounded-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sm:pl-6">
                      Sản phẩm
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Danh mục
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Giá bán
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Tồn kho
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
                      <td colSpan="6" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-100 border-t-blue-600 mb-4"></div>
                          <p className="text-sm text-gray-500 font-medium">Đang tải dữ liệu...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr 
                        key={product.id} 
                        className={`transition-colors hover:bg-gray-50/80 ${product.isHidden ? 'bg-gray-50/50 opacity-75 grayscale-20' : ''}`}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
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
                              <div className="font-medium text-gray-900 truncate max-w-37.5 sm:max-w-50 lg:max-w-62.5">
                                {product.name}
                                {product.isHidden && <span className="ml-2 inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 sm:hidden">Ẩn</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 hidden sm:table-cell">
                          {product.category}
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-900 font-medium">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 hidden md:table-cell">
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            {product.stock}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm hidden lg:table-cell">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(product.status)}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end items-center gap-2">
                            {/* Nút Ẩn/Hiện */}
                            <button 
                              onClick={() => toggleHideProduct(product.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                product.isHidden 
                                ? 'text-amber-600 hover:text-amber-900 hover:bg-amber-50' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                              }`} 
                              title={product.isHidden ? "Hiển thị sản phẩm" : "Ẩn sản phẩm"}
                            >
                              {product.isHidden ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                            
                            <button className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors" title="Chỉnh sửa">
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            
                            <button className="text-rose-600 hover:text-rose-900 p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="Xóa">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center">
                          <MagnifyingGlassIcon className="h-10 w-10 text-gray-300 mb-3" />
                          <p className="font-medium text-gray-900">Không tìm thấy kết quả</p>
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

import  { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const MOCK_INVENTORY = [
  { id: 1, sku: 'IP15-PM-256', name: 'iPhone 15 Pro Max 256GB', stock: 45, minStock: 10, status: 'In Stock' },
  { id: 2, sku: 'MAC-AIR-M2', name: 'MacBook Air M2 8GB/256GB', stock: 12, minStock: 15, status: 'Low Stock' },
  { id: 3, sku: 'AP-PRO-2', name: 'AirPods Pro 2', stock: 0, minStock: 20, status: 'Out of Stock' },
  { id: 4, sku: 'SS-S24-U', name: 'Samsung Galaxy S24 Ultra 512GB', stock: 20, minStock: 10, status: 'In Stock' },
  { id: 5, sku: 'LOGI-MX-M', name: 'Logitech MX Mechanical', stock: 5, minStock: 5, status: 'Low Stock' }
];

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập tải API
    const timer = setTimeout(() => {
      setInventory(MOCK_INVENTORY);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleUpdateStock = (id, newStock) => {
    if (newStock < 0) return;
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const updatedStatus = newStock === 0 ? 'Out of Stock' : (newStock <= item.minStock ? 'Low Stock' : 'In Stock');
        return { ...item, stock: newStock, status: updatedStatus };
      }
      return item;
    }));
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'text-[#1d1d1f]';
      case 'Low Stock': return 'text-[#e5a00d]'; // Cảnh báo mức độ thấp
      case 'Out of Stock': return 'text-[#ff3b30]'; // Hết hàng
      default: return 'text-[#7a7a7a]';
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6 md:p-10 lg:p-16 font-sans text-[#1d1d1f]">
      <div className="max-w-300 mx-auto">
        
        {/* Header - Typography Display-lg (40px) */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-[40px] leading-[1.1] font-semibold tracking-tight">
              Quản lý tồn kho
            </h1>
            <p className="mt-3 text-[17px] leading-[1.47] tracking-[-0.374px] text-[#7a7a7a]">
              Theo dõi và cập nhật số lượng tồn kho của tất cả sản phẩm.
            </p>
          </div>
          <div className="flex items-center">
            {/* Primary Action Button (Pill shape, Action Blue) */}
            <button 
              className="inline-flex items-center justify-center bg-[#0066cc] text-white text-[17px] font-normal rounded-full px-5.5 py-2.75 hover:bg-[#0071e3] transition-transform active:scale-95"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <MagnifyingGlassIcon className="h-5 w-5 text-[#7a7a7a]" aria-hidden="true" />
            </div>
            {/* Search Input (Pill shape) */}
            <input
              type="text"
              className="block w-full bg-white border border-[#e0e0e0] text-[#1d1d1f] text-[17px] rounded-full py-3 pl-12 pr-5 focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-colors placeholder:text-[#7a7a7a]"
              placeholder="Tìm kiếm theo mã SKU hoặc tên..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Data Card (Store Utility Card style - no shadow, 18px radius) */}
        <div className="bg-white border border-[#e0e0e0] rounded-[18px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#f0f0f0]">
              <thead>
                <tr>
                  <th scope="col" className="py-5 pl-6 pr-3 text-left text-[14px] font-semibold text-[#7a7a7a] tracking-[-0.224px]">
                    SKU
                  </th>
                  <th scope="col" className="px-3 py-5 text-left text-[14px] font-semibold text-[#7a7a7a] tracking-[-0.224px]">
                    Tên sản phẩm
                  </th>
                  <th scope="col" className="px-3 py-5 text-left text-[14px] font-semibold text-[#7a7a7a] tracking-[-0.224px]">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-3 py-5 text-right text-[14px] font-semibold text-[#7a7a7a] tracking-[-0.224px] hidden sm:table-cell">
                    Mức tối thiểu
                  </th>
                  <th scope="col" className="px-6 py-5 text-right text-[14px] font-semibold text-[#7a7a7a] tracking-[-0.224px]">
                    Tồn kho
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-24 text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#e0e0e0] border-t-[#0066cc]"></div>
                    </td>
                  </tr>
                ) : filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fafafc] transition-colors">
                      <td className="whitespace-nowrap py-5 pl-6 pr-3 text-[14px] font-normal text-[#1d1d1f]">
                        {item.sku}
                      </td>
                      <td className="py-5 px-3 text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.374px]">
                        {item.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-[14px] font-medium tracking-[-0.224px]">
                        <span className={`flex items-center gap-1.5 ${getStatusColor(item.status)}`}>
                          {item.status === 'Low Stock' || item.status === 'Out of Stock' ? (
                            <ExclamationTriangleIcon className="w-4 h-4" />
                          ) : null}
                          {item.status === 'In Stock' ? 'Bình thường' : item.status === 'Low Stock' ? 'Sắp hết' : 'Hết hàng'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-right text-[17px] text-[#7a7a7a] hidden sm:table-cell">
                        {item.minStock}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleUpdateStock(item.id, item.stock - 1)}
                            className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e0e0e0] transition-colors active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                            disabled={item.stock <= 0}
                          >
                            -
                          </button>
                          <span className="w-12 text-center text-[17px] font-semibold text-[#1d1d1f]">
                            {item.stock}
                          </span>
                          <button 
                            onClick={() => handleUpdateStock(item.id, item.stock + 1)}
                            className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e0e0e0] transition-colors active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-24 text-center text-[17px] text-[#7a7a7a] tracking-[-0.374px]">
                      Không tìm thấy sản phẩm nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}


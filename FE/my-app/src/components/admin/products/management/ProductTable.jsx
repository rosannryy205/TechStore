import { Fragment } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ProductTableRow from "./ProductTableRow";
import ProductVariantRow from "./ProductVariantRow";

export default function ProductTable({
  products = [],
  loading,
  expandedRows = [],
  onToggleRow,
  onToggleHide,
}) {
  return (
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
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <Fragment key={product.id}>
                      <ProductTableRow
                        product={product}
                        isExpanded={expandedRows.includes(product.id)}
                        onToggleRow={onToggleRow}
                        onToggleHide={onToggleHide}
                      />
                      {expandedRows.includes(product.id) &&
                        product.variants &&
                        product.variants.length > 0 && (
                          <ProductVariantRow variants={product.variants} />
                        )}
                    </Fragment>
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
  );
}

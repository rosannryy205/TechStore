import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function ProductManagementHeader() {
  return (
    <div className="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-[34px] md:text-[40px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">
          Quản lý sản phẩm
        </h1>
        <p className="mt-2 text-[17px] text-gray-500 font-normal">
          Kiểm soát danh mục sản phẩm, biến thể, giá bán, tồn kho và khả năng hiển thị.
        </p>
      </div>
      <div className="mt-4 sm:mt-0 flex gap-3">
        <Link
          to="/admin/product/add-product"
          className="inline-flex items-center justify-center rounded-full bg-[#0066cc] px-6 py-3 text-[17px] font-normal text-white shadow-sm hover:scale-95 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] transition-transform sm:w-auto no-underline"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Thêm sản phẩm
        </Link>
      </div>
    </div>
  );
}

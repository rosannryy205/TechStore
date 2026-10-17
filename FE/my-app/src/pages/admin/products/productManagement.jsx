import Notification from "@/components/notification";
import { useAdminProducts } from "@/hooks/admin/useAdminProducts";
import ProductManagementHeader from "@/components/admin/products/management/ProductManagementHeader";
import ProductFilterBar from "@/components/admin/products/management/ProductFilterBar";
import ProductTable from "@/components/admin/products/management/ProductTable";

export default function ProductManagement() {
  const {
    filteredProducts,
    searchTerm,
    loading,
    expandedRows,
    notification,
    closeNotification,
    handleSearch,
    toggleHideProduct,
    toggleRow,
  } = useAdminProducts();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans text-[#1d1d1f]">
      <Notification
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />

      <ProductManagementHeader />

      <ProductFilterBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
      />

      <ProductTable
        products={filteredProducts}
        loading={loading}
        expandedRows={expandedRows}
        onToggleRow={toggleRow}
        onToggleHide={toggleHideProduct}
      />
    </div>
  );
}

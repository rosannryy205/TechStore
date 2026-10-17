import { useAdminInventory } from "@/hooks/admin/useAdminInventory";
import { InventoryHeader } from "@/components/admin/products/inventory/InventoryHeader";
import { InventorySearchBar } from "@/components/admin/products/inventory/InventorySearchBar";
import { InventoryTable } from "@/components/admin/products/inventory/InventoryTable";

export default function InventoryManagement() {
  const {
    filteredInventory,
    searchTerm,
    loading,
    handleSearch,
    handleUpdateStock,
  } = useAdminInventory();

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6 md:p-10 lg:p-16 font-sans text-[#1d1d1f]">
      <div className="max-w-300 mx-auto">
        <InventoryHeader />
        <InventorySearchBar
          searchTerm={searchTerm}
          onSearch={handleSearch}
        />
        <InventoryTable
          items={filteredInventory}
          loading={loading}
          onUpdateStock={handleUpdateStock}
        />
      </div>
    </div>
  );
}

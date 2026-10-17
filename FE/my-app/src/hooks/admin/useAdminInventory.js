import { useState, useEffect, useMemo } from "react";

const MOCK_INVENTORY = [
  { id: 1, sku: "IP15-PM-256", name: "iPhone 15 Pro Max 256GB", stock: 45, minStock: 10, status: "In Stock" },
  { id: 2, sku: "MAC-AIR-M2", name: "MacBook Air M2 8GB/256GB", stock: 12, minStock: 15, status: "Low Stock" },
  { id: 3, sku: "AP-PRO-2", name: "AirPods Pro 2", stock: 0, minStock: 20, status: "Out of Stock" },
  { id: 4, sku: "SS-S24-U", name: "Samsung Galaxy S24 Ultra 512GB", stock: 20, minStock: 10, status: "In Stock" },
  { id: 5, sku: "LOGI-MX-M", name: "Logitech MX Mechanical", stock: 5, minStock: 5, status: "Low Stock" },
];

export function useAdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInventory(MOCK_INVENTORY);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleUpdateStock = (id, newStock) => {
    if (newStock < 0) return;
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedStatus =
            newStock === 0
              ? "Out of Stock"
              : newStock <= item.minStock
              ? "Low Stock"
              : "In Stock";
          return { ...item, stock: newStock, status: updatedStatus };
        }
        return item;
      })
    );
  };

  const filteredInventory = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return inventory.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term)
    );
  }, [inventory, searchTerm]);

  return {
    inventory,
    filteredInventory,
    searchTerm,
    loading,
    handleSearch,
    handleUpdateStock,
  };
}

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { adminProductService } from "@/services/api/admin/productService";
import { API_BASE_URL } from "@/constants/api";

export function useAdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
          type: location.state.type || "success",
        });
      }, 0);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await adminProductService.getProducts();
        if (!ignore && data) {
          const mappedProducts = data.map((p) => ({
            id: p.id,
            name: p.name,
            category: "Danh mục " + p.category_id,
            price: p.variants && p.variants.length > 0 ? p.variants[0].price : 0,
            stock: p.variants ? p.variants.reduce((acc, v) => acc + v.stock, 0) : 0,
            status: p.status === 1 ? "Còn hàng" : "Hết hàng",
            image:
              p.images && p.images.length > 0
                ? `${API_BASE_URL}${p.images[0].img_url}`
                : "https://placehold.co/100",
            isHidden: false,
            variants: p.variants
              ? p.variants.map((v) => ({
                  id: v.id,
                  name:
                    `${v.ram || ""} ${v.storage || ""} ${v.color || ""}`.trim() ||
                    "Mặc định",
                  price: v.price,
                  stock: v.stock,
                }))
              : [],
          }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleHideProduct = (id) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, isHidden: !product.isHidden } : product
      )
    );
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    products,
    filteredProducts,
    searchTerm,
    loading,
    expandedRows,
    notification,
    closeNotification,
    handleSearch,
    toggleHideProduct,
    toggleRow,
  };
}

import { useState, useEffect } from "react";
import { categoryService } from "@/services/api/admin/categoryService";
import { brandService } from "@/services/api/admin/brandService";
import { generateSlug } from "@/utils/slugify";

export function useAdminCategories() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notif, setNotif] = useState({ isOpen: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: 1,
    brandIds: [],
  });

  const showNotification = (message, type = "success") => {
    setNotif({ isOpen: true, message, type });
  };

  const closeNotification = () => {
    setNotif((prev) => ({ ...prev, isOpen: false }));
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadInitialData = async () => {
      try {
        const [cats, brs] = await Promise.all([
          categoryService.getCategories(),
          brandService.getBrands(),
        ]);
        if (!ignore) {
          setCategories(cats);
          setBrands(brs);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };

    loadInitialData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "select-multiple") {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData((prev) => ({ ...prev, [name]: selectedOptions }));
      return;
    }

    setFormData((prev) => {
      const newData = { ...prev, [name]: name === "status" ? parseInt(value) : value };
      if (name === "name" && prev.slug === generateSlug(prev.name)) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await categoryService.createCategory(formData);
      showNotification("Thêm danh mục thành công", "success");
      setFormData({
        name: "",
        slug: "",
        status: 1,
        brandIds: [],
      });
      await fetchCategories();
    } catch (err) {
      setError(err?.message || "Thêm danh mục thất bại");
      showNotification(err?.message || "Thêm danh mục thất bại", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories,
    brands,
    isLoading,
    error,
    notif,
    closeNotification,
    formData,
    handleInputChange,
    handleSubmit,
  };
}

import { useState, useEffect, useCallback } from "react";
import { brandService } from "@/services/api/admin/brandService";
import { generateSlug } from "@/utils/slugify";

export function useAdminBrands() {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "1",
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const fetchBrands = useCallback(async () => {
    try {
      const data = await brandService.getBrands();
      setBrands(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách thương hiệu:", err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const data = await brandService.getBrands();
        if (!ignore) {
          setBrands(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách thương hiệu:", err);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && { slug: generateSlug(value) }),
    }));
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("slug", formData.slug);
      payload.append("status", formData.status);

      if (logo) {
        payload.append("logo", logo);
      }

      const res = await brandService.createBrand(payload);

      setBrands((prev) => [...prev, res.data || res]);
      setFormData({
        name: "",
        slug: "",
        status: "1",
      });
      setLogo(null);
      setLogoPreview(null);

      setNotification({
        isOpen: true,
        message: "Thêm thương hiệu thành công!",
        type: "success",
      });
    } catch (err) {
      setError(err?.message || "Lỗi khi thêm thương hiệu");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    brands,
    isLoading,
    error,
    notification,
    closeNotification,
    formData,
    logoPreview,
    handleInputChange,
    handleLogoChange,
    handleSubmit,
    fetchBrands,
  };
}

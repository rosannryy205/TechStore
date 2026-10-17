import { useState, useEffect } from "react";
import { attributeService } from "@/services/api/admin/attributeService";

export function useAdminAttributes() {
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    name: "",
    values: "",
    status: "1",
  });

  useEffect(() => {
    let ignore = false;
    const loadAttributes = async () => {
      const data = await attributeService.getAttributes();
      if (!ignore) {
        setAttributes(data);
      }
    };
    loadAttributes();
    return () => {
      ignore = true;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const newAttribute = {
        name: formData.name,
        values: formData.values,
        status: parseInt(formData.status),
      };

      const res = await attributeService.createAttribute(newAttribute);
      const created = res.data || { id: Date.now(), ...newAttribute };

      setAttributes((prev) => [...prev, created]);
      setFormData({
        name: "",
        values: "",
        status: "1",
      });

      setNotification({
        isOpen: true,
        message: "Thêm biến thể thành công!",
        type: "success",
      });
    } catch (err) {
      setError(err?.message || "Lỗi khi lưu biến thể");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    attributes,
    isLoading,
    error,
    notification,
    closeNotification,
    formData,
    handleInputChange,
    handleSubmit,
  };
}

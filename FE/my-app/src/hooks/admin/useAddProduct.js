import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { categoryService } from "@/services/api/admin/categoryService";
import { brandService } from "@/services/api/admin/brandService";
import { adminProductService } from "@/services/api/admin/productService";
import { generateVariantMatrix } from "@/utils/cartesianGenerator";

export function useAddProduct() {
  const navigate = useNavigate();

  const [productData, setProductData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
  });

  const [variants, setVariants] = useState([]);
  const [productAttributes, setProductAttributes] = useState([
    { localId: 1, attribute_id: "", values: "" },
  ]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkSalePrice, setBulkSalePrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variantAttributes, setVariantAttributes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ isOpen: true, message, type });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const [catData, brandData, attrData] = await Promise.all([
          categoryService.getCategories(),
          brandService.getBrands(),
          adminProductService.getVariantAttributes(),
        ]);

        if (isMounted) {
          setCategories(catData || []);
          setBrands(brandData || []);
          setVariantAttributes(attrData || []);
        }
      } catch (error) {
        console.error("Lỗi khi fetch metadata:", error);
      }
    };

    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProductAttribute = () => {
    setProductAttributes((prev) => [
      ...prev,
      { localId: Date.now(), attribute_id: "", values: "" },
    ]);
  };

  const handleProductAttributeChange = (index, field, value) => {
    setProductAttributes((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleRemoveProductAttribute = (index) => {
    setProductAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateVariants = () => {
    if (!productData.name) {
      showNotification(
        "Vui lòng nhập tên sản phẩm trước khi tạo biến thể (để tạo SKU).",
        "error"
      );
      return;
    }

    const map = {};
    productAttributes.forEach((pa) => {
      if (pa.attribute_id && pa.values.trim() !== "") {
        const attrObj = variantAttributes.find(
          (a) => String(a.id) === String(pa.attribute_id)
        );
        if (attrObj) {
          const opts = pa.values
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v !== "");
          if (opts.length > 0) {
            map[pa.attribute_id] = {
              attr: attrObj,
              options: opts.map((v) => ({ id: null, value: v })),
            };
          }
        }
      }
    });

    if (Object.keys(map).length === 0) {
      showNotification(
        "Vui lòng chọn thuộc tính và nhập giá trị trước khi tạo.",
        "error"
      );
      return;
    }

    const newVariants = generateVariantMatrix(map, variants, productData.name);
    if (newVariants.length > 500) {
      showNotification(
        "Số lượng biến thể quá lớn. Vui lòng giảm bớt tùy chọn.",
        "error"
      );
      return;
    }

    setVariants(newVariants);
    showNotification(`Đã tạo ${newVariants.length} biến thể.`);
  };

  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleBulkApply = () => {
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        price: bulkPrice !== "" ? Number(bulkPrice) : v.price,
        salePrice: bulkSalePrice !== "" ? Number(bulkSalePrice) : v.salePrice,
        stock: bulkStock !== "" ? Number(bulkStock) : v.stock,
      }))
    );
    showNotification("Đã áp dụng giá/stock hàng loạt.");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((f) => ({
      url: URL.createObjectURL(f),
      file: f,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const target = prev[index];
      if (target?.url) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("category_id", productData.category);
      formData.append("brand_id", productData.brand);
      formData.append("description", productData.description);
      formData.append("status", 1);

      const variantsPayload = variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        price: v.price || 0,
        sale_price: v.salePrice || v.price || 0,
        stock: v.stock || 0,
        status: 1,
        attributes: v.attributes,
      }));

      formData.append("variants", JSON.stringify(variantsPayload));

      images.forEach((img) => {
        formData.append("images", img.file);
      });

      const response = await adminProductService.createProduct(formData);

      if (response) {
        showNotification("Thêm sản phẩm thành công!");
        setTimeout(() => {
          navigate("/admin/products", {
            state: { message: "Thêm sản phẩm thành công!", type: "success" },
          });
        }, 1500);
      }
    } catch (error) {
      console.error("Submit product error:", error);
      const errorMsg =
        error.payload?.message ||
        error.message ||
        "Thêm sản phẩm thất bại";
      showNotification(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    productData,
    variants,
    productAttributes,
    bulkPrice,
    setBulkPrice,
    bulkSalePrice,
    setBulkSalePrice,
    bulkStock,
    setBulkStock,
    images,
    categories,
    brands,
    variantAttributes,
    notification,
    submitting,
    closeNotification,
    handleInputChange,
    handleAddProductAttribute,
    handleProductAttributeChange,
    handleRemoveProductAttribute,
    handleGenerateVariants,
    handleRemoveVariant,
    handleVariantChange,
    handleBulkApply,
    handleImageChange,
    handleRemoveImage,
    handleSubmit,
    onCancel: () => navigate("/admin/products"),
  };
}

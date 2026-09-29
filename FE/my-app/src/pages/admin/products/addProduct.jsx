import { useState, useEffect } from "react";
import { PlusIcon, PhotoIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Notification from "../../../components/notification";

export default function AddProduct() {
  const navigate = useNavigate();

  // Form states
  const [productData, setProductData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    salePrice: "",
    description: "",
  });

  const [variants, setVariants] = useState([{}]); // Dynamic attribute keys
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variantAttributes, setVariantAttributes] = useState([]); // Dynamic attributes from API
  
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ isOpen: true, message, type });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes, attrRes] = await Promise.all([
          axios.get("http://localhost:3000/api/categories"),
          axios.get("http://localhost:3000/api/admin/brands"),
          axios.get("http://localhost:3000/api/admin/variant-attributes"),
        ]);
        
        if (catRes.data?.success && catRes.data?.data) {
          setCategories(catRes.data.data);
        }
        if (brandRes.data?.success && brandRes.data?.data) {
          setBrands(brandRes.data.data);
        }
        if (attrRes.data?.success && attrRes.data?.data) {
          setVariantAttributes(attrRes.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleAddVariant = () => setVariants([...variants, {}]);
  
  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((f) => ({
      url: URL.createObjectURL(f),
      file: f
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("category_id", productData.category);
      formData.append("brand_id", productData.brand);
      formData.append("description", productData.description);
      formData.append("status", 1);

      const variantsPayload = variants.map((v) => {
        // Build SKU from attribute values
        const attrValues = variantAttributes
          .map((attr) => v[attr.name] || "")
          .filter(Boolean)
          .join("-");
        const sku = `${productData.name.replace(/\s+/g, "-").toUpperCase()}-${attrValues}`.replace(/[^A-Z0-9-]/g, "");

        // Build attributes array for backend
        const attributes = variantAttributes
          .filter((attr) => v[attr.name])
          .map((attr) => ({
            attribute_id: attr.id,
            value: v[attr.name],
          }));

        return {
          sku,
          price: productData.price,
          sale_price: productData.salePrice || productData.price,
          stock: 100,
          status: 1,
          attributes,
        };
      });

      formData.append("variants", JSON.stringify(variantsPayload));

      images.forEach((img) => {
        formData.append("images", img.file);
      });

      const response = await axios.post("http://localhost:3000/api/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data) {
        navigate("/admin/products", { state: { message: "Thêm sản phẩm thành công", type: "success" } });
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Thêm sản phẩm thất bại";
      showNotification(errorMsg, "error");
    }
  };

  /**
   * Render dynamic attribute field based on attribute type.
   * - "select": renders <select> with predefined options from API
   * - "text": renders <input type="text">
   */
  const renderAttributeField = (attr, variant, variantIndex) => {
    if (attr.type === "select" && attr.options?.length > 0) {
      return (
        <select
          value={variant[attr.name] || ""}
          onChange={(e) => handleVariantChange(variantIndex, attr.name, e.target.value)}
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
        >
          <option value="">Chọn {attr.display_name}</option>
          {attr.options.map((opt) => (
            <option key={opt.id} value={opt.value}>
              {opt.value}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type="text"
        value={variant[attr.name] || ""}
        onChange={(e) => handleVariantChange(variantIndex, attr.name, e.target.value)}
        placeholder={`e.g. ${attr.display_name}`}
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
      />
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[#f5f5f7]">
      <Notification
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
      <div className="mx-auto max-w-5xl">
            {/* Page Header */}
            <div className="mb-8">
              <h1
                className="text-[34px] font-semibold text-[#1d1d1f]"
                style={{
                  fontFamily: "SF Pro Display, system-ui, sans-serif",
                  letterSpacing: "-0.374px",
                  lineHeight: 1.1,
                }}
              >
                Add New Product
              </h1>
              <p
                className="mt-1 text-[17px] text-[#7a7a7a]"
                style={{
                  fontFamily: "SF Pro Text, system-ui, sans-serif",
                  letterSpacing: "-0.374px",
                }}
              >
                Create a new product with details and variants.
              </p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 text-xl font-semibold text-[#1d1d1f]">Basic Information</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Name */}
                  <div className="col-span-1 md:col-span-2">
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                      Product Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={productData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. iPhone 15 Pro Max"
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={productData.category}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label htmlFor="brand" className="mb-2 block text-sm font-medium text-gray-700">
                      Brand
                    </label>
                    <select
                      id="brand"
                      name="brand"
                      value={productData.brand}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                      required
                    >
                      <option value="">Select Brand</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">
                      Regular Price (VND)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={productData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                      required
                    />
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label htmlFor="salePrice" className="mb-2 block text-sm font-medium text-gray-700">
                      Sale Price (VND) (Optional)
                    </label>
                    <input
                      type="number"
                      id="salePrice"
                      name="salePrice"
                      value={productData.salePrice}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-1 md:col-span-2">
                    <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={productData.description}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Enter product description here..."
                      className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#1d1d1f]">Product Variants</h2>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-gray-200"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Variant</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="relative grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-3"
                    >
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                          className="absolute right-2 top-2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-500"
                          title="Remove variant"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}

                      {/* Dynamic attribute fields from API */}
                      {variantAttributes.map((attr) => (
                        <div key={attr.id}>
                          <label className="mb-1.5 block text-xs font-medium text-gray-600">
                            {attr.display_name}
                          </label>
                          {renderAttributeField(attr, variant, index)}
                        </div>
                      ))}

                      {/* Fallback: if no attributes loaded yet */}
                      {variantAttributes.length === 0 && (
                        <div className="col-span-3 text-center text-sm text-gray-400">
                          Đang tải thuộc tính biến thể...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Images Section */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 text-xl font-semibold text-[#1d1d1f]">Product Images</h2>
                
                <div className="mb-6 flex justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition-colors hover:border-[#0066cc] hover:bg-[#f0f7ff]">
                  <div className="text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                    <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-[#0066cc] transition-colors hover:text-[#005bb5] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#0066cc] focus-within:ring-offset-2"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {images.map((img, index) => (
                      <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                        <img src={img.url} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="rounded-full bg-white p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  className="rounded-full px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#0066cc] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
    </div>
  );
}

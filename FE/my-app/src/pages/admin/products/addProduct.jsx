import { useState, useEffect } from "react";
import { PlusIcon, PhotoIcon, TrashIcon, ViewColumnsIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Notification from "../../../components/notification";
import { generateVariantMatrix } from "../../../utils/cartesianGenerator";

export default function AddProduct() {
  const navigate = useNavigate();

  const [productData, setProductData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
  });

  const [variants, setVariants] = useState([]);
  const [productAttributes, setProductAttributes] = useState([{ localId: 1, attribute_id: "", values: "" }]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkSalePrice, setBulkSalePrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variantAttributes, setVariantAttributes] = useState([]);
  
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

  const handleAddProductAttribute = () => {
    setProductAttributes(prev => [...prev, { localId: Date.now(), attribute_id: "", values: "" }]);
  };

  const handleProductAttributeChange = (index, field, value) => {
    setProductAttributes(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleRemoveProductAttribute = (index) => {
    setProductAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateVariants = () => {
    if (!productData.name) {
      showNotification("Vui lòng nhập tên sản phẩm trước khi tạo biến thể (để tạo SKU).", "error");
      return;
    }
    const map = {};
    productAttributes.forEach(pa => {
      if (pa.attribute_id && pa.values.trim() !== "") {
        const attrObj = variantAttributes.find(a => String(a.id) === String(pa.attribute_id));
        if (attrObj) {
          const opts = pa.values.split(",").map(v => v.trim()).filter(v => v !== "");
          if(opts.length > 0) {
            map[pa.attribute_id] = { attr: attrObj, options: opts.map(v => ({ id: null, value: v })) };
          }
        }
      }
    });

    if(Object.keys(map).length === 0) {
       showNotification("Vui lòng chọn thuộc tính và nhập giá trị trước khi tạo.", "error");
       return;
    }

    const newVariants = generateVariantMatrix(map, variants, productData.name);
    if (newVariants.length > 500) {
      showNotification("Số lượng biến thể quá lớn. Vui lòng giảm bớt tùy chọn.", "error");
      return;
    }
    setVariants(newVariants);
    showNotification("Đã tạo " + newVariants.length + " biến thể.");
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleBulkApply = () => {
    setVariants(prev => prev.map(v => ({
      ...v,
      price: bulkPrice !== "" ? Number(bulkPrice) : v.price,
      salePrice: bulkSalePrice !== "" ? Number(bulkSalePrice) : v.salePrice,
      stock: bulkStock !== "" ? Number(bulkStock) : v.stock,
    })));
    showNotification("Đã áp dụng giá/stock hàng loạt.");
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

      const response = await axios.post("http://localhost:3000/api/admin/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        showNotification("Thêm sản phẩm thành công!");
        setTimeout(() => {
          navigate("/admin/products", { 
            state: { message: "Thêm sản phẩm thành công!", type: "success" }
          });
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Thêm sản phẩm thất bại";
      showNotification(errorMsg, "error");
    }
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

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 text-xl font-semibold text-[#1d1d1f]">Basic Information</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Variants Section */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#1d1d1f]">Product Variants (Cartesian Generator)</h2>
                    <p className="text-sm text-gray-500 mt-1">Select options to generate combinations automatically.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateVariants}
                    className="flex items-center gap-2 rounded-lg bg-[#0066cc] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0071e3]"
                  >
                    <ViewColumnsIcon className="h-4 w-4" />
                    <span>Generate Combinations</span>
                  </button>
                </div>

                {/* Attribute Selector */}
                <div className="mb-8 space-y-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="text-sm font-medium text-gray-700">Tùy chọn biến thể (Admin thêm thủ công):</h3>
                  {productAttributes.map((pa, index) => (
                    <div key={pa.localId} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="w-full sm:w-1/3">
                        <select
                          value={pa.attribute_id}
                          onChange={(e) => handleProductAttributeChange(index, "attribute_id", e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                        >
                          <option value="">-- Chọn thuộc tính --</option>
                          {variantAttributes.map(attr => (
                            <option key={attr.id} value={attr.id}>{attr.display_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full sm:w-2/3 flex gap-2">
                        <input
                          type="text"
                          value={pa.values}
                          onChange={(e) => handleProductAttributeChange(index, "values", e.target.value)}
                          placeholder="Nhập giá trị, cách nhau bằng dấu phẩy (vd: Đen, Trắng, Đỏ)"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveProductAttribute(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddProductAttribute}
                    className="flex items-center gap-1 text-sm font-medium text-[#0066cc] hover:text-[#005bb5]"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Thêm thuộc tính khác
                  </button>
                </div>

                {/* Bulk Apply Tools */}
                {variants.length > 0 && (
                  <div className="mb-6 rounded-xl border border-gray-100 bg-blue-50 p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Set Price for All</label>
                        <input type="number" value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="0" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Set Sale Price for All</label>
                        <input type="number" value={bulkSalePrice} onChange={e => setBulkSalePrice(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="0" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Set Stock for All</label>
                        <input type="number" value={bulkStock} onChange={e => setBulkStock(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="0" />
                      </div>
                      <button type="button" onClick={handleBulkApply} className="rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Apply
                      </button>
                    </div>
                  </div>
                )}

                {/* Variant Matrix Table */}
                {variants.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="bg-gray-50 uppercase text-gray-700">
                        <tr>
                          <th className="px-4 py-3">Attributes</th>
                          <th className="px-4 py-3">SKU</th>
                          <th className="px-4 py-3">Price (VND)</th>
                          <th className="px-4 py-3">Sale Price (VND)</th>
                          <th className="px-4 py-3">Stock</th>
                          <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((variant, index) => (
                          <tr key={index} className="border-t border-gray-200 bg-white">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {variant.attributes?.map(a => a.value).join(" - ")}
                            </td>
                            <td className="px-4 py-3">
                              <input type="text" value={variant.sku || ""} onChange={(e) => handleVariantChange(index, "sku", e.target.value)} className="w-full rounded border border-gray-300 px-2 py-1 text-xs" />
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" value={variant.price || ""} onChange={(e) => handleVariantChange(index, "price", e.target.value)} min="0" required className="w-24 rounded border border-gray-300 px-2 py-1 text-xs" />
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" value={variant.salePrice || variant.sale_price || ""} onChange={(e) => handleVariantChange(index, "salePrice", e.target.value)} min="0" className="w-24 rounded border border-gray-300 px-2 py-1 text-xs" />
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" value={variant.stock || ""} onChange={(e) => handleVariantChange(index, "stock", e.target.value)} min="0" required className="w-20 rounded border border-gray-300 px-2 py-1 text-xs" />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button type="button" onClick={() => handleRemoveVariant(index)} className="text-gray-400 hover:text-red-500">
                                <TrashIcon className="h-4 w-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                    No combinations generated yet. Select options above and click Generate.
                  </div>
                )}
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

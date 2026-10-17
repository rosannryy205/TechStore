export function ProductBasicInfo({
  productData,
  categories,
  brands,
  onChange,
}) {
  return (
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
            rows="4"
            placeholder="Enter product description here..."
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 transition-colors focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
            required
          ></textarea>
        </div>
      </div>
    </div>
  );
}

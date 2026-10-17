import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";

export function ProductImagesUploader({ images, onImageChange, onRemoveImage }) {
  return (
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
                onChange={onImageChange}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs leading-5 text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((img, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
            >
              <img
                src={img.url}
                alt={`Preview ${index}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
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
  );
}

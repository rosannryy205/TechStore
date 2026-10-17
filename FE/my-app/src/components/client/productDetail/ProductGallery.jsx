import { resolveProductImageUrl } from "@/utils/imageHelper";

export default function ProductGallery({ image, productName }) {
  const imageUrl = resolveProductImageUrl(image);

  return (
    <div className="w-full" aria-label="Ảnh sản phẩm">
      <div className="relative">
        <div className="h-[52svh] min-h-105 max-h-160 overflow-hidden">
          <img
            src={imageUrl}
            alt={productName || "Sản phẩm"}
            className="w-full h-full object-contain"
            style={{ filter: "saturate(1.02)" }}
          />
        </div>
        <div
          className="mx-auto w-[70%] h-4.5 -mt-3.5"
          style={{
            boxShadow: "rgba(0, 0, 0, 0.22) 3px 5px 30px 0",
            borderRadius: "9999px",
            opacity: 0.08,
          }}
        />
      </div>
    </div>
  );
}

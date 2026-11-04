import defaultProductImage from "@/assets/product.jpg";
import { API_BASE_URL } from "@/constants/api";

export { defaultProductImage };

/**
 * Phân giải đường dẫn ảnh sản phẩm / avatar bảo toàn 100% logic fallback:
 * - URL tuyệt đối (http://..., https://...) hoặc Data URL (data:...)
 * - Đường dẫn chứa "uploads/"
 * - Tên file đơn thuần nằm trong uploads/products/
 * - Fallback ảnh mặc định
 *
 * @param {string} image - Tên file hoặc URL ảnh
 * @param {string} fallback - Ảnh fallback nếu không có ảnh
 * @returns {string} URL hợp lệ để gán vào thẻ <img src=...>
 */
export function resolveProductImageUrl(image, fallback = defaultProductImage) {
  if (!image) return fallback;

  if (typeof image !== "string") return fallback;

  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) {
    return image;
  }

  if (image.includes("uploads/")) {
    const cleanPath = image.replace(/^\//, "");
    return `${API_BASE_URL}/${cleanPath}`;
  }

  return `${API_BASE_URL}/uploads/products/${image}`;
}

/**
 * Xử lý sự kiện onError trên thẻ <img> để chống vỡ hình ảnh:
 * Tự động trỏ sang ảnh fallback mặc định khi tải ảnh thất bại.
 *
 * @param {Event} e - React SyntheticEvent onError
 * @param {string} fallback - Ảnh thay thế
 */
export function handleImageError(e, fallback = defaultProductImage) {
  if (e?.currentTarget && e.currentTarget.src !== fallback) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  }
}

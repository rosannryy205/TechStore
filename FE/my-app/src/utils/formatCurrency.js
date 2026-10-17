/**
 * Format số tiền sang chuẩn tiền tệ VND (vi-VN).
 * @param {number|string} value
 * @returns {string} ví dụ "1.500.000 ₫"
 */
export function formatVnd(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(Math.round(num)) + " ₫";
}

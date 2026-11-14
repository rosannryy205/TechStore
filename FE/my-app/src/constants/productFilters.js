// Mã gửi BE phải giữ cùng ý nghĩa khoảng giá; các cận giá được xử lý duy nhất tại BE.
export const PRICE_RANGES = [
  { id: "all", label: "Tất cả mức giá" },
  { id: "under-10m", label: "Dưới 10 triệu" },
  { id: "10m-20m", label: "Từ 10 - 20 triệu" },
  { id: "20m-30m", label: "Từ 20 - 30 triệu" },
  { id: "above-30m", label: "Từ 30 triệu trở lên" },
];
export const SORT_OPTIONS = [
  { id: "newest", label: "Mới nhất" },
  { id: "price_asc", label: "Giá: Thấp đến Cao" },
  { id: "price_desc", label: "Giá: Cao đến Thấp" },
  { id: "popular", label: "Bán chạy nhất" },
];

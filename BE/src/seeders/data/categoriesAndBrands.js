const CATEGORIES = [
  {
    name: "Điện thoại",
    slug: "dien-thoai",
    status: 1,
  },
  {
    name: "Laptop",
    slug: "laptop",
    status: 1,
  },
  {
    name: "Máy tính bảng",
    slug: "tablet",
    status: 1,
  },
  {
    name: "Tai nghe & Âm thanh",
    slug: "am-thanh",
    status: 1,
  },
  {
    name: "Đồng hồ thông minh",
    slug: "dong-ho",
    status: 1,
  },
  {
    name: "Phụ kiện",
    slug: "phu-kien",
    status: 1,
  },
];

const BRANDS = [
  {
    name: "Apple",
    slug: "apple",
    logo: "uploads/brands/apple.svg",
    status: 1,
  },
  {
    name: "Samsung",
    slug: "samsung",
    logo: "uploads/brands/samsung.svg",
    status: 1,
  },
  {
    name: "Sony",
    slug: "sony",
    logo: "uploads/brands/sony.svg",
    status: 1,
  },
  {
    name: "Asus",
    slug: "asus",
    logo: "uploads/brands/asus.svg",
    status: 1,
  },
  {
    name: "Xiaomi",
    slug: "xiaomi",
    logo: "uploads/brands/xiaomi.svg",
    status: 1,
  },
  {
    name: "Dell",
    slug: "dell",
    logo: "uploads/brands/dell.svg",
    status: 1,
  },
];

// Mapping Category slug -> array of Brand slugs
const CATEGORY_BRAND_MAP = {
  "dien-thoai": ["apple", "samsung", "xiaomi"],
  "laptop": ["apple", "asus", "dell"],
  "tablet": ["apple", "samsung", "xiaomi"],
  "am-thanh": ["apple", "sony", "samsung"],
  "dong-ho": ["apple", "samsung", "xiaomi"],
  "phu-kien": ["apple", "samsung", "sony", "xiaomi", "asus"],
};

module.exports = {
  CATEGORIES,
  BRANDS,
  CATEGORY_BRAND_MAP,
};

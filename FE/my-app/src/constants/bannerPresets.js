/**
 * Quy chuẩn thông số kỹ thuật & Presets giao diện Banner TechStore 3D
 */

export const BANNER_POSITIONS = [
  {
    value: "hero_slide",
    label: "Hero 3D Showcase (Sân khấu chính)",
    description: "Slide lơ lửng trên không gian kính 3D với quầng sáng và typography lồng ảnh",
  },
  {
    value: "trade_in",
    label: "Trade-In Program (Thu cũ đổi mới)",
    description: "Banner thẻ 3D xoay chuột trong khu vực đặc quyền TechStore",
  },
];

export const BANNER_SPECS_CONFIG = {
  hero_slide: {
    device: {
      label: "Ảnh thiết bị 3D chính",
      recommended: "800 x 800 px",
      minWidth: 500,
      minHeight: 500,
      aspectRatio: 1, // 1:1
      ratioLabel: "1:1 (Vuông)",
      requireAlpha: true,
      allowedFormats: ["image/png", "image/webp"],
      formatLabel: "PNG, WebP (Bắt buộc nền trong suốt)",
    },
    inline1: {
      label: "Ảnh Typography 1",
      recommended: "640 x 360 px",
      minWidth: 320,
      minHeight: 180,
      aspectRatio: 16 / 9,
      ratioLabel: "16:9",
      requireAlpha: false,
      allowedFormats: ["image/jpeg", "image/png", "image/webp"],
      formatLabel: "JPG, PNG, WebP",
    },
    inline2: {
      label: "Ảnh Typography 2",
      recommended: "640 x 360 px",
      minWidth: 320,
      minHeight: 180,
      aspectRatio: 16 / 9,
      ratioLabel: "16:9",
      requireAlpha: false,
      allowedFormats: ["image/jpeg", "image/png", "image/webp"],
      formatLabel: "JPG, PNG, WebP",
    },
  },
  trade_in: {
    device: {
      label: "Ảnh Showcase Trade-in",
      recommended: "800 x 628 px",
      minWidth: 448,
      minHeight: 352,
      aspectRatio: 14 / 11,
      ratioLabel: "14:11 (gần 4:3)",
      requireAlpha: false,
      allowedFormats: ["image/jpeg", "image/png", "image/webp"],
      formatLabel: "JPG, PNG, WebP",
    },
  },
};

export const AMBIENT_PRESETS = [
  { label: "Burgundy Space", value: "rgba(59, 130, 246, 0.28)", hex: "#3B82F6" },
  { label: "Titanium Blue", value: "rgba(147, 197, 253, 0.25)", hex: "#93C5FD" },
  { label: "Spatial Cyan", value: "rgba(96, 165, 250, 0.25)", hex: "#60A5FA" },
  { label: "Emerald Vision", value: "rgba(16, 185, 129, 0.25)", hex: "#10B981" },
  { label: "Royal Indigo", value: "rgba(99, 102, 241, 0.28)", hex: "#6366F1" },
  { label: "Sunset Amber", value: "rgba(245, 158, 11, 0.25)", hex: "#F59E0B" },
];

/**
 * Danh sách Banner mẫu tương thích 100% với Hero3D và Card3D
 */
export const INITIAL_MOCK_BANNERS = [
  {
    id: 1,
    position: "hero_slide",
    badge: "iPhone 18 Pro Max",
    title: "Kỷ nguyên {img1} công nghệ {img2} nguyên khối.",
    description:
      "iPhone 18 Pro Max với chip A20 Pro, thiết kế nhôm nguyên khối và camera Fusion 48MP có khẩu độ thay đổi. Sắc Burgundy cùng màn hình Super Retina XDR 6,9 inch mang đến trải nghiệm Pro thế hệ mới.",
    image_url: "/src/assets/iphone18ProMax.webp",
    inline_img_1: "/src/assets/iphone18ProMax.webp",
    inline_img_2: "/src/assets/banner2.jpg",
    primary_cta_label: "Khám phá ngay",
    primary_cta_link: "/products?cate=phone",
    ambient_color: "rgba(59, 130, 246, 0.28)",
    chip_badge: "A20 Pro · 2nm",
    metric_value: "48MP",
    metric_label: "Camera Fusion · Khẩu độ thay đổi",
    specs: [
      { label: "Màn hình", value: "Super Retina XDR 6,9 inch · 120Hz" },
      { label: "Thiết kế", value: "Nhôm nguyên khối · Burgundy" },
      { label: "Phát video", value: "Lên đến 45 giờ" },
    ],
    display_order: 1,
    status: 1,
  },
  {
    id: 2,
    position: "hero_slide",
    badge: "Sức Mạnh Bất Tận",
    title: "Hiệu năng {img1} đột phá {img2} mọi giới hạn.",
    description:
      "Trang bị kiến trúc GPU Dynamic Caching thế hệ mới và ray-tracing bằng phần cứng. Xử lý tác vụ đồ họa và AI cục bộ nhanh hơn bất kỳ thế hệ máy tính xách tay nào.",
    image_url: "/src/assets/hero.png",
    inline_img_1: "/src/assets/banner1.jpg",
    inline_img_2: "/src/assets/hero.png",
    primary_cta_label: "Xem chi tiết Mac",
    primary_cta_link: "/products?cate=mac",
    ambient_color: "rgba(147, 197, 253, 0.25)",
    chip_badge: "M3 Max · 16-Core",
    metric_value: "128GB",
    metric_label: "Bộ nhớ Unified Memory",
    specs: [
      { label: "Màn hình", value: "Liquid Retina XDR 1.600 nits" },
      { label: "Băng thông", value: "400 GB/s Memory Bandwidth" },
      { label: "Thời lượng pin", value: "22 giờ làm việc liên tục" },
    ],
    display_order: 2,
    status: 1,
  },
  {
    id: 3,
    position: "hero_slide",
    badge: "Âm Thanh Không Gian",
    title: "Âm học {img1} chuẩn studio {img2} chân thực.",
    description:
      "Màng loa dynamic do Apple tự thiết kế mang đến độ méo tiếng cực thấp trên toàn dải tần. Chế độ Chống Ồn Chủ Động chủ động cách ly tạp âm hoàn hảo.",
    image_url: "/src/assets/banner3.jpg",
    inline_img_1: "/src/assets/banner3.jpg",
    inline_img_2: "/src/assets/iphone18ProMax.webp",
    primary_cta_label: "Trải nghiệm âm thanh",
    primary_cta_link: "/products?cate=audio",
    ambient_color: "rgba(96, 165, 250, 0.25)",
    chip_badge: "Apple H1 Dual-Chip",
    metric_value: "2x",
    metric_label: "Khử tiếng ồn chủ động",
    specs: [
      { label: "Spatial Audio", value: "Theo dõi chuyển động đầu" },
      { label: "Đệm tai", value: "Vải lưới dệt Acoustic" },
      { label: "Cổng sạc", value: "USB-C đồng bộ hệ sinh thái" },
    ],
    display_order: 3,
    status: 1,
  },
  {
    id: 4,
    position: "trade_in",
    badge: "TECHSTORE TRADE-IN PROGRAM",
    title: "Thu cũ đổi mới. Trợ giá đến 2.000.000₫.",
    description:
      "Nâng cấp lên thiết bị đỉnh cao với quy trình thẩm định 15 phút. Nhận thêm 47.2% ưu đãi phụ kiện khi đổi máy trong tháng này.",
    image_url: "/src/assets/banner2.jpg",
    inline_img_1: null,
    inline_img_2: null,
    primary_cta_label: "Định giá thiết bị ngay",
    primary_cta_link: "/products?sale=true",
    ambient_color: "rgba(59, 130, 246, 0.20)",
    chip_badge: "Thẩm định 15m",
    metric_value: "47.2%",
    metric_label: "Khách hàng chọn",
    specs: null,
    display_order: 1,
    status: 1,
  },
];

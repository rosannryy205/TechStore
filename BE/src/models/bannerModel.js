const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

/**
 * Model quản lý Banner TechStore
 * Lưu trữ đường dẫn ảnh, siêu dữ liệu 3D và các liên kết sản phẩm/danh mục
 */
const BannerModel = sequelize.define(
  "banners",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    position: {
      type: DataTypes.ENUM("hero_slide", "trade_in"),
      allowNull: false,
      defaultValue: "hero_slide",
      comment: "Vị trí bố cục hiển thị trên trang chủ",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Tiêu đề chính (hỗ trợ token chèn ảnh {img1}, {img2})",
    },
    badge: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Nhãn eyebrow trên viên thuốc kính 3D",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Mô tả chi tiết banner",
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: "Đường dẫn ảnh chính (ảnh thiết bị 3D tách nền trong suốt hoặc ảnh trade-in)",
    },
    inline_img_1: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Ảnh typography lồng chữ 1 (tỷ lệ 16:9)",
    },
    inline_img_2: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Ảnh typography lồng chữ 2 (tỷ lệ 16:9)",
    },
    primary_cta_label: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "Khám phá ngay",
      comment: "Tên nhãn nút kêu gọi hành động",
    },
    primary_cta_link: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: "/products",
      comment: "Đường dẫn liên kết khi nhấn nút",
    },
    ambient_color: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "rgba(59, 130, 246, 0.28)",
      comment: "Mã màu ánh sáng quang sai nền kính 3D",
    },
    chip_badge: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Nhãn vi xử lý hiển thị ở HUD/Tabs",
    },
    metric_value: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Giá trị thông số HUD kính 3D (VD: 48MP, 128GB)",
    },
    metric_label: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Mô tả thông số HUD (VD: Camera Fusion)",
    },
    specs: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Mảng JSON 3 thông số chân trang (VD: [{label, value}])",
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Thứ tự sắp xếp hiển thị",
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "Trạng thái hiển thị (1: Hoạt động, 0: Đang ẩn)",
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID sản phẩm liên kết (nếu banner đại diện cho sản phẩm cụ thể)",
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID danh mục liên kết (nếu banner đại diện cho danh mục)",
    },
  },
  {
    tableName: "banners",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = BannerModel;

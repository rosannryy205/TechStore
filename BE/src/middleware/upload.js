const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Thư mục lưu media của review.
const uploadDir = path.join(__dirname, "..", "uploads", "reviews");

// Tạo thư mục nếu chưa tồn tại.
fs.mkdirSync(uploadDir, { recursive: true });

// Cấu hình nơi lưu file + tên file ngẫu nhiên để tránh trùng/đụng độ.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

// Bộ lọc loại file: chỉ cho phép ảnh và video phổ biến.
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];

  if (allowed.includes(file.mimetype)) {
    return cb(null, true);
  }

  const err = new Error("Chỉ chấp nhận file ảnh hoặc video hợp lệ.");
  err.statusCode = 400;
  return cb(err);
};

// Giới hạn kích thước: ảnh 5MB, video 50MB (áp dụng chung 50MB).
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = upload;

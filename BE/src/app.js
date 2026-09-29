const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const userRoutes = require("./routes/client/userRoutes"); //gọi các route từ userRouter.js
const productRoutes = require("./routes/client/productRoutes"); //gọi các route từ productRouter.js
const categoryRoutes = require("./routes/client/categoryRoutes"); //gọi các route từ categoryRouter.js
const registerRoutes = require("./routes/client/registerRoutes"); //gọi các route từ registerRouter.js
const authRoutes = require("./routes/client/authRoutes"); // auth module
const cartRoutes = require("./routes/client/cartRoutes");
const reviewRoutes = require("./routes/client/reviewRoutes");
const orderRoutes = require("./routes/client/orderRoutes");
const adminBrandRoutes = require("./routes/admin/brandRoutes");
const adminCategoryRoutes = require("./routes/admin/categoryRoutes");
const adminProductRoutes = require("./routes/admin/productRoutes");
const adminVariantAttributeRoutes = require("./routes/admin/variantAttributeRoutes");
// CORS: cho phép FE chạy tại các origin được cấu hình trong .env
// Mặc định: http://localhost:5173, http://localhost:5174, http://localhost:5175, http://localhost:5176
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : [
      "http://localhost:5175",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5176",
    ];

app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// Middleware để phân tích dữ liệu JSON từ request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse cookie để đọc JWT httpOnly (req.cookies)
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Định nghĩa các route cho người dùng
app.use("/api/users", userRoutes);

// Định nghĩa các route cho sản phẩm
app.use("/api/products", productRoutes);

// Định nghĩa các route cho danh mục
app.use("/api/categories", categoryRoutes);

// Định nghĩa route cho đăng ký người dùng
app.use("/api/register", registerRoutes);

// Định nghĩa route auth (login/me/logout)
app.use("/api/auth", authRoutes);

// Định nghĩa route cho giỏ hàng
app.use("/api/cart", cartRoutes);

// Định nghĩa route cho đơn hàng
app.use("/api/orders", orderRoutes);

// Định nghĩa route cho đánh giá sản phẩm (comment)
app.use("/api/reviews", reviewRoutes);

// Định nghĩa route cho quản lý thương hiệu
app.use("/api/admin/brands", adminBrandRoutes);

// Định nghĩa route cho quản lý danh mục
app.use("/api/admin/categories", adminCategoryRoutes);

// Định nghĩa route cho quản lý sản phẩm
app.use("/api/admin/products", adminProductRoutes);

// Định nghĩa route cho quản lý thuộc tính biến thể
app.use("/api/admin/variant-attributes", adminVariantAttributeRoutes);

// Serve file tĩnh (ảnh/video của review) từ thư mục uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Route mặc định để kiểm tra API
app.get("/", (req, res) => {
  res.send("Welcome to the User Management API");
});

// Error handler tập trung
app.use(require("./middleware/errorHandler"));

// Xuất app để sử dụng trong server.js
module.exports = app;

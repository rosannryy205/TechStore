# Chiến lược Seeder Dữ liệu Mẫu và Quản lý Tài nguyên Hình ảnh

## Context
TechStore là hệ thống thương mại điện tử chuyên cung cấp thiết bị công nghệ. Trong quá trình phát triển và kiểm thử, database cần có dữ liệu mẫu thực tế, nhất quán và đầy đủ các mối quan hệ (Category, Brand, CategoryBrand, VariantAttribute, Product, ProductVariant, VariantAttributeValue, ProductImage, User).
Một vấn đề thường gặp khi seed dữ liệu là sử dụng URL hình ảnh trực tuyến từ bên thứ ba (Unsplash, Picsum, CDN công cộng), dẫn đến việc hình ảnh bị lỗi hiển thị sau một thời gian, bị chặn CORS, giới hạn băng thông (rate limit) hoặc không thể hiển thị khi nhà phát triển làm việc offline.

## Quyết định (Decision)
1. **Lưu trữ tài nguyên ảnh nội bộ (Local Asset Bundle)**:
   - Toàn bộ hình ảnh sản phẩm mẫu và logo thương hiệu phải được lưu trữ trực tiếp dưới dạng file vật lý tại thư mục `BE/uploads/products/` và `BE/uploads/brands/`.
   - Backend phục vụ các tài nguyên này qua endpoint tĩnh `/uploads` đã cấu hình trong `BE/src/app.js`.
   - Không phụ thuộc vào đường dẫn ảnh trực tuyến của bên thứ ba trong cơ sở dữ liệu mẫu.

2. **Cơ chế Seeder Độc lập và An toàn (Idempotent Database Seeder)**:
   - Điểm kích hoạt duy nhất: `BE/src/seeders/index.js`, tích hợp qua npm script `npm run seed` trong `BE/package.json`.
   - Hỗ trợ tham số `--fresh` (xóa sạch và tái tạo toàn bộ dữ liệu mẫu) hoặc chế độ cập nhật an toàn trong transaction nhằm tránh nhân bản bản ghi khi chạy nhiều lần.
   - Dữ liệu seed bao gồm:
     - Danh mục (Categories) và Thương hiệu (Brands) công nghệ hàng đầu, cùng bảng liên kết `category_brands`.
     - Thuộc tính biến thể động (`variant_attributes`, `variant_attribute_options`) như Màu sắc, Dung lượng, RAM.
     - Sản phẩm (`products`) với mô tả thực tế, thiết lập một số sản phẩm có giá khuyến mãi để kích hoạt nhãn "ƯU ĐÃI".
     - Biến thể sản phẩm (`product_variants`) kèm giá, giá khuyến mãi, SKU, số lượng tồn kho và thuộc tính tương ứng (`variant_attribute_values`).
     - Hình ảnh sản phẩm (`product_images`) liên kết với từng biến thể và file ảnh trong `BE/uploads/products/`.
     - Tài khoản quản trị viên và khách hàng kiểm thử (`users`) với mật khẩu băm bcrypt chuẩn.

3. **Phòng thủ chiều sâu phía Giao diện (Frontend Fallback Defense)**:
   - Thêm xử lý `onError` tại các component hiển thị ảnh (như `ProductCard`, `ProductGallery`) để tự động chuyển về ảnh mặc định cục bộ nếu có lỗi mạng bất thường, đảm bảo tuyệt đối không vỡ giao diện người dùng.

## Consequences
- Hệ thống có khả năng khởi tạo dữ liệu hoàn chỉnh 100% chỉ với một câu lệnh `npm run seed`.
- Hình ảnh hiển thị ổn định, sắc nét, hoạt động tốt kể cả khi không có kết nối internet.
- Dữ liệu mẫu phản ánh chính xác cấu trúc nghiệp vụ của TechStore, tạo môi trường kiểm thử nhất quán cho cả phân hệ Client và Admin.

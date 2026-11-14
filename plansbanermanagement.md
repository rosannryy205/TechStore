# KẾ HOẠCH TRIỂN KHAI HỆ THỐNG QUẢN LÝ HÌNH ẢNH BANNER 3D (TECHSTORE)

Tài liệu này xác định chi tiết kiến trúc và kế hoạch triển khai tính năng **Quản lý hình ảnh Banner dành cho Admin**, bảo đảm tính linh hoạt, tính toàn vẹn dữ liệu và duy trì 100% trải nghiệm giao diện 3D hiện hữu của TechStore.

Cấu trúc tài liệu tuân thủ logic tuần tự:
1. **Thiết kế Cơ sở Dữ liệu (Database Design)**
2. **Thiết kế Giao diện (Interface & UI/UX Design)**
3. **Thiết kế Chức năng bên trong (Internal Logic, Processing & API Architecture)**
4. **Kế hoạch Triển khai & Ma trận Kiểm thử (Roadmap & Testing)**

---

## PHẦN 1: THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE FIRST)

### 1.1. Nguyên tắc lưu trữ: File System kết hợp Database Metadata
* **Tuyệt đối không lưu file nhị phân (BLOB/Binary) hoặc Base64 trong Database**: Việc lưu trữ ảnh trực tiếp vào MySQL làm phình dung lượng CSDL, suy giảm hiệu năng bộ nhớ cache/RAM và gây tắc nghẽn khi sao lưu dữ liệu.
* **Cơ chế chuẩn hóa**:
  * File ảnh vật lý được lưu trữ trên ổ đĩa máy chủ tại thư mục: `BE/src/uploads/banners/` (được phục vụ tĩnh qua đường dẫn `/uploads/banners/...` bởi cấu hình tại `BE/src/app.js`).
  * Database chỉ lưu trữ đường dẫn tương đối (file path), trạng thái và toàn bộ siêu dữ liệu (metadata) phục vụ hiển thị 3D.

### 1.2. Cấu trúc Bảng `banners`
Tạo model mới `BE/src/models/bannerModel.js`, tương thích với Sequelize ORM hiện có của dự án:

```sql
CREATE TABLE `banners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `position` ENUM('hero_slide', 'trade_in') NOT NULL DEFAULT 'hero_slide' COMMENT 'Vị trí bố cục hiển thị trên trang chủ',
  `title` VARCHAR(255) NOT NULL COMMENT 'Tiêu đề chính (hỗ trợ cú pháp token chèn ảnh inline)',
  `badge` VARCHAR(100) NULL COMMENT 'Nhãn phụ hiển thị trên viên thuốc kính 3D',
  `description` TEXT NULL COMMENT 'Mô tả chi tiết nội dung banner',
  `image_url` VARCHAR(500) NOT NULL COMMENT 'Đường dẫn ảnh chính (ảnh thiết bị 3D hoặc ảnh trade-in)',
  `inline_img_1` VARCHAR(500) NULL COMMENT 'Ảnh typography lồng chữ 1 (tỷ lệ 16:9)',
  `inline_img_2` VARCHAR(500) NULL COMMENT 'Ảnh typography lồng chữ 2 (tỷ lệ 16:9)',
  `primary_cta_label` VARCHAR(100) NULL DEFAULT 'Khám phá ngay' COMMENT 'Tên nút kêu gọi hành động',
  `primary_cta_link` VARCHAR(500) NULL DEFAULT '/products' COMMENT 'Đường dẫn chuyển hướng khi bấm nút',
  `ambient_color` VARCHAR(50) NULL DEFAULT 'rgba(59, 130, 246, 0.28)' COMMENT 'Mã màu quang sai nền kính 3D',
  `chip_badge` VARCHAR(100) NULL COMMENT 'Nhãn chip hiển thị trên tab chuyển đổi (VD: A20 Pro · 2nm)',
  `metric_value` VARCHAR(50) NULL COMMENT 'Giá trị thông số kỹ thuật HUD (VD: 48MP, 128GB)',
  `metric_label` VARCHAR(100) NULL COMMENT 'Nhãn thông số kỹ thuật HUD (VD: Camera Fusion)',
  `specs` JSON NULL COMMENT 'Mảng JSON lưu 3 thông số chân trang của Hero Slide',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT 'Thứ tự ưu tiên hiển thị (số nhỏ hiển thị trước)',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1: Đang hiển thị, 0: Đang ẩn',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_position_status_order` (`position`, `status`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.3. Mô hình quan hệ & Tích hợp Sequelize
Trong `BE/src/models/index.js`, import `bannerModel.js`. Do dự án sử dụng `sequelize.sync({ alter: true })` trong `BE/src/config/db.js`, bảng `banners` sẽ được tự động đồng bộ hóa cấu trúc vào MySQL khi máy chủ khởi động.

### 1.4. Dữ liệu khởi tạo (Seed Data mẫu)
Để đảm bảo khi chuyển đổi từ code tĩnh sang dữ liệu động không bị trống giao diện, seeder sẽ chuyển đổi 3 slide có sẵn từ `Hero3D.jsx` và 1 banner từ `HighlightSection.jsx`:
* **Slide 1**: `position: 'hero_slide'`, `badge: 'iPhone 18 Pro Max'`, `title: 'Kỷ nguyên {img1} công nghệ {img2} nguyên khối.'`, `ambient_color: 'rgba(59, 130, 246, 0.28)'`, `image_url: 'uploads/banners/seed-iphone18.webp'`, `display_order: 1`.
* **Slide 2**: `position: 'hero_slide'`, `badge: 'Sức Mạnh Bất Tận'`, `title: 'Hiệu năng {img1} đột phá {img2} mọi giới hạn.'`, `ambient_color: 'rgba(147, 197, 253, 0.25)'`, `image_url: 'uploads/banners/seed-macbook.webp'`, `display_order: 2`.
* **Slide 3**: `position: 'hero_slide'`, `badge: 'Âm Thanh Không Gian'`, `title: 'Âm học {img1} chuẩn studio {img2} chân thực.'`, `ambient_color: 'rgba(96, 165, 250, 0.25)'`, `image_url: 'uploads/banners/seed-airpods.webp'`, `display_order: 3`.
* **Slide 4**: `position: 'trade_in'`, `badge: 'TECHSTORE TRADE-IN PROGRAM'`, `title: 'Thu cũ đổi mới. Trợ giá đến 2.000.000₫.'`, `image_url: 'uploads/banners/seed-tradein.webp'`, `display_order: 1`.

---

## PHẦN 2: THIẾT KẾ GIAO DIỆN (INTERFACE DESIGN)

### 2.1. Giao diện Quản trị Admin (`FE/my-app/src/pages/admin/banners/`)

Giao diện tuân thủ chặt chẽ ngôn ngữ thiết kế của dự án: font chữ `SF_DISPLAY`, `SF_TEXT`, màu nền `#f5f5f7`, các thẻ bo góc `rounded-2xl`, hiệu ứng bóng đổ tinh tế và các component dùng chung (`Notification`, `Loading`).

```
+---------------------------------------------------------------------------------------+
| Header: Quản lý hình ảnh Banner                   [ + Thêm Banner mới ]               |
+---------------------------------------------------------------------------------------+
| Bộ lọc: [ Tất cả (4) ]  [ Hero 3D Showcase (3) ]  [ Thu cũ đổi mới Trade-in (1) ]     |
+---------------------------------------------------------------------------------------+
| BẢNG DANH SÁCH BANNER (BannerTable)                                                   |
| +----+----------------+---------------------------+------------+-------+--------+-----+ |
| |Ảnh | Tiêu đề        | Vị trí                    | Thứ tự     | Status| Đổi ảnh| Xóa | |
| +----+----------------+---------------------------+------------+-------+--------+-----+ |
| |[x] | iPhone 18 Pro  | Hero 3D (Sân khấu chính)  | [ 1 ]      | [ON]  | [Sửa]  | [X] | |
| |[x] | MacBook Pro M3 | Hero 3D (Sân khấu chính)  | [ 2 ]      | [ON]  | [Sửa]  | [X] | |
| |[x] | Thu cũ đổi mới | Trade-in Card             | [ 1 ]      | [ON]  | [Sửa]  | [X] | |
+----+----------------+---------------------------+------------+-------+--------+-----+ |
```

#### Các thành phần chính của giao diện Admin:
1. **Tabs lọc vị trí (Position Filter Tabs)**:
   * Cho phép lọc danh sách theo từng khu vực: `Tất cả`, `Hero 3D Showcase`, `Thu cũ đổi mới (Trade-in)`.
2. **Bảng dữ liệu (BannerTable & BannerTableRow)**:
   * **Cột xem nhanh Thumbnail**: Render ảnh có nền lưới caro mờ (`bg-[repeating-conic-gradient(...)]`) giúp Admin phân biệt tức thì ảnh PNG đã tách nền hay ảnh chữ nhật đặc.
   * **Cột Thứ tự hiển thị (`display_order`)**: Hỗ trợ nhập số trực tiếp để thay đổi thứ tự slide trượt.
   * **Cột Trạng thái (`status`)**: Nút gạt chuyển đổi nhanh (Quick Toggle Switch) bật/tắt hiển thị ngay lập tức mà không cần mở form sửa.
   * **Cột Thao tác**: Nút Sửa mở Modal và nút Xóa kèm hộp thoại xác nhận an toàn.
3. **Form Modal Thêm / Chỉnh sửa Banner (BannerFormModal)**:
   * **Chọn vị trí hiển thị (`position`)**: Khi chọn `hero_slide`, form tự động mở các trường chuyên dụng cho 3D; khi chọn `trade_in`, form thu gọn chỉ hiển thị các trường quảng bá cơ bản.
   * **Khu vực tải ảnh chính (Main Image Dropzone)**:
     * Quy định rõ ràng: Kích thước khuyến nghị $800 \times 800 \text{ px}$ (tỷ lệ 1:1).
     * Cảnh báo bắt buộc: Đối với `hero_slide`, chỉ chấp nhận ảnh định dạng PNG/WebP đã **tách nền trong suốt (Transparent Background)**.
   * **Khu vực tải ảnh Typography lồng chữ (Inline Image 1 & 2)**:
     * Tỷ lệ khung hình cố định 16:9 ($640 \times 360 \text{ px}$).
     * Tích hợp công cụ xem trước và cắt khung hình (Crop).
   * **Bộ chọn màu quang sai 3D (Ambient Color Picker)**:
     * Cung cấp các ô màu định sẵn (Preset Swatches) chuẩn Apple: Deep Burgundy, Space Gray Blue, Midnight Purple, Titanium Natural, đi kèm ô nhập mã RGBA tùy chỉnh.
   * **Trình soạn thảo thông số kỹ thuật (Specs Builder)**:
     * Danh sách 3 cặp giá trị `label` và `value` hiển thị ở chân slide của Hero.
4. **Khung xem trước 3D thời gian thực (Interactive 3D Live Preview)**:
   * Đặt cố định ở cột bên phải của Modal nhập liệu, tái sử dụng trực tiếp component `Card3D.jsx`.
   * Phản ánh ngay lập tức hình ảnh tải lên, hiệu ứng nghiêng theo con trỏ chuột (`tilt`), ánh sáng quang sai phản chiếu (`ambientColor`) và độ nổi khối `translateZ`.

---

### 2.2. Giao diện Người dùng Khách hàng (Client Homepage)

#### 1. Cập nhật `Hero3D.jsx` (Tầng 1 Trang chủ)
* Thay thế mảng tĩnh `FLAGSHIP_HERO_SLIDES` bằng dữ liệu lấy từ custom hook `useHomeBanners("hero_slide")`.
* Khóa khung hiển thị (Aspect-ratio Locking): Khung thiết bị 3D cố định ở `max-w-[320px] max-h-[320px] w-full h-[320px] flex items-center justify-center`.
* Render động các tab chuyển đổi slide ở chân Hero: `01 // {chipBadge}`, `02 // {chipBadge}` dựa theo số lượng slide đang kích hoạt trong database.
* Tự động phân tách tiêu đề dựa trên token: Khi tiêu đề có dạng `Kỷ nguyên {img1} công nghệ {img2} nguyên khối.`, component sẽ tự động thay thế `{img1}` và `{img2}` thành thẻ ảnh typography bo góc `rounded-xl` với hiệu ứng `hover:scale-110`.

#### 2. Cập nhật `HighlightSection.jsx` (Tầng 6 Trang chủ)
* Thay thế import tĩnh `banner2Img` bằng hình ảnh banner vị trí `trade_in` lấy từ API.
* Giữ nguyên thẻ xoay chuột `Card3D` với góc nghiêng `maxRotation={14}` và độ sâu nổi khối `translateZ(50px)`.

#### 3. Chống giật layout (Cumulative Layout Shift - CLS = 0)
* Tận dụng component `HomeSkeleton.jsx` có sẵn trong dự án. Khung xương mô phỏng đúng kích thước khối Hero 3D trong suốt thời gian API tải dữ liệu, triệt tiêu hoàn toàn hiện tượng xô lệch bố cục trang.

---

## PHẦN 3: THIẾT KẾ CHỨC NĂNG BÊN TRONG (INTERNAL LOGIC & PROCESSING)

### 3.1. Kiến trúc Backend 3 lớp (3-Layer Architecture)

```
[HTTP Request (Multipart/FormData)]
         │
         ▼
[BE/src/routes/admin/bannerRoutes.js] ── (Định tuyến & kiểm tra quyền requireAdmin)
         │
         ▼
[BE/src/middleware/uploadBanner.js] ──── (Multer: tiếp nhận file tạm vào bộ nhớ)
         │
         ▼
[BE/src/utils/imageQualityChecker.js] ── (Sharp: kiểm tra kích thước, Alpha, độ mờ)
         │
         ▼
[BE/src/validators/bannerValidators.js] ─ (express-validator: kiểm tra tính hợp lệ)
         │
         ▼
[BE/src/controllers/admin/bannerController.js] ── (Điều phối request/response)
         │
         ▼
[BE/src/services/admin/bannerService.js] ──────── (Xử lý nghiệp vụ & lưu DB)
         │
         ▼
[BE/src/models/bannerModel.js] ───────── (Sequelize thao tác MySQL)
```

### 3.2. Tiện ích Kiểm định & Xử lý Chất lượng Hình ảnh (`imageQualityChecker.js`)
Sử dụng thư viện `sharp` (đã có sẵn trong `BE/package.json`):

#### 1. Kiểm tra kích thước & Tỷ lệ khung hình (Dimension & Aspect Ratio Validation)
* Đối với `hero_device`:
  * Chiều rộng & chiều cao tối thiểu: $500 \times 500 \text{ px}$ (đảm bảo hiển thị sắc nét trên màn hình Retina 2x/3x).
  * Tỷ lệ khung hình: $1:1$ (sai số cho phép tối đa $3\%$).
* Đối với `hero_inline_1` và `hero_inline_2`:
  * Tỷ lệ khung hình: $16:9$ (sai số cho phép tối đa $5\%$). Tự động crop trung tâm nếu lệch nhẹ.
* Đối với `trade_in`:
  * Kích thước tối thiểu: $448 \times 352 \text{ px}$, tỷ lệ $14:11$ hoặc $4:3$.

#### 2. Kiểm tra kênh Alpha (Độ trong suốt) bắt buộc cho `hero_device`
* **Vấn đề**: Nếu Admin tải ảnh thiết bị có nền trắng hoặc đen đục, ảnh sẽ trở thành một khối vuông che khuất kính 3D `spatial-glass` và ánh sáng quang sai `ambientColor`.
* **Giải pháp kỹ thuật**:
  * Đọc `metadata.hasAlpha` qua `sharp`. Nếu `hasAlpha === false` $\rightarrow$ Từ chối ngay lập tức.
  * Trích xuất kênh Alpha thành mảng raw byte. Tính tỷ lệ pixel trong suốt ($Alpha < 240$). Nếu tỷ lệ pixel trong suốt $< 15\%$ diện tích ảnh $\rightarrow$ Cảnh báo ảnh chưa được tách nền hoàn chỉnh.

#### 3. Thuật toán phát hiện ảnh mờ (Laplacian Variance Sharpness Detection)
* **Phương pháp**:
  1. Chuyển đổi ảnh sang ảnh xám (`greyscale()`).
  2. Tích chập với ma trận Laplace $\begin{bmatrix} 0 & 1 & 0 \\ 1 & -4 & 1 \\ 0 & 1 & 0 \end{bmatrix}$.
  3. Tính phương sai (Variance) của các điểm ảnh đầu ra.
* **Quy chuẩn đánh giá**:
  * Phương sai $\ge 120$: Độ nét cao (Hợp lệ tối ưu).
  * $60 \le$ Phương sai $< 120$: Độ nét trung bình.
  * Phương sai $< 60$: Cảnh báo ảnh bị out-focus, nhòe mờ.
* **Giải thích giới hạn kỹ thuật**: Do một số ảnh sản phẩm nghệ thuật có hiệu ứng xóa phông nền (bokeh) hoặc bề mặt sản phẩm nhám mờ, chỉ số phương sai có thể thấp tự nhiên. Vì vậy, tiêu chí này được sử dụng làm **Cảnh báo chất lượng (Soft Warning)** và phản hồi điểm số cho Admin, **không dùng làm rào cản chặn cứng (Hard Blocker)**.

#### 4. Chuẩn hóa & Nén sang WebP
* Toàn bộ ảnh sau khi kiểm định sẽ được tự động chuyển đổi sang định dạng `.webp` với chất lượng `quality: 85`.
* Bảo toàn kênh Alpha trong suốt, loại bỏ siêu dữ liệu EXIF/GPS thừa để tối ưu tốc độ truyền tải trang.

---

### 3.3. Danh sách API Endpoints chi tiết

#### 1. Dành cho Client (Public Access)
* `GET /api/banners`: Lấy danh sách banner đang hoạt động (`status = 1`), sắp xếp theo `display_order ASC`. Hỗ trợ query `?position=hero_slide` hoặc `?position=trade_in`.

#### 2. Dành cho Admin (Yêu cầu `requireAuth` + `requireAdmin`)
* `GET /api/admin/banners`: Lấy toàn bộ danh sách banner (hỗ trợ phân trang, lọc theo vị trí và tìm kiếm theo tiêu đề).
* `GET /api/admin/banners/:id`: Lấy chi tiết thông tin và cấu hình của một banner.
* `POST /api/admin/banners`: Tạo mới banner (nhận `multipart/form-data`, qua middleware upload và kiểm tra chất lượng).
* `PUT /api/admin/banners/:id`: Cập nhật thông tin banner, hỗ trợ thay thế từng ảnh riêng biệt.
* `PATCH /api/admin/banners/:id/status`: Bật/Tắt nhanh trạng thái hiển thị (`status: 0 | 1`).
* `PATCH /api/admin/banners/reorder`: Cập nhật lại thứ tự hiển thị hàng loạt (`display_order`).
* `DELETE /api/admin/banners/:id`: Xóa banner khỏi CSDL và tự động xóa các file ảnh vật lý tương ứng trên ổ cứng.

---

### 3.4. Logic Phía Client (Frontend Client Integration)

#### 1. Xây dựng Custom Hook `useHomeBanners`
* Sử dụng native `fetch` qua tiện ích [httpClient.js](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/services/api/httpClient.js).
* Quản lý trạng thái: `banners`, `isLoading`, `error`.
* **Cơ chế Fallback 2 tầng (Two-Tier Fallback)**:
  * **Tầng 1 (Network/API Fallback)**: Khi API gặp lỗi hoặc mảng dữ liệu trả về rỗng, hook tự động trả về dữ liệu mặc định `DEFAULT_FLAGSHIP_HERO_SLIDES`, đảm bảo trang chủ luôn hoạt động mượt mà.
  * **Tầng 2 (Image Error Fallback)**: Sử dụng hàm `handleImageError` có sẵn tại [imageHelper.js](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/utils/imageHelper.js) trên thẻ `<img>` để tự động đổi sang ảnh dự phòng nếu đường dẫn ảnh bị lỗi 404.

#### 2. Kiểm định trước tải lên ở Client (Pre-flight Validation)
* Trước khi gửi file lên server, form Admin sử dụng HTML5 `Image` và `Canvas` để:
  * Đọc trước kích thước gốc và tỷ lệ.
  * Kiểm tra nhanh kênh Alpha.
  * Hiển thị cảnh báo trực quan ngay dưới ô chọn file, giúp Admin không mất thời gian chờ server phản hồi.

---

## PHẦN 4: KẾ HOẠCH TRIỂN KHAI & MA TRẬN KIỂM THỬ

### 4.1. Kế hoạch triển khai theo 4 giai đoạn

| Giai đoạn | Nhiệm vụ chính | Các file tạo mới / chỉnh sửa |
| :--- | :--- | :--- |
| **Giai đoạn 1: Database & Backend Core** | • Định nghĩa model Sequelize `Banner`<br>• Khai báo model trong `index.js`<br>• Viết seeder khởi tạo dữ liệu mẫu<br>• Cấu hình thư mục `BE/src/uploads/banners/` | **Tạo mới:**<br>• `BE/src/models/bannerModel.js`<br>• `BE/src/seeders/seedBanners.js`<br>**Chỉnh sửa:**<br>• `BE/src/models/index.js` |
| **Giai đoạn 2: Image Quality Checker & Admin API** | • Viết bộ kiểm định ảnh bằng `sharp`<br>• Viết middleware upload Multer `uploadBanner.js`<br>• Viết validator, service, controller cho Banner<br>• Đăng ký routes tại `app.js` | **Tạo mới:**<br>• `BE/src/utils/imageQualityChecker.js`<br>• `BE/src/middleware/uploadBanner.js`<br>• `BE/src/validators/bannerValidators.js`<br>• `BE/src/services/admin/bannerService.js`<br>• `BE/src/controllers/admin/bannerController.js`<br>• `BE/src/routes/admin/bannerRoutes.js`<br>• `BE/src/routes/client/bannerRoutes.js`<br>**Chỉnh sửa:**<br>• `BE/src/app.js` |
| **Giai đoạn 3: Frontend Admin Banner Management** | • Viết `bannerService.js` (gọi API)<br>• Xây dựng trang `BannerManagement.jsx`<br>• Xây dựng `BannerTable` và `BannerFormModal`<br>• Tích hợp `Card3D` làm Live 3D Preview<br>• Thêm mục vào Sidebar và định tuyến router | **Tạo mới:**<br>• `FE/my-app/src/services/api/admin/bannerService.js`<br>• `FE/my-app/src/hooks/admin/useAdminBanners.js`<br>• `FE/my-app/src/pages/admin/banners/bannerManagement.jsx`<br>• `FE/my-app/src/components/admin/banners/BannerTable.jsx`<br>• `FE/my-app/src/components/admin/banners/BannerFormModal.jsx`<br>• `FE/my-app/src/components/admin/banners/Banner3DPreview.jsx`<br>**Chỉnh sửa:**<br>• `FE/my-app/src/App.jsx`<br>• `FE/my-app/src/components/headerAdmin.jsx` |
| **Giai đoạn 4: Client Integration & Verification** | • Xây dựng hook `useHomeBanners`<br>• Chuyển đổi `Hero3D.jsx` sang dữ liệu động<br>• Cập nhật `HighlightSection.jsx`<br>• Kiểm thử đa thiết bị và chống layout shift | **Tạo mới:**<br>• `FE/my-app/src/services/api/client/bannerService.js`<br>• `FE/my-app/src/hooks/client/useHomeBanners.js`<br>**Chỉnh sửa:**<br>• `FE/my-app/src/components/client/home/Hero3D.jsx`<br>• `FE/my-app/src/components/client/home/HighlightSection.jsx` |

---

### 4.2. Ma trận Kịch bản Kiểm thử (Test Cases Matrix)

| Mã test | Hạng mục kiểm thử | Dữ liệu đầu vào / Thao tác | Kết quả kỳ vọng |
| :---: | :--- | :--- | :--- |
| **TC-01** | Kiểm tra định dạng | Upload file `.pdf` hoặc `.exe` | Hệ thống chặn ngay ở client và hiển thị toast: *"Chỉ chấp nhận file ảnh hợp lệ (PNG, WebP, JPG)"*. |
| **TC-02** | Ràng buộc Alpha 3D | Upload ảnh JPG có nền trắng đặc vào vị trí `hero_device` | Hệ thống từ chối lưu: *"Ảnh thiết bị 3D bắt buộc phải tách nền trong suốt (Transparent PNG/WebP)"*. |
| **TC-03** | Kích thước tối thiểu | Upload ảnh $250 \times 250 \text{ px}$ vào vị trí `hero_device` | Báo lỗi kích thước không đạt chuẩn hiển thị tối thiểu ($500 \times 500 \text{ px}$). |
| **TC-04** | Tỷ lệ Typography | Upload ảnh tỷ lệ $1:1$ vào vị trí `hero_inline_1` | Hệ thống cảnh báo lệch tỷ lệ $16:9$ và hỗ trợ khung cắt (crop) tự động. |
| **TC-05** | Phát hiện ảnh mờ | Upload ảnh có độ mờ/rung lắc cao (Laplacian variance < 60) | Hiển thị cảnh báo vàng: *"Độ sắc nét thấp. Vui lòng kiểm tra lại để tránh vỡ nét trên màn hình Retina"*. |
| **TC-06** | Xem trước tương tác | Đổi màu `ambientColor` sang `#10B981` trên Form | Khung kính 3D Live Preview cập nhật quầng sáng xanh ngọc và phản hồi chuyển động chuột mượt mà. |
| **TC-07** | Bật/Tắt trạng thái | Gạt switch tắt một slide trên bảng Admin | Trang chủ lập tức ẩn slide đó, số lượng nút chuyển đổi slide ở chân Hero giảm tương ứng. |
| **TC-08** | Khả năng tự phục hồi | Ngắt kết nối Backend (Tắt server API) | Trang chủ tự động kích hoạt fallback sang dữ liệu mặc định `FLAGSHIP_HERO_SLIDES`, không bị crash màn hình trắng. |
| **TC-09** | Xử lý ảnh lỗi (404) | Cố tình xóa file ảnh trên ổ đĩa máy chủ | Trình duyệt kích hoạt `handleImageError`, tự động trỏ về ảnh mặc định mà không làm vỡ bố cục 3D. |
| **TC-10** | Bảo mật tải file | Đổi tên file chứa script độc hại `image.php.png` | Multer tự động đổi tên file thành định dạng chuẩn ngẫu nhiên an toàn: `banner-${Date.now()}-${uuid}.webp`. |

---

## TỔNG KẾT

Kế hoạch trên giải quyết trọn vẹn yêu cầu quản lý hình ảnh Banner cho TechStore:
1. **Thiết kế Database trước**: Đảm bảo phân tách rõ ràng dữ liệu Banner và Catalog sản phẩm, lưu trữ file chuẩn hóa và tối ưu hiệu năng.
2. **Thiết kế Giao diện sau**: Đảm bảo tính nhất quán với phong cách thiết kế Apple/3D hiện hữu, hỗ trợ Admin xem trước trực quan với `Card3D`.
3. **Thiết kế Chức năng bên trong**: Đầy đủ cơ chế kiểm định đa tầng từ client đến server bằng `sharp`, phát hiện ảnh mờ, kiểm tra độ trong suốt và cơ chế fallback chống vỡ giao diện.
4. **Tận dụng tối đa công nghệ sẵn có**: Không phát sinh thêm thư viện ngoài, tuân thủ nghiêm ngặt quy tắc lập trình của dự án.

# TỔNG HỢP CHI TIẾT CÁC THAY ĐỔI THEO TỪNG FILE
**Dự án:** TechStore - Chức năng Quản lý Banner 3D  
**Giai đoạn:** Hoàn tất Mục 1 (Thiết kế Database & Mối quan hệ) & Mục 2 (Giao diện Admin & Client)  
**Trạng thái kiểm thử:** ✅ **100% Tests Pass** (Backend: 4/4 pass, Frontend: 14/14 pass, ESLint: 0 errors/0 warnings, Vite Build: Success)  
**Tài liệu kế hoạch gốc:** [plansbanermanagement.md](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/plansbanermanagement.md)

---

## 1. Bảng Tổng Hợp Danh Sách File

| STT | Đường dẫn File | Khu vực | Thao tác | Mô tả tóm tắt vai trò |
| :---: | :--- | :---: | :---: | :--- |
| **1** | [BE/src/models/bannerModel.js](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/BE/src/models/bannerModel.js) | Backend | **Tạo mới** | Định nghĩa Sequelize Model `banners` với 19 trường dữ liệu 3D & liên kết. |
| **2** | [BE/src/models/index.js](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/BE/src/models/index.js) | Backend | **Chỉnh sửa** | Đăng ký Model `Banner` và thiết lập quan hệ 1-N với `Product` và `Category`. |
| **3** | [BE/src/seeders/data/banners.js](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/BE/src/seeders/data/banners.js) | Backend | **Tạo mới** | Dữ liệu khởi tạo mẫu chuẩn cho 3 Hero Slides và 1 Card Trade-in. |
| **4** | [BE/tests/bannerModel.test.js](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/BE/tests/bannerModel.test.js) | Backend | **Tạo mới** | Bộ unit test kiểm tra schema model và associations (4/4 pass). |
| **5** | [FE/my-app/src/constants/bannerPresets.js](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/constants/bannerPresets.js) | Frontend | **Tạo mới** | Định nghĩa hằng số vị trí, ma trận specs ảnh, bảng màu quang sai ambient và seed data. |
| **6** | [FE/my-app/src/services/api/admin/bannerService.js](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/services/api/admin/bannerService.js) | Frontend | **Tạo mới** | Service API Admin kết nối Backend với tầng fallback localStorage tự hoạt động trơn tru. |
| **7** | [FE/my-app/src/services/api/client/bannerService.js](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/services/api/client/bannerService.js) | Frontend | **Tạo mới** | Service API Client lấy banner đang active theo vị trí với fallback dự phòng. |
| **8** | [FE/my-app/src/hooks/admin/useAdminBanners.js](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/hooks/admin/useAdminBanners.js) | Frontend | **Tạo mới** | Custom hook quản lý state danh sách, filter vị trí, toggle status, và pre-flight kiểm tra ảnh. |
| **9** | [FE/my-app/src/hooks/client/useHomeBanners.js](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/hooks/client/useHomeBanners.js) | Frontend | **Tạo mới** | Custom hook cho trang chủ lấy banner động theo vị trí hiển thị. |
| **10** | [FE/my-app/src/components/admin/banners/Banner3DPreview.jsx](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/components/admin/banners/Banner3DPreview.jsx) | Frontend | **Tạo mới** | Component Live 3D Preview trực tiếp trong modal với hiệu ứng chiều sâu và ánh sáng ambient. |
| **11** | [FE/my-app/src/components/admin/banners/BannerTableRow.jsx](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/components/admin/banners/BannerTableRow.jsx) | Frontend | **Tạo mới** | Hàng dữ liệu với thumbnail nền bàn cờ (nhận diện kênh alpha), toggle status, nút Sửa/Xóa. |
| **12** | [FE/my-app/src/components/admin/banners/BannerTable.jsx](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/components/admin/banners/BannerTable.jsx) | Frontend | **Tạo mới** | Bảng danh sách banner với layout chuẩn, badge vị trí, phân loại và empty state. |
| **13** | [FE/my-app/src/components/admin/banners/BannerFormModal.jsx](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/components/admin/banners/BannerFormModal.jsx) | Frontend | **Tạo mới** | Modal Thêm/Sửa Banner 2 cột: Form nhập liệu + Pre-flight Check Bar + Live 3D Preview. |
| **14** | [FE/my-app/src/pages/admin/banners/bannerManagement.jsx](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/pages/admin/banners/bannerManagement.jsx) | Frontend | **Tạo mới** | Trang quản trị chính với thẻ thống kê KPI, bộ lọc tab vị trí và tích hợp modal. |
| **15** | [FE/my-app/src/App.jsx](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/App.jsx) | Frontend | **Chỉnh sửa** | Khai báo route quản trị `/admin/banners`. |
| **16** | [FE/my-app/src/components/headerAdmin.jsx](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/components/headerAdmin.jsx) | Frontend | **Chỉnh sửa** | Thêm mục menu "Quản lý Banner" trên sidebar admin với icon SVG chuẩn. |
| **17** | [FE/my-app/src/components/client/home/Hero3D.jsx](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/components/client/home/Hero3D.jsx) | Frontend | **Chỉnh sửa** | Đọc banner từ `useHomeBanners`, parse token `{img1}`, `{img2}` và fallback an toàn 2 tầng. |
| **18** | [FE/my-app/src/components/client/home/HighlightSection.jsx](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/src/components/client/home/HighlightSection.jsx) | Frontend | **Chỉnh sửa** | Đọc dữ liệu banner động vị trí `trade_in` kèm fallback ảnh mặc định. |
| **19** | [FE/my-app/tests/bannerManagement.test.mjs](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/tests/bannerManagement.test.mjs) | Frontend | **Tạo mới** | Bộ unit test kiểm tra presets, specs và ràng buộc alpha channel (5/5 pass). |
| **20** | [FE/my-app/tests/imageHelper.test.mjs](file:///C:/Users/USER/orca/workspaces/TechStore/Lên-kế-hoạch-thực-hiện-chức-năng-quản-lý-ảnh-banner-bên-phía-Admin/FE/my-app/tests/imageHelper.test.mjs) | Frontend | **Chỉnh sửa** | Thêm cấu hình `optimizeDeps: { noDiscovery: true }` cho test Vite runner. |

---

## 2. Chi Tiết Thay Đổi Từng File

### 2.1. Nhóm Backend Database & Mô Hình Quan Hệ (Mục 1)

#### 1. `BE/src/models/bannerModel.js` (Tạo mới)
- **Mục đích:** Tạo bảng `banners` lưu trữ thông số của banner, metadata 3D và khóa ngoại liên kết.
- **Các trường dữ liệu (19 cột):**
  - `id`: `DataTypes.INTEGER`, Khóa chính, tự tăng.
  - `position`: `DataTypes.ENUM('hero_slide', 'trade_in')`, vị trí hiển thị trên giao diện.
  - `title`: `STRING(255)`, tiêu đề banner (hỗ trợ token chèn ảnh typography `{img1}`, `{img2}`).
  - `badge`: `STRING(100)`, nhãn pill thủy tinh phía trên.
  - `description`: `TEXT`, mô tả chi tiết nội dung.
  - `image_url`: `STRING(500)`, đường dẫn tương đối của ảnh chính (`uploads/banners/...`).
  - `inline_img_1`, `inline_img_2`: `STRING(500)`, đường dẫn ảnh typography tỉ lệ 16:9.
  - `primary_cta_label`, `primary_cta_link`: Nhãn nút kêu gọi và URL điều hướng.
  - `ambient_color`: `STRING(50)`, mã màu hào quang quang sai 3D (VD: `rgba(59, 130, 246, 0.28)`).
  - `chip_badge`: `STRING(100)`, nhãn vi xử lý hiển thị ở HUD góc thẻ 3D (VD: `A18 PRO`).
  - `metric_value`, `metric_label`: Giá trị và nhãn thông số HUD (VD: `48MP` - `Camera Fusion`).
  - `specs`: `DataTypes.JSON`, mảng chứa 3 thông số chi tiết chân trang.
  - `display_order`: `INTEGER`, số thứ tự sắp xếp slide (mặc định 0).
  - `status`: `TINYINT`, trạng thái hiển thị (`1`: Hiện, `0`: Ẩn).
  - `product_id`: `INTEGER`, khóa ngoại liên kết bảng `products` (cho phép `NULL`).
  - `category_id`: `INTEGER`, khóa ngoại liên kết bảng `categories` (cho phép `NULL`).
  - `created_at`, `updated_at`: Timestamps quản lý thời gian.

#### 2. `BE/src/models/index.js` (Chỉnh sửa)
- **Mục đích:** Đăng ký model và thiết lập quan hệ thực thể rõ ràng.
- **Thay đổi cụ thể:**
  - Import `Banner = require("./bannerModel")`.
  - Khai báo quan hệ với `Product`:
    - `Banner.belongsTo(Product, { foreignKey: "product_id", as: "product" });`
    - `Product.hasMany(Banner, { foreignKey: "product_id", as: "banners" });`
  - Khai báo quan hệ với `Category`:
    - `Banner.belongsTo(Category, { foreignKey: "category_id", as: "category" });`
    - `Category.hasMany(Banner, { foreignKey: "category_id", as: "banners" });`
  - Xuất `Banner` trong `module.exports`.

#### 3. `BE/src/seeders/data/banners.js` (Tạo mới)
- **Mục đích:** Cung cấp bộ dữ liệu hạt giống (seed data) ban đầu tương thích 100% với giao diện 3D hiện hành.
- **Nội dung:** 3 bản ghi cho `hero_slide` (iPhone 18 Pro Max, MacBook Pro M3, iPad Pro) và 1 bản ghi cho `trade_in` (Thu cũ đổi mới trợ giá).

#### 4. `BE/tests/bannerModel.test.js` (Tạo mới)
- **Mục đích:** Kiểm thử tự động tính toàn vẹn của Model và Relationships phía Backend.
- **Nội dung kiểm thử (4 test cases):**
  - Kiểm tra bảng tên `banners` được đăng ký chuẩn với Sequelize.
  - Kiểm tra đủ 19 trường dữ liệu và kiểu dữ liệu (ENUM, JSON, INTEGER, STRING).
  - Kiểm tra association `Banner.belongsTo(Product)` và `Product.hasMany(Banner)`.
  - Kiểm tra association `Banner.belongsTo(Category)` và `Category.hasMany(Banner)`.

---

### 2.2. Nhóm Frontend Admin & Quản Lý Banner (Mục 2)

#### 5. `FE/my-app/src/constants/bannerPresets.js` (Tạo mới)
- **Mục đích:** Tập trung hóa cấu hình nghiệp vụ banner trên Frontend.
- **Nội dung chính:**
  - `BANNER_POSITIONS`: Định nghĩa các vị trí hỗ trợ (`hero_slide`, `trade_in`).
  - `BANNER_SPECS_CONFIG`: Ma trận kiểm tra ảnh cho từng vị trí:
    - `hero_slide.deviceImage`: Khuyến nghị 640x640px (1:1), dung lượng tối đa 2MB, **bắt buộc kênh Alpha (PNG/WebP tách nền)**.
    - `hero_slide.inlineImg`: Tỷ lệ 16:9 (320x180px), không yêu cầu alpha.
    - `trade_in.mainImage`: Tỷ lệ 56:44 (khuyến nghị 448x352px), dung lượng tối đa 2MB.
  - `AMBIENT_PRESETS`: Bảng màu hào quang quang sai 3D (Xanh dương, Tím vũ trụ, Cam hổ phách, Xanh ngọc lục bảo).
  - `INITIAL_MOCK_BANNERS`: Bộ dữ liệu mock hoàn chỉnh dùng cho fallback/offline mode.

#### 6. `FE/my-app/src/services/api/admin/bannerService.js` (Tạo mới)
- **Mục đích:** API Service phía Admin, hỗ trợ CRUD (`getAdminBanners`, `getAdminBannerById`, `createBanner`, `updateBanner`, `deleteBanner`, `toggleBannerStatus`, `updateBannerOrder`).
- **Điểm nổi bật:** Tích hợp tầng đệm fallback đọc/ghi qua `localStorage`. Nếu backend chưa triển khai hoặc mất kết nối, Admin vẫn thao tác CRUD mượt mà không bị crash.

#### 7. `FE/my-app/src/services/api/client/bannerService.js` (Tạo mới)
- **Mục đích:** API Service phía Client cung cấp hàm `getActiveBanners(position)`. Tự động fallback về dữ liệu mẫu của `bannerPresets.js` khi API chưa sẵn sàng.

#### 8. `FE/my-app/src/hooks/admin/useAdminBanners.js` (Tạo mới)
- **Mục đích:** Custom hook đóng gói toàn bộ nghiệp vụ quản lý Banner cho Admin.
- **Chức năng:**
  - Quản lý state danh sách, filter vị trí (`all`, `hero_slide`, `trade_in`).
  - Xử lý mở/đóng modal (Thêm mới / Chỉnh sửa).
  - Pre-flight Validation: Tự động đo đạc chiều rộng, chiều cao, tỷ lệ khung hình và **quét kênh Alpha (trong suốt)** của file ảnh tải lên ngay tại trình duyệt qua HTML5 Canvas API trước khi gửi đi.

#### 9. `FE/my-app/src/hooks/client/useHomeBanners.js` (Tạo mới)
- **Mục đích:** Custom hook gọn nhẹ dùng cho các component trang chủ (Home) để lấy danh sách banner đang hoạt động theo vị trí tương ứng.

#### 10. `FE/my-app/src/components/admin/banners/Banner3DPreview.jsx` (Tạo mới)
- **Mục đích:** Khung Live 3D Preview trực tiếp trong giao diện quản trị.
- **Điểm nổi bật:**
  - Nhập dữ liệu đến đâu, hiệu ứng 3D phản ánh ngay đến đó.
  - Tích hợp component `Card3D` với con quay hồi chuyển di chuột (tilt physics).
  - Tái hiện đúng ánh sáng quang sai `ambient_color`, viền kính thủy tinh mờ (`backdrop-blur-xl`), và badge thông số HUD.

#### 11. `FE/my-app/src/components/admin/banners/BannerTableRow.jsx` (Tạo mới)
- **Mục đích:** Hiển thị từng dòng trong bảng quản trị Banner.
- **Tính năng:**
  - Thumbnail ảnh hiển thị trên nền bàn cờ caro xám trắng (checkered background pattern) giúp nhận biết tức thì ảnh đã tách nền trong suốt hay chưa.
  - Hiển thị badge màu quang sai, nhãn vị trí, badge trạng thái (Hoạt động / Đang ẩn).
  - Switch Toggle bật/tắt trạng thái hiển thị nhanh 1-click.
  - Nút Chỉnh sửa (mở modal) và Xóa (có modal/alert xác nhận an toàn).

#### 12. `FE/my-app/src/components/admin/banners/BannerTable.jsx` (Tạo mới)
- **Mục đích:** Render cấu trúc bảng danh sách banner với layout phân cột khoa học, empty state khi chưa có dữ liệu và loading skeleton.

#### 13. `FE/my-app/src/components/admin/banners/BannerFormModal.jsx` (Tạo mới)
- **Mục đích:** Modal Thêm/Sửa Banner chuyên nghiệp với kiến trúc chia 2 cột:
  - **Cột trái (Form nhập liệu):** Chọn vị trí hiển thị, tiêu đề, nhãn pill, màu quang sai (ambient presets picker), thông số HUD, upload ảnh chính và ảnh inline. Tích hợp thanh **Pre-flight Quality Check** báo cáo trực tiếp trạng thái đạt/chưa đạt về kích thước, tỷ lệ và độ trong suốt.
  - **Cột phải (3D Live Preview):** Hiển thị banner 3D thời gian thực theo đúng góc nghiêng và ánh sáng không gian.

#### 14. `FE/my-app/src/pages/admin/banners/bannerManagement.jsx` (Tạo mới)
- **Mục đích:** Trang quản trị Banner tổng thể (`/admin/banners`).
- **Tính năng:**
  - Hàng thẻ thống kê KPI: Tổng số banner, Số banner đang bật, Số banner đang ẩn, Số vị trí hỗ trợ.
  - Thanh Tabs chuyển đổi nhanh: Tất cả (`All`), Hero Slides 3D (`hero_slide`), Thu cũ đổi mới (`trade_in`).
  - Nút "Thêm Banner Mới" mở modal.

#### 15. `FE/my-app/src/App.jsx` (Chỉnh sửa)
- **Thay đổi:**
  - Import `BannerManagement from "./pages/admin/banners/bannerManagement"`.
  - Khai báo Route con bên trong layout Admin: `<Route path="banners" element={<BannerManagement />} />`.

#### 16. `FE/my-app/src/components/headerAdmin.jsx` (Chỉnh sửa)
- **Thay đổi:**
  - Thêm phần tử `{ label: "Quản lý Banner", href: "/admin/banners", icon: "image" }` vào danh sách menu điều hướng `NAV_ITEMS`.
  - Bổ sung SVG icon `image` vào đối tượng `ICON_PATHS`.

---

### 2.3. Nhóm Frontend Client (Hiển Thị 3D Động với Fallback)

#### 17. `FE/my-app/src/components/client/home/Hero3D.jsx` (Chỉnh sửa)
- **Mục đích:** Chuyển đổi từ dữ liệu hardcode sang hiển thị dữ liệu banner động mà vẫn bảo toàn 100% hiệu ứng 3D, chiều sâu không gian và animation.
- **Thay đổi cụ thể:**
  - Tích hợp hook `const { banners: dynamicBanners } = useHomeBanners("hero_slide");`.
  - Xây dựng hàm parser `parseHeroHeadline(slide)`: Tự động bóc tách chuỗi tiêu đề chứa token `{img1}` và `{img2}` để chèn các khung ảnh typography bo góc 16:9 lồng trong chữ nghệ thuật.
  - Kết nối ánh sáng `ambientColor` động từ database: `slide.ambientColor || slide.ambient_color`.
  - Bọc ảnh thiết bị bằng `resolveProductImageUrl` và xử lý chống gãy ảnh qua `handleImageError(e, iphone18ProMaxImage)`.
  - Cơ chế fallback 2 tầng: Nếu API chưa trả về, sử dụng hằng số tĩnh `FLAGSHIP_HERO_SLIDES`; nếu ảnh riêng lẻ bị 404, lập tức thay bằng ảnh cục bộ của dự án.

#### 18. `FE/my-app/src/components/client/home/HighlightSection.jsx` (Chỉnh sửa)
- **Mục đích:** Thay thế ảnh hardcode của thẻ Trade-in bằng dữ liệu banner vị trí `trade_in`.
- **Thay đổi cụ thể:**
  - Đọc banner thông qua hook: `const { banners: tradeInBanners } = useHomeBanners("trade_in");`.
  - Gắn URL ảnh động qua `resolveProductImageUrl` và bắt sự kiện `onError` với `handleImageError`.
  - Giữ nguyên toàn bộ cấu trúc 3D nghiêng nổi `translateZ(50px)`.

---

### 2.4. Nhóm Test Suites & Độ Ổn Định Dự Án

#### 19. `FE/my-app/tests/bannerManagement.test.mjs` (Tạo mới)
- **Mục đích:** Kiểm thử tính đúng đắn của hằng số, quy tắc specs và ràng buộc chất lượng ảnh trên frontend.
- **Nội dung (5 test cases):**
  - Xác thực đầy đủ các vị trí banner `hero_slide` và `trade_in`.
  - Xác thực cờ bắt buộc `requireAlpha: true` đối với ảnh thiết bị 3D Hero.
  - Xác thực tỷ lệ khung hình `16:9` cho ảnh Typography Inline và `56:44` cho Trade-in.
  - Kiểm tra bảng màu quang sai ambient có định dạng RGBA hợp lệ.
  - Kiểm tra dữ liệu seed mẫu có đầy đủ thuộc tính 3D.

#### 20. `FE/my-app/tests/imageHelper.test.mjs` (Chỉnh sửa)
- **Mục đích:** Khắc phục xung đột tiến trình quét dependency ngầm của Vite 8 khi chạy song song trong môi trường test.
- **Thay đổi:** Thêm tùy chọn `optimizeDeps: { noDiscovery: true }` vào cấu hình khởi tạo Vite test server.

---

## 3. Tổng Kết Kết Quả Kiểm Thử (Verification Report)

```text
Backend Tests (node --test BE/tests/bannerModel.test.js):
  ✔ Banner model is properly defined with correct table name
  ✔ Banner model contains all required 3D and media fields
  ✔ Banner has clear relationship with Product (belongsTo & hasMany)
  ✔ Banner has clear relationship with Category (belongsTo & hasMany)
  tests: 4 | pass: 4 | fail: 0 (100% PASS)

Frontend Tests (node --test in FE/my-app):
  ✔ BANNER_POSITIONS defines both hero_slide and trade_in
  ✔ BANNER_SPECS_CONFIG enforces Alpha channel requirement for Hero 3D device
  ✔ BANNER_SPECS_CONFIG sets correct aspect ratio for Typography Inline and Trade-in
  ✔ AMBIENT_PRESETS contains valid rgba values and hex accents
  ✔ INITIAL_MOCK_BANNERS has valid seed banners with required 3D properties
  ✔ frontend image helper tests (9 cases)
  tests: 14 | pass: 14 | fail: 0 (100% PASS)

ESLint Code Quality:
  eslint . -> 0 errors, 0 warnings

Vite Production Build:
  vite build -> Succeeded in 323ms (0 errors)
```

---

## 4. Trạng Thái Hiện Tại & Bước Kế Tiếp

- **Đã hoàn thành:** Toàn bộ Mục 1 (Database & Associations) và Mục 2 (Giao diện Admin & Client Banner, Live 3D Preview, Pre-flight validation, Fallback an toàn, 100% test pass).
- **Tuân thủ nguyên tắc:** Hoàn toàn **chưa can thiệp vào tầng chức năng logic bên trong (Mục 3)** theo đúng yêu cầu của người dùng.
- **Bước tiếp theo (khi có yêu cầu từ người dùng):** Sẽ triển khai Mục 3 bao gồm:
  1. `BE/src/utils/imageQualityChecker.js`: Sử dụng thư viện `sharp` để kiểm tra độ phân giải, quét kênh Alpha (trong suốt), kiểm tra độ mờ bằng phương sai toán tử Laplacian (Laplacian variance) và nén chuyển đổi tự động sang chuẩn `.webp`.
  2. `BE/src/middleware/uploadBanner.js`: Sử dụng `multer` cấu hình lưu trữ, giới hạn dung lượng và kiểm tra MIME type.
  3. `BE/src/validators/bannerValidators.js`: Bộ lọc kiểm tra dữ liệu bằng `express-validator`.
  4. `BE/src/services/admin/bannerService.js` & `BE/src/controllers/admin/bannerController.js`: Xử lý nghiệp vụ lưu trữ ảnh và CRUD dữ liệu vào cơ sở dữ liệu.
  5. `BE/src/routes/admin/bannerRoutes.js` & `BE/src/routes/client/bannerRoutes.js`: Đăng ký endpoint API vào Express server.

# Kế hoạch Triển khai: Khắc phục thiếu xác thực và phân quyền API Catalog (FUNC-MISS-001)

> **Trạng thái tài liệu:** Kế hoạch baseline đã được triển khai; tiêu chí nghiệm thu gốc giữ nguyên. Kết quả và giới hạn kiểm chứng nằm tại [báo cáo thay đổi](../code-changes/2026-11-19-catalog-auth-guard-change-log.md). Tuân thủ [.agentrules.md](../../.agentrules.md) về việc phân tách kế hoạch và kết quả thực tế.  
> **Căn cứ nghiệp vụ:** [TechStore Development MasterPlan v1.0-v2.xlsx](../TechStore_Development_MasterPlan_v1.0-v2.xlsx) (Sheet 1 Tổng quan, Sheet 3 Chức năng, Sheet 4 Tiêu chí & kiểm thử, Sheet 5 Lộ trình & phụ thuộc), [GLOSSARY.md](../../GLOSSARY.md), [ADR0004](../adr/0004-order-shipping-role-boundary.md).

---

## 1. Định vị trong Quy trình Ask-Matt (Matt Pocock Skills Flow)

Theo bản đồ kỹ năng của Ask-Matt:
1. **Phân loại tác vụ (On-ramp & Main Flow):**  
   - `FUNC-MISS-001` là tác vụ khắc phục lỗ hổng bảo mật cấp thiết (P0) thuộc Nhóm B (*Chưa thực hiện / khắc phục*), Giai đoạn 1 (*Phase 1*) của MasterPlan.
   - Độ phức tạp được đánh giá mức **S** (Small/Scoped), không có phụ thuộc chặn trước (Dependencies: *Không*).
   - Là điều kiện tiên quyết (Hard blocker) của **11 tác vụ quan trọng kế tiếp**: `FUNC-MISS-038` (Upload an toàn), `FUNC-MISS-012` (Cartesian Matrix validation), `FUNC-MISS-021` (CRUD Attribute scope), `FUNC-MISS-022` (Review backend pagination), `UI-MISS-003` (Form Attribute), `FUNC-MISS-016` (Banner API), `FUNC-MISS-018` (Product/Variant edit), `FUNC-MISS-019` (CategoryBrand link), `FUNC-MISS-020` (Brand archive), `FUNC-MISS-027` (Stock adjustment), `FUNC-MISS-029` (Shipper role boundary).
2. **Lộ trình kỹ năng tiếp theo:**  
   - **Giai đoạn hiện tại (Plan & Align):** Trình bày kế hoạch chi tiết, chốt ranh giới kỹ thuật và ma trận kiểm thử (Seams).  
   - **Giai đoạn triển khai (`/implement`):** Thực thi trực tiếp trong phiên làm việc thông qua phương pháp **`/tdd`** (Test-Driven Development theo các lát cắt dọc: Red → Green → Refactor).
   - **Giai đoạn đánh giá (`/code-review`):** Đánh giá diff theo 2 trục Tiêu chuẩn (Standards) và Đặc tả (Spec) trước khi hoàn tất báo cáo kỹ thuật theo quy tắc bắt buộc của `.agentrules.md`.

---

## 2. Thông tin Tác vụ từ MasterPlan

| Thuộc tính | Chi tiết từ MasterPlan Baseline |
| :--- | :--- |
| **Task ID** | `FUNC-MISS-001` |
| **Tên task** | Khắc phục thiếu xác thực/phân quyền API catalog |
| **Phân loại** | Bảo mật quản trị — Sửa lỗi / hoàn thiện phần còn thiếu |
| **Mức độ ưu tiên** | **P0** (Baseline Score: 82; Điểm thành phần: S=5; B=5; U=5; Q=5; P=4; R=5; D=5; E=1; C=1) |
| **Rào chắn P0** | Truy cập, thanh toán hoặc toàn vẹn dữ liệu (Bảo vệ dữ liệu gốc Catalog) |
| **Độ phức tạp** | **S** (Ước lượng sơ bộ, không phải deadline) |
| **Giai đoạn** | Giai đoạn 1 (Khởi động nền tảng bảo mật) |
| **Hiện trạng thực tế** | Admin Order đã có `router.use(requireAuth, requireOrderOperator)`; tuy nhiên 4 router quản trị catalog gồm Product, Brand, Category và VariantAttribute chưa có bất kỳ guard nào ở cấp router hoặc cấp ứng dụng (`app.js`). |
| **Vấn đề / Thiếu sót** | Client bên ngoài hoặc kẻ tấn công có thể gửi request HTTP trực tiếp tới các endpoint ghi catalog, bypass hoàn toàn guard giao diện của Frontend. Đặc biệt, middleware Multer upload file chạy trước khi xác thực, gây nguy cơ đẩy file rác lên ổ đĩa máy chủ. |
| **Mục tiêu** | Mọi API quản trị catalog yêu cầu tài khoản `active` (`status = 1`) có quyền `admin` hoặc `staff`. Khách vãng lai và `customer` bị từ chối triệt để. |
| **Phạm vi công việc** | **Backend:** Bổ sung middleware guard trước upload / validator / service cho cả 4 router; `admin` và `staff` được thao tác catalog; `customer` và tài khoản bị khóa bị cấm. **Frontend:** Giữ guard `RequireAdmin` và xử lý mã lỗi 401/403 tại `httpClient`. **Database:** Không thay đổi cấu trúc bảng. **Ranh giới:** Quyền Review giữ nguyên `admin-only`; Quyền Order giữ nguyên `ADR0004`. |
| **Kết quả đầu ra** | Ma trận Route × Vai trò hoạt động chuẩn xác và bộ regression test tự động trên database cô lập. |

---

## 3. Phân tích Hiện trạng Mã nguồn & Rủi ro Bảo mật

### 3.1. Các điểm rò rỉ bảo mật trong mã nguồn hiện tại

1. **`BE/src/app.js` (Dòng 70–79):**
   ```javascript
   app.use("/api/admin/brands", adminBrandRoutes);
   app.use("/api/admin/categories", adminCategoryRoutes);
   app.use("/api/admin/products", adminProductRoutes);
   app.use("/api/admin/variant-attributes", adminVariantAttributeRoutes);
   ```
   Các router quản trị catalog được mount trực tiếp vào Express app mà không có middleware kiểm tra quyền hạn.

2. **`BE/src/routes/admin/productRoutes.js` (Dòng 7–15):**
   ```javascript
   router.post(
     "/",
     uploadProduct.array("images", 10), // RỦI RO LỚN: Multer ghi file vào đĩa TRƯỚC KHI auth/validate!
     productValidator.createProductRules(),
     productValidator.handleValidationErrors,
     productController.createProduct
   );
   router.get("/", productController.getAllProductsAdmin);
   ```
   - Không có `requireAuth` hoặc kiểm tra role. Bất kỳ ai cũng có thể gọi `POST /api/admin/products` kèm file ảnh để tải file lên thư mục `uploads/products/` của máy chủ.
   - Endpoint `GET /api/admin/products` để lộ toàn bộ danh sách sản phẩm quản trị cho công chúng.

3. **`BE/src/routes/admin/brandRoutes.js` (Dòng 11–26):**
   ```javascript
   router.get("/", getAllBrandsController);
   router.post("/", uploadBrand.single("logo"), ...); // RỦI RO: Upload logo không cần auth
   router.get("/", getAllBrandsController); // Dư thừa 1 route GET trùng lặp
   ```
   - Cho phép người lạ tạo thương hiệu và đẩy logo vào `uploads/brands/`.

4. **`BE/src/routes/admin/categoryRoutes.js` (Dòng 6–11):**
   - Cho phép bất kỳ request nào gọi `POST /api/admin/categories` để chèn danh mục và liên kết `CategoryBrand` vào database.

5. **`BE/src/routes/admin/variantAttributeRoutes.js` (Dòng 11–29):**
   - Cung cấp toàn bộ 7 endpoint CRUD đối với `Attribute` và `Attribute Option` mà không có bất kỳ rào cản bảo mật nào.

### 3.2. Điểm đối chiếu mẫu chuẩn trong hệ thống
Tại `BE/src/routes/admin/orderRoutes.js` (Dòng 4):
```javascript
router.use(require("../../middleware/requireAuth"), require("../../middleware/requireOrderOperator"));
```
Đây là mẫu thiết kế chuẩn đã được thiết lập và kiểm chứng trong dự án, đảm bảo bảo vệ toàn bộ các endpoint bên dưới router mà không cần lặp lại middleware ở từng route con.

---

## 4. Thiết kế Kiến trúc Kỹ thuật (Architecture & Seam Design)

### 4.1. Thiết kế Middleware: `requireCatalogOperator.js`

Tương tự cách `requireOrderOperator.js` hoạt động, ta cần tạo một middleware chuyên biệt hoặc chuẩn hóa cho quản trị catalog:
- **Tên file dự kiến:** `BE/src/middleware/requireCatalogOperator.js`
- **Nguyên lý hoạt động:**
  1. Chạy ngay sau `requireAuth` (đã có `req.user.id` từ cookie `auth_token`).
  2. Truy vấn người dùng từ cơ sở dữ liệu:
     ```javascript
     const user = await User.findByPk(req.user.id, {
       attributes: ["id", "role", "status"],
     });
     ```
  3. Kiểm tra điều kiện thỏa mãn:
     - Tài khoản phải tồn tại.
     - Trạng thái tài khoản phải đang kích hoạt: `user.status === 1`.
     - Vai trò phải thuộc nhóm quản trị viên hoặc nhân viên: `['admin', 'staff'].includes(user.role)`.
  4. Nếu không thỏa mãn: Trả về HTTP `403 Forbidden`:
     ```json
     {
       "success": false,
       "message": "Forbidden: Bạn không có quyền thực hiện thao tác này."
     }
     ```
  5. Nếu thỏa mãn: Gắn vai trò và trạng thái vào request: `req.user.role = user.role; req.user.status = user.status; return next();`.

### 4.2. Cấu hình Router Guard cho 4 Router Quản trị Catalog

Tại đầu mỗi file router (`productRoutes.js`, `brandRoutes.js`, `categoryRoutes.js`, `variantAttributeRoutes.js`), đặt guard toàn cục:
```javascript
const requireAuth = require("../../middleware/requireAuth");
const requireCatalogOperator = require("../../middleware/requireCatalogOperator");

router.use(requireAuth, requireCatalogOperator);
```

#### Trật tự xử lý luồng request (Request Pipeline):
```
Client Request
      │
      ▼
[ requireAuth ] ──(Chưa đăng nhập / Token sai)──► Trả về HTTP 401 Unauthorized
      │
      ▼ (Hợp lệ, có req.user.id)
[ requireCatalogOperator ] ──(status === 0 HOẶC role === 'customer')──► Trả về HTTP 403 Forbidden
      │
      ▼ (Hợp lệ: admin / staff active)
[ Multer Upload (nếu có) ] ──(Chỉ chạy khi ĐÃ QUA AUTH & ROLE)──► Lưu file an toàn
      │
      ▼
[ Express Validator ] ──(Payload sai cú pháp/ràng buộc)──► Trả về HTTP 400 Bad Request
      │
      ▼
[ Controller ]
      │
      ▼
[ Service & DB Transaction ] ──► Trả về HTTP 200 / 201 Thành công
```

> [!IMPORTANT]
> **Tác dụng cốt lõi:** Đặt `requireAuth` và `requireCatalogOperator` trước Multer upload triệt tiêu hoàn toàn nguy cơ kẻ xấu tải file mồ côi hoặc mã độc lên đĩa cứng máy chủ mà không có tài khoản hợp lệ.

---

## 5. Ma trận Route × Vai trò (Authorization Matrix)

Dưới đây là ma trận kiểm soát truy cập đối với 11 route thuộc 4 router quản trị catalog:

| STT | Phương thức | Đường dẫn API | Khách vãng lai (No Auth) | Khách hàng (`customer`, status=1) | Nhân viên bị khóa (`staff`, status=0) | Nhân viên (`staff`, status=1) | Quản trị viên (`admin`, status=1) |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 1 | `POST` | `/api/admin/products` (Tạo Product/Variant/Ảnh) | **401** | **403** | **403** | **201** | **201** |
| 2 | `GET` | `/api/admin/products` (Danh sách sản phẩm admin) | **401** | **403** | **403** | **200** | **200** |
| 3 | `POST` | `/api/admin/brands` (Tạo thương hiệu & Logo) | **401** | **403** | **403** | **201** | **201** |
| 4 | `GET` | `/api/admin/brands` (Danh sách thương hiệu) | **401** | **403** | **403** | **200** | **200** |
| 5 | `POST` | `/api/admin/categories` (Tạo danh mục) | **401** | **403** | **403** | **201** | **201** |
| 6 | `GET` | `/api/admin/variant-attributes` (Lấy Attributes) | **401** | **403** | **403** | **200** | **200** |
| 7 | `POST` | `/api/admin/variant-attributes` (Tạo Attribute) | **401** | **403** | **403** | **201** | **201** |
| 8 | `PUT` | `/api/admin/variant-attributes/:id` (Sửa Attribute) | **401** | **403** | **403** | **200** | **200** |
| 9 | `DELETE` | `/api/admin/variant-attributes/:id` (Xóa Attribute) | **401** | **403** | **403** | **200** | **200** |
| 10 | `POST` | `/api/admin/variant-attributes/:id/options` (Thêm Option) | **401** | **403** | **403** | **201** | **201** |
| 11 | `PUT` | `/api/admin/variant-attributes/:id/options/:optId` | **401** | **403** | **403** | **200** | **200** |
| 12 | `DELETE` | `/api/admin/variant-attributes/:id/options/:optId` | **401** | **403** | **403** | **200** | **200** |

---

## 6. Tiêu chí Nghiệm thu & Ca Kiểm thử (Acceptance Criteria - Sheet 4)

| Mã AC | Tiêu chí yêu cầu | Dữ liệu kiểm thử | Các bước kiểm tra | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- |
| **`FUNC-MISS-001-AC-01`** | Mọi route catalog quản trị chặn người không đăng nhập. | Không truyền cookie xác thực; thử nghiệm với request JSON và Multipart form-data. | Gửi request `GET`, `POST`, `PUT`, `DELETE` tới tất cả 11 route ở 4 router catalog. | Trả về HTTP `401 Unauthorized` trước khi thực thi ghi database hoặc lưu file vào ổ đĩa máy chủ; không làm lộ payload/thông tin nội bộ. |
| **`FUNC-MISS-001-AC-02`** | Customer và tài khoản bị khóa không có quyền truy cập. | Tài khoản `customer` (`status = 1`); Tài khoản `staff` bị khóa (`status = 0`). | Đăng nhập lấy cookie của 2 tài khoản trên; gọi lần lượt ma trận 11 route. | Trả về HTTP `403 Forbidden`; không làm thay đổi trạng thái database; không lưu file upload. |
| **`FUNC-MISS-001-AC-03`** | Admin và Staff active được quyền truy cập đúng các route hiện hữu. | Tài khoản `admin` (`status = 1`); Tài khoản `staff` (`status = 1`); Payload mẫu hợp lệ. | Đăng nhập lấy cookie tương ứng; thực thi các route đọc và ghi dữ liệu. | Request được xử lý thành công (`200`/`201`); Review vẫn giữ nguyên `admin-only`; Order tuân thủ ranh giới `ADR0004`. |

---

## 7. Chiến lược Kiểm thử Tự động (TDD & Automation Strategy)

Thực hiện viết kiểm thử tự động tại file mới: `BE/tests/catalogAuthGuard.test.js`.

### 7.1. Cấu hình kiểm thử cô lập (Test Isolation Harness)
- **Framework:** `node:test` và `node:assert/strict` (theo chuẩn Node.js có sẵn, không phát sinh dependency mới).
- **Cơ sở dữ liệu:** Tạo database riêng biệt theo PID: `techstore_catalog_test_${process.pid}`. Tự động drop database khi hoàn thành test trong hook `after()`. **Tuyệt đối không chạy trên database cửa hàng thật**.
- **Bộ Fixture tài khoản mẫu:**
  1. `Admin Active` (`id: 1, role: 'admin', status: 1`)
  2. `Staff Active` (`id: 2, role: 'staff', status: 1`)
  3. `Customer Active` (`id: 3, role: 'customer', status: 1`)
  4. `Staff Locked` (`id: 4, role: 'staff', status: 0`)
- **Khởi tạo Server Ephemeral:** Khởi chạy `app.listen(0, '127.0.0.1')` để lấy dynamic port ngẫu nhiên, tránh xung đột cổng.

### 7.2. Kiểm thử chống lưu file mồ côi (Upload Guard Test)
- Sử dụng request multipart có đính kèm file ảnh giả lập (`test-logo.png` hoặc buffer ảnh).
- Gọi `POST /api/admin/brands` và `POST /api/admin/products` ở trạng thái Unauthenticated và Customer.
- Kiểm tra danh sách file trong thư mục `BE/uploads/brands` và `BE/uploads/products`: Số lượng file trước và sau request phải giữ nguyên tuyệt đối (không có file mới sinh ra).

---

## 8. Đồng bộ Phía Giao diện Người dùng (Frontend Alignment)

1. **Guard Route hiện hữu (`FE/my-app/src/App.jsx`):**
   - Đã có component `RequireAdmin` bảo vệ toàn bộ nhánh `/admin/*`.
   - `RequireAdmin` cho phép người dùng có `user.role === 'admin' || user.role === 'staff'` truy cập, chuyển hướng các vai trò khác về `/`. Điều này hoàn toàn khớp với hợp đồng quyền hạn của Backend.
2. **Cơ chế xử lý lỗi HTTP (`FE/my-app/src/services/api/httpClient.js`):**
   - Đã cấu hình `credentials: "include"` tự động gửi cookie `auth_token`.
   - Khi Backend trả về `401` hoặc `403`, `httpClient` ném lỗi có đầy đủ `error.status` và `error.payload`, giúp các component quản trị hiển thị toast thông báo hoặc chuyển hướng đăng nhập mượt mà.

---

## 9. Kế hoạch Thực thi Chi tiết Từng bước (Step-by-Step TDD Slices)

| Bước | Hành động | Mục tiêu / Đầu ra |
| :---: | :--- | :--- |
| **Bước 1** | **Viết Test Đỏ (Red TDD Slice)** | Tạo file `BE/tests/catalogAuthGuard.test.js` kiểm thử ma trận route × vai trò cho 4 router catalog. Chạy `npm test` để xác nhận test thất bại (Red) vì các router chưa có guard. |
| **Bước 2** | **Tạo Middleware Guard** | Tạo file `BE/src/middleware/requireCatalogOperator.js` kiểm tra tài khoản `active` và vai trò `admin`/`staff`. |
| **Bước 3** | **Gắn Guard vào 4 Router** | Thêm `router.use(requireAuth, requireCatalogOperator)` vào `productRoutes.js`, `brandRoutes.js`, `categoryRoutes.js`, `variantAttributeRoutes.js`. Đồng thời dọn dẹp route `GET /` trùng lặp tại `brandRoutes.js`. |
| **Bước 4** | **Chạy Test Xanh (Green TDD Slice)** | Chạy lại `npm test` để xác nhận toàn bộ ca kiểm thử trong `catalogAuthGuard.test.js` chuyển sang Pass (Green). |
| **Bước 5** | **Regression Test Toàn diện** | Chạy toàn bộ bộ test của BE (`node --test tests/*.test.js`) gồm orderStatusApproval, productSearch, bannerModel để đảm bảo không gây hồi quy (Zero regression). |
| **Bước 6** | **Code Review & Lập tài liệu nghiệm thu** | Thực hiện review diff theo skill `code-review`. Lập tài liệu báo cáo kỹ thuật `YYYY-MM-DD-khac-phuc-lo-hong-catalog-auth-code-review.md` trong thư mục `docs/` theo đúng mẫu chuẩn của `.agentrules.md`. |

## 10. Ghi chú triển khai trước khi code (2026-11-19)

Các ghi chú này làm rõ hiện trạng kỹ thuật; giữ nguyên các tiêu chí AC-01, AC-02, AC-03 làm baseline nghiệm thu.

- Bảng tại mục 5 và mã nguồn thực tế có **12 route phân biệt**, dù phần diễn giải ghi 11. Kiểm thử phủ đủ 12 route; route GET Brand trùng lặp không tính thành endpoint riêng.
- Multer thực tế ghi vào `BE/src/uploads/brands/` và `BE/src/uploads/products/`, không phải `BE/uploads/`. Kiểm tra danh sách file trước/sau tại đúng nơi ghi thực tế.
- Biên kiểm thử đã được xác định tại mục 5–7: HTTP qua app thật với cookie JWT, DB MySQL tạm theo PID và tác động lên thư mục upload. Dùng payload hợp lệ để chứng minh request bị từ chối không đi tới nghiệp vụ; so sánh cả nội dung các bảng catalog trước/sau. Test tạo cookie JWT cho fixture thay vì phụ thuộc API đăng nhập, mô phỏng cả phiên được cấp trước khi khóa tài khoản; bổ sung token sai/hết hạn, user không còn tồn tại và thay đổi quyền sau khi cấp token.
- Triển khai TDD theo lát cắt dọc: một router có test đỏ → thêm guard tối thiểu → test xanh, rồi mở rộng ma trận quyền và ca upload. Không viết toàn bộ test trước khi triển khai.
- Database lỗi phải chuyển tới error handler tập trung, không để request chạy tiếp; phản hồi 500 không chứa thông tin SQL. Không sửa luồng xác thực chung, Review, Order, frontend hoặc schema DB.
- Test upload chỉ so sánh file hiện có và file do chính test tạo; tuyệt đối không dọn file người dùng. Test kết thúc đóng server/kết nối và chỉ drop schema có tên sinh từ PID của tiến trình.
- Báo cáo thay đổi bắt buộc: `docs/code-changes/2026-11-19-catalog-auth-guard-change-log.md`, đủ phần A–F theo `.agentrules.md`. Báo cáo Code Review độc lập được lưu tại `docs/code-reviews/`; không thay thế change log.
- Mốc review: HEAD trước triển khai `361fa16a96de1e384f0755a2b1230a3997a3ad14`; review cả file mới chưa tracked và diff working tree trong phạm vi task vì repo cấm tự commit. Các thay đổi có sẵn của người dùng nằm ngoài phạm vi review task.

| File dự kiến | Thay đổi | Mục đích |
| --- | --- | --- |
| `BE/src/middleware/requireCatalogOperator.js` | Tạo mới | Load role/status hiện tại từ DB, cho phép admin/staff active |
| `BE/src/routes/admin/productRoutes.js` | Sửa | Guard toàn router trước upload/validator/controller |
| `BE/src/routes/admin/brandRoutes.js` | Sửa | Guard toàn router và bỏ GET trùng |
| `BE/src/routes/admin/categoryRoutes.js` | Sửa | Guard trước validator/controller |
| `BE/src/routes/admin/variantAttributeRoutes.js` | Sửa | Guard toàn bộ CRUD Attribute/Attribute Option |
| `BE/tests/catalogAuthGuard.test.js` | Tạo mới | HTTP integration, ma trận quyền, DB và upload isolation |
| `docs/task-plans/2026-11-19-catalog-auth-guard-plan.md` | Bổ sung mục 10 | Ghi nhận sai lệch kỹ thuật trước khi code |
| `docs/code-changes/2026-11-19-catalog-auth-guard-change-log.md` | Tạo mới | Báo cáo diff, kiểm thử và nghiệm thu A–F |
| `docs/code-reviews/2026-11-19-khac-phuc-lo-hong-catalog-auth-code-review.md` | Tạo mới | Báo cáo Code Review độc lập theo bước 6, hai trục Standards/Spec |

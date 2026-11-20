# Phỏng vấn kỹ thuật: Chặn tài khoản khóa trên login và API đã xác thực (FUNC-MISS-003)

Trạng thái: Đã thống nhất toàn bộ các quyết định Q1–Q5 trong Vòng 1. Đã hoàn thành [kế hoạch triển khai](../task-plans/2026-11-20-chan-tai-khoan-khoa-plan.md). Chưa bắt đầu triển khai mã nguồn.

---

## 1. Mục tiêu và cơ sở kỹ thuật

- **Mã công việc:** `FUNC-MISS-003` (Trạng thái tài khoản | Sửa lỗi / hoàn thiện phần còn thiếu — Độ ưu tiên: P0, Size M, Điểm đánh giá: 75).
- **Mục tiêu cốt lõi:** Ngăn chặn triệt để tài khoản đã bị khóa (`status = 0`) hoặc tài khoản đã bị xóa khỏi cơ sở dữ liệu đăng nhập mới hoặc tiếp tục sử dụng các phiên đăng nhập JWT cũ để gọi các API yêu cầu xác thực (`/api/auth/me`, `/api/cart/*`, `/api/orders/*`, `/api/users/profile`, `/api/reviews/*`).
- **Tài liệu căn cứ:**
  - `docs/TechStore_Master_Plan.xlsx` (Sheet 1 dòng 18 & 39; Sheet 3 dòng 25; Sheet 4 dòng 139-141; Sheet 5 dòng 8).
  - Quy chuẩn bắt buộc tại [AGENTS.md](../../AGENTS.md).

---

## 2. Tiêu chí nghiệm thu gốc (Acceptance Criteria)

Theo đặc tả tại Sheet 4 (Tiêu chí) của `TechStore_Master_Plan.xlsx`:

| Mã AC | Tiêu chí | Điều kiện thử nghiệm | Thao tác thực hiện | Kết quả kỳ vọng |
| --- | --- | --- | --- | --- |
| **FUNC-MISS-003-AC-01** | Tài khoản khóa không đăng nhập được. | Môi trường thử nghiệm cô lập; dữ liệu giả; `status = 0`, mật khẩu đúng. | `POST /api/auth/login` | Trả về HTTP 401/403 với thông báo chung; không set cookie phiên mới (`auth_token`). |
| **FUNC-MISS-003-AC-02** | JWT cũ mất hiệu lực ngay khi tài khoản khóa/xóa. | User active nhận JWT rồi đổi `status = 0` hoặc xóa trong DB thử. | Gọi `me`, `cart`, `orders`, `profile`, `review` sau khi tài khoản bị đổi trạng thái. | Từ chối trước mutation (HTTP 401); không có dữ liệu mới nào được ghi. |
| **FUNC-MISS-003-AC-03** | User active vẫn dùng được các luồng cũ. | `admin`, `staff`, `customer` ở trạng thái `status = 1` (active). | Chạy smoke test login, cart, profile, order và phân quyền. | Hoạt động bình thường; không giảm kiểm quyền Order hoặc tạo bypass qua role. |

---

## 3. Khảo sát hiện trạng mã nguồn

| Thành phần | File mã nguồn | Hiện trạng thực tế | Vấn đề / Lỗ hổng phát hiện |
| --- | --- | --- | --- |
| **Auth Middleware** | `BE/src/middleware/requireAuth.js:19` | Chỉ giải mã `jwt.verify(token, secret)` và gán `req.user = { id: payload.userId }`. Không truy vấn DB. | User bị khóa hoặc bị xóa nếu còn giữ cookie JWT (hạn 7 ngày) vẫn vượt qua `requireAuth` để gọi tất cả API bảo vệ. |
| **Login Service** | `BE/src/services/client/authService.js:25` | `User.findOne` chỉ select `["id", "name", "email", "avatar", "role", "password"]`, hoàn toàn không select `status`. | User có `status = 0` khi nhập đúng password vẫn đăng nhập thành công và được cấp JWT mới. |
| **Me Service** | `BE/src/services/client/authService.js:61` | `User.findByPk(userId)` chỉ select thông tin cá nhân, không kiểm tra `status`. | `GET /api/auth/me` vẫn trả về profile hợp lệ cho user bị khóa. |
| **Admin Middleware** | `BE/src/middleware/requireAdmin.js:13` | Chỉ select `["id", "role"]`, kiểm tra `role === "admin"`, không kiểm tra `status === 1`. | Admin bị khóa vẫn thao tác được các API quản trị chỉ dùng `requireAdmin`. |
| **Catalog Middleware** | `BE/src/middleware/requireCatalogOperator.js:10` | Đã select `["id", "role", "status"]` và kiểm tra `user.status !== 1`. | Đã kiểm tra đúng, nhưng đang tự query lại DB độc lập với `requireAuth`. |
| **Order Actor Service** | `BE/src/services/orderStatusService.js:14` | Đã kiểm tra `actor.status !== 1`. | Đã kiểm tra đúng ở tầng service duyệt trạng thái đơn hàng. |
| **Client Session UI** | `FE/my-app/src/services/api/httpClient.js`, `FE/my-app/src/contexts/authContext.jsx` | `httpClient.js` ném lỗi HTTP khi nhận 401; `authContext` chỉ set `user = null` khi `refreshMe` thất bại. | Chưa có cơ chế dọn dẹp session UI tập trung khi các API nghiệp vụ nhận 401 giữa phiên. |

---

## 4. Thuật ngữ miền (Domain Modeling)

Đã cập nhật vào [GLOSSARY.md](../../GLOSSARY.md) theo quy tắc của skill `domain-modeling`:

- **Account Status (Trạng thái tài khoản):** Trạng thái kích hoạt của tài khoản người dùng trong hệ thống gồm Hoạt động (`status = 1`) và Bị khóa (`status = 0`); chỉ tài khoản Hoạt động mới được phép tạo phiên đăng nhập mới và thực hiện các thao tác cần xác thực.
  - _Avoid_: User status, Ban status, Is active flag
- **Session Revocation (Thu hồi phiên truy cập):** Hành vi tức thời làm mất hiệu lực của phiên làm việc (JWT cookie) ngay khi tài khoản chuyển sang trạng thái Bị khóa hoặc bị xóa khỏi hệ thống, đảm bảo không có đột biến dữ liệu nào được thực hiện bằng phiên cũ.
  - _Avoid_: Token destroy, Kick user, Force logout

---

## 5. Cây quyết định (Design Tree)

- **Gốc:** Cơ chế chặn tài khoản bị khóa toàn diện trên TechStore
  - ├── **Nhánh 1 (Xác thực & Thu hồi Token):** Làm thế nào để JWT cũ mất hiệu lực ngay lập tức khi tài khoản bị khóa/xóa? *(Q1 - Đã chốt Option 1)*
  - ├── **Nhánh 2 (Bảo mật Đăng nhập):** Mã lỗi và thông điệp trả về khi tài khoản bị khóa cố đăng nhập? *(Q2 - Đã chốt Option 1)*
  - ├── **Nhánh 3 (Dọn dẹp Cookie):** Server xử lý cookie phiên như thế nào khi phát hiện token của tài khoản khóa? *(Q3 - Đã chốt Option 1)*
  - ├── **Nhánh 4 (Tối ưu chuỗi RBAC Backend):** Đồng bộ hóa và tái sử dụng dữ liệu xác thực giữa `requireAuth` và các middleware phân quyền? *(Q4 - Đã chốt Option 1)*
  - └── **Nhánh 5 (Đồng bộ Session UI Frontend):** Cơ chế xử lý của Frontend khi API trả về mã lỗi do tài khoản bị khóa? *(Q5 - Đã chốt Option 1)*

---

## 6. Vòng 1 — Tiền đề kỹ thuật cốt lõi (Đã trả lời)

| Câu hỏi | Quyết định kỹ thuật | Kết quả lựa chọn |
| --- | --- | --- |
| **Q1** | Cơ chế vô hiệu hóa phiên JWT khi tài khoản bị khóa hoặc xóa | **Đồng ý Option 1:** Truy vấn trực tiếp cơ sở dữ liệu kiểm tra `status === 1` ngay tại `requireAuth`. |
| **Q2** | Mã lỗi và phản hồi bảo mật khi đăng nhập bằng tài khoản bị khóa | **Đồng ý Option 1:** Trả về HTTP 401 với thông báo chung `Invalid credentials`, không cấp cookie phiên. |
| **Q3** | Cơ chế thu hồi Cookie `auth_token` khi phát hiện phiên không hợp lệ | **Đồng ý Option 1:** `requireAuth` chủ động xóa cookie bằng `res.clearCookie` ngay khi phát hiện tài khoản không hợp lệ. |
| **Q4** | Tái cấu trúc chuỗi Middleware phân quyền (`requireAdmin`, `requireCatalogOperator`) | **Đồng ý Option 1:** `requireAuth` gán `{ id, role, status }` vào `req.user`; các middleware sau tái sử dụng `req.user`. |
| **Q5** | Đồng bộ hóa phiên làm việc phía Frontend khi nhận mã lỗi 401 | **Đồng ý Option 1:** `httpClient.js` phát sự kiện `auth:unauthorized`; `AuthContext` lắng nghe và dọn dẹp state UI. |

---

## 7. Quyết định đã chốt chính thức

- **Quyết định 1 (AC-02 & Auth Boundary):** Middleware `requireAuth` là chốt chặn bảo mật trung tâm. Sau khi xác thực chữ ký JWT, middleware thực hiện truy vấn `User.findByPk(payload.userId, { attributes: ["id", "role", "status"] })`. Nếu user không tồn tại hoặc `user.status !== 1`, middleware lập tức thu hồi cookie phiên và từ chối request với mã lỗi HTTP 401.
- **Quyết định 2 (AC-01 & Security Login):** `loginService` trong `authService.js` bổ sung `status` vào danh sách trường truy vấn. Nếu `user.status !== 1`, ném lỗi HTTP 401 với thông báo chung `Invalid credentials` (đồng nhất với sai mật khẩu/email), tuyệt đối không set cookie `auth_token`. Đồng thời, `meService` kiểm tra `user.status === 1`, từ chối trả về thông tin phiên nếu tài khoản bị khóa.
- **Quyết định 3 (Cookie Cleanup):** Hàm dọn dẹp cookie trong `requireAuth` sử dụng đúng các cờ cấu hình cookie của dự án (`httpOnly: true`, `secure: isProd`, `sameSite: isProd ? "none" : "lax"`), đảm bảo xóa sạch cookie trên client ngay lập tức.
- **Quyết định 4 (RBAC Optimization):** `requireAdmin` và `requireCatalogOperator` tái sử dụng `req.user` đã được nạp và kiểm tra từ `requireAuth`, loại bỏ truy vấn lặp và đảm bảo tài khoản admin/staff bị khóa không thể vượt qua hàng rào phân quyền.
- **Quyết định 5 (Frontend UI State):** `httpClient.js` khi nhận phản hồi HTTP 401 sẽ dispatch CustomEvent `auth:unauthorized`. `AuthProvider` trong `authContext.jsx` đăng ký listener cho sự kiện này để cập nhật `user = null`, `loading = false`, giúp toàn bộ ứng dụng chuyển về trạng thái khách vãng lai an toàn.

---

## 8. Ranh giới bàn giao và Phạm vi (Scope & Boundaries)

- **Thuộc phạm vi (In Scope):**
  - Cập nhật `BE/src/middleware/requireAuth.js`: kiểm tra user tồn tại và `status === 1` trong DB, xóa cookie nếu không hợp lệ.
  - Cập nhật `BE/src/services/client/authService.js`:
    - `loginService`: truy vấn thêm `status`, chặn nếu `status !== 1`, trả về HTTP 401 thông báo chung.
    - `meService`: truy vấn thêm `status`, chặn nếu `status !== 1`.
  - Cập nhật `BE/src/middleware/requireAdmin.js` và `BE/src/middleware/requireCatalogOperator.js`: tái sử dụng `req.user`, yêu cầu `status === 1` và áp dụng quyền riêng của mỗi middleware. Người dùng xác nhận đưa Catalog vào phạm vi trước khi triển khai.
  - Cập nhật `FE/my-app/src/services/api/httpClient.js` & `FE/my-app/src/contexts/authContext.jsx`: đồng bộ dọn dẹp state UI khi gặp 401.
  - Xây dựng bài kiểm thử tự động cô lập kiểm chứng đầy đủ 3 tiêu chí AC-01, AC-02, AC-03.
- **Ngoài phạm vi (Out of Scope):**
  - Không thay đổi schema cơ sở dữ liệu (giữ nguyên bảng `users`, không thêm cột hay bảng mới).
  - Không xây dựng màn hình hoặc API quản lý mở khóa tài khoản cho Admin (đây là nhiệm vụ của `FUNC-ENH-012`).
  - Không thay đổi hợp đồng API hiện có của các dịch vụ Cart, Order, Review ngoài việc bảo vệ quyền truy cập bằng `requireAuth`.

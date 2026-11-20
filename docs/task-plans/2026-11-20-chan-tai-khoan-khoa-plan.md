# Kế hoạch Triển khai: Chặn tài khoản khóa trên login và API đã xác thực (FUNC-MISS-003)

> **Trạng thái tài liệu:** Kế hoạch baseline chi tiết, đã hoàn thành phỏng vấn yêu cầu tại [docs/interviews/2026-11-20-chan-tai-khoan-khoa-interview.md](../interviews/2026-11-20-chan-tai-khoan-khoa-interview.md). Tiêu chí nghiệm thu gốc giữ nguyên từ Master Plan. Tuân thủ [AGENTS.md](../../AGENTS.md).
> **Căn cứ nghiệp vụ:** [TechStore Master Plan](../../docs/TechStore_Master_Plan.xlsx) (Sheet 1 Tổng quan dòng 18 & 39; Sheet 3 Chức năng dòng 25; Sheet 4 Tiêu chí & kiểm thử dòng 139–141; Sheet 5 Lộ trình dòng 8), [GLOSSARY.md](../../GLOSSARY.md).

---

## 1. Thông tin Tác vụ từ Master Plan

| Thuộc tính | Chi tiết từ Master Plan Baseline |
| :--- | :--- |
| **Task ID** | `FUNC-MISS-003` |
| **Tên task** | Chặn tài khoản khóa trên login và API đã xác thực |
| **Phân loại** | Trạng thái tài khoản — Sửa lỗi / hoàn thiện phần còn thiếu |
| **Mức độ ưu tiên** | **P0** (Baseline Score: 75; Điểm thành phần: S=5; B=5; U=4; Q=5; P=3; R=5; D=5; E=3; C=3) |
| **Rào chắn P0** | Truy cập, thanh toán hoặc toàn vẹn dữ liệu (Ngăn chặn đột biến dữ liệu từ tài khoản bị khóa/xóa) |
| **Độ phức tạp** | **M** (Ước lượng sơ bộ, không phải deadline) |
| **Giai đoạn** | Giai đoạn 1 (Khởi động nền tảng bảo mật) |
| **Phụ thuộc** | Không có phụ thuộc chặn trước; liên quan (không phải phụ thuộc cứng): `FUNC-DONE-001` (Auth JWT cookie), `FUNC-DONE-005` (Order Status) |
| **Hiện trạng thực tế** | `requireAuth` chỉ verify JWT bằng `jwt.verify(token, secret)` mà không truy vấn DB; `loginService` và `meService` không select `status`; `requireAdmin` chỉ kiểm tra role mà bỏ qua status; chỉ `requireCatalogOperator` và `orderStatusService.loadActor` là có kiểm tra `status === 1`. |
| **Vấn đề / Thiếu sót** | Tài khoản bị đổi `status = 0` (hoặc bị xóa) nhưng còn giữ cookie JWT hợp lệ (hạn 7 ngày) vẫn gọi được toàn bộ API yêu cầu xác thực (`/api/auth/me`, `/api/cart/*`, `/api/orders/*`, `/api/users/profile`, `/api/reviews/*`), ghi dữ liệu trái phép. Tài khoản bị khóa vẫn đăng nhập được nếu nhập đúng mật khẩu. |
| **Mục tiêu cốt lõi** | 1. Đăng nhập với tài khoản `status = 0` bị từ chối bằng HTTP 401 (thông báo chung, không cấp cookie phiên).<br>2. Toàn bộ request có JWT cũ của tài khoản `status = 0` hoặc tài khoản đã xóa bị từ chối tức thời trước mutation (HTTP 401), đồng thời cookie `auth_token` bị xóa khỏi client.<br>3. Tài khoản active (`status = 1`) thuộc mọi vai trò (`admin`, `staff`, `customer`) hoạt động bình thường, không suy giảm kiểm quyền. |
| **Phạm vi công việc** | **Backend:** Cập nhật `requireAuth.js`, `authService.js` (`loginService`, `meService`), tái sử dụng `req.user` trong `requireAdmin.js` và `requireCatalogOperator.js` theo Q4 đã xác nhận. **Frontend:** Dọn phiên UI qua `httpClient.js` và `authContext.jsx`, đưa thao tác ghi review qua HTTP client chung. **Database:** Giữ nguyên schema bảng `users`. |

---

## 2. Tiêu chí Nghiệm thu Gốc (Acceptance Criteria)

Theo đặc tả bắt buộc tại Sheet 4 của `TechStore_Master_Plan.xlsx`:

| Mã AC | Tiêu chí | Điều kiện thử nghiệm | Thao tác thực hiện | Kết quả kỳ vọng | Phân loại |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FUNC-MISS-003-AC-01** | Tài khoản khóa không đăng nhập được. | Môi trường thử nghiệm cô lập; dữ liệu giả; không dùng DB cửa hàng. Tài khoản `status = 0`, mật khẩu đúng. | `POST /api/auth/login` | Trả về HTTP 401/403 với thông báo chung; không set cookie phiên mới. | Bảo mật (Bắt buộc) |
| **FUNC-MISS-003-AC-02** | JWT cũ mất hiệu lực ngay khi tài khoản khóa/xóa. | User active nhận JWT rồi đổi `status = 0` hoặc xóa trong DB thử. | Gọi `me`, `cart`, `orders`, `profile`, `review` sau thay đổi. | Từ chối trước mutation (HTTP 401); không dữ liệu mới được ghi; cookie phiên bị thu hồi. | Tích hợp (Bắt buộc) |
| **FUNC-MISS-003-AC-03** | User active vẫn dùng được các luồng cũ. | User `admin`/`staff`/`customer` ở trạng thái `status = 1`. | Chạy smoke test login, cart, profile, order và phân quyền. | Hoạt động bình thường; không giảm kiểm quyền Order hoặc tạo bypass qua role. | Tích hợp (Bắt buộc) |

---

## 3. Phân tích Hiện trạng Mã nguồn & Điểm Rò rỉ

### 3.1. Các điểm rò rỉ trong mã nguồn Backend

1. **`BE/src/middleware/requireAuth.js` (Dòng 9–27):**
   ```javascript
   const payload = jwt.verify(token, secret);
   // payload dự kiến: { userId }
   req.user = { id: payload.userId };
   return next();
   ```
   - **Rò rỉ:** Hoàn toàn không kiểm tra xem user với `id = payload.userId` có còn tồn tại trong DB hay không, và `status` có phải là `1` (hoạt động) hay không. Bất kỳ ai sở hữu token còn hạn đều vượt qua bước này.

2. **`BE/src/services/client/authService.js` (Dòng 23–26 & 60–63):**
   ```javascript
   // loginService:
   const user = await User.findOne({
     where: { email: normalizedEmail },
     attributes: ["id", "name", "email", "avatar", "role", "password"],
   });
   // meService:
   const user = await User.findByPk(userId, {
     attributes: ["id", "name", "email", "phone", "address", "avatar", "role"],
   });
   ```
   - **Rò rỉ:** Danh sách `attributes` bỏ quên trường `status`. Khi user có `status = 0` đăng nhập với password đúng, hàm vẫn tạo JWT và trả về thông tin đăng nhập thành công. Khi gọi `GET /api/auth/me`, hệ thống vẫn trả về profile đầy đủ.

3. **`BE/src/middleware/requireAdmin.js` (Dòng 12–21):**
   ```javascript
   const user = await User.findByPk(req.user.id, {
     attributes: ["id", "role"],
   });
   if (!user || user.role !== "admin") { ... }
   ```
   - **Rò rỉ & Dư thừa:** Chỉ kiểm tra role `admin`, quên kiểm tra `status === 1`. Đồng thời query lại DB một lần nữa sau `requireAuth`.

### 3.2. Điểm thiếu đồng bộ phía Frontend

1. **`FE/my-app/src/services/api/httpClient.js` (Dòng 23–29):**
   - Khi nhận HTTP 401 từ server, `httpClient.js` chỉ throw Error `error.status = 401`.
   - Các màn hình/hook gọi API nghiệp vụ (`useCart`, `useUserProfile`, `useProductDetail`) chỉ hiển thị toast lỗi hoặc catch cục bộ mà không thông báo cho `AuthContext` dọn dẹp state người dùng. Người dùng vẫn thấy avatar/tên hiển thị trên Header (đăng nhập ảo).

2. **`FE/my-app/src/contexts/authContext.jsx` (Dòng 30–40):**
   - Chỉ reset `user = null` khi hàm `refreshMe` thất bại, chưa có cơ chế tiếp nhận phản hồi từ các API nghiệp vụ khác khi phiên bị thu hồi giữa chừng.

---

## 4. Thiết kế Kiến trúc Kỹ thuật

### 4.1. Cấu trúc Cookie Options chuẩn hóa
Để đảm bảo thu hồi cookie triệt để trên cả môi trường Development và Production, cookie options khi xóa (`res.clearCookie`) phải khớp chính xác với options khi set tại `BE/src/controllers/client/authController.js`:
```javascript
const isProd = process.env.NODE_ENV === "production";
const COOKIE_CLEAR_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
};
```

### 4.2. Thiết kế mới cho `BE/src/middleware/requireAuth.js`
- **Nguyên lý:**
  1. Đọc cookie `auth_token`. Nếu không có -> trả HTTP 401 `Unauthorized`.
  2. Giải mã `jwt.verify(token, secret)`. Nếu token sai/hết hạn -> trả HTTP 401 và gọi `res.clearCookie("auth_token", COOKIE_CLEAR_OPTIONS)`.
  3. Truy vấn DB:
     ```javascript
     const user = await User.findByPk(payload.userId, {
       attributes: ["id", "role", "status"],
     });
     ```
  4. Nếu `!user` (đã bị xóa khỏi DB) hoặc `user.status !== 1` (đã bị khóa):
     - Gọi `res.clearCookie("auth_token", COOKIE_CLEAR_OPTIONS)`.
     - Trả HTTP 401 với response shape chuẩn:
       ```json
       { "success": false, "message": "Unauthorized" }
       ```
  5. Nếu hợp lệ: Gán `req.user = { id: user.id, role: user.role, status: user.status }` và chuyển tiếp `return next()`.
- **Đảm bảo quy chuẩn AGENTS.md Mục 3.2:** Dùng arrow function `const requireAuth = async (req, res, next) => { ... }; module.exports = requireAuth;`.

### 4.3. Thiết kế mới cho `BE/src/services/client/authService.js`
- **`loginService`:**
  - Bổ sung `"status"` vào mảng `attributes`.
  - Sau khi kiểm tra `user` tồn tại và mật khẩu khớp qua `bcrypt.compare`, thêm điều kiện kiểm tra:
    ```javascript
    if (user.status !== 1) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }
    ```
  - Thông báo chung `"Invalid credentials"` và mã lỗi 401 ngăn chặn hoàn toàn việc dò quét tài khoản (chống Account Enumeration).
- **`meService`:**
  - Bổ sung `"status"` vào `attributes`.
  - Sau khi tìm user, nếu `user.status !== 1`:
    ```javascript
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
    ```

### 4.4. Tái sử dụng quyền trong middleware Admin và Catalog
- Vì `requireAuth` đã luôn chạy trước và nạp đầy đủ `{ id, role, status }` vào `req.user`, `requireAdmin` chỉ cần kiểm tra trực tiếp:
  ```javascript
  const requireAdmin = async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== "admin" || req.user.status !== 1) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Admin access required",
        });
      }
      return next();
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }
  };
  module.exports = requireAdmin;
  ```
  - `requireAdmin` yêu cầu role `admin`. `requireCatalogOperator` yêu cầu role `admin` hoặc `staff`. Cả hai dùng `req.user` do `requireAuth` nạp từ DB ở đầu request. Tài khoản bị khóa hoặc xóa đã dừng tại `requireAuth` với 401. Tài khoản active thiếu quyền nhận 403. Luồng Order tiếp tục dùng lớp quyền riêng.

### 4.5. Thiết kế Đồng bộ Session UI Frontend (`httpClient.js` & `authContext.jsx`)
- **`FE/my-app/src/services/api/httpClient.js`:**
  - Khi `response.status === 401`, nếu đang ở môi trường trình duyệt (`typeof window !== "undefined"`), phát một sự kiện:
    ```javascript
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    ```
- **`FE/my-app/src/contexts/authContext.jsx`:**
  - Đăng ký lắng nghe sự kiện `"auth:unauthorized"` trong `useEffect`:
    ```javascript
    useEffect(() => {
      const handleUnauthorized = () => {
        setUser(null);
        setLoading(false);
      };
      window.addEventListener("auth:unauthorized", handleUnauthorized);
      return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
    }, []);
    ```
  - Lập tức đưa UI về trạng thái khách vãng lai an toàn (`isAuthenticated = false`, giỏ hàng reset/ẩn), không gây giật cục giao diện hay reload cứng.
- Các thao tác tạo, thích và trả lời review đi qua `httpRequest`; xử lý thu hồi hủy request `/me` đang chờ để phản hồi cũ không khôi phục phiên.

---

## 5. Danh sách File Thay đổi Dự kiến

| STT | File | Thao tác | Mục đích kỹ thuật |
| :--- | :--- | :--- | :--- |
| 1 | `GLOSSARY.md` | Đã cập nhật | Bổ sung thuật ngữ chuẩn: `Account Status` và `Session Revocation`. |
| 2 | `docs/interviews/2026-11-20-chan-tai-khoan-khoa-interview.md` | Đã cập nhật | Ghi nhận quyết định chính thức Q1–Q5 sau phỏng vấn. |
| 3 | `docs/task-plans/2026-11-20-chan-tai-khoan-khoa-plan.md` | Tạo mới | Kế hoạch chi tiết, tiêu chí nghiệm thu và ma trận kiểm thử baseline. |
| 4 | `BE/src/middleware/requireAuth.js` | Chỉnh sửa | Truy vấn DB xác thực `status === 1`, xóa cookie `auth_token` khi user không hợp lệ, gán `req.user = { id, role, status }`. Chuẩn hóa arrow function và export cuối file theo AGENTS.md 3.2. |
| 5 | `BE/src/services/client/authService.js` | Chỉnh sửa | `loginService` select `status` và chặn `status !== 1` (trả 401 `Invalid credentials`); `meService` select `status` và chặn `status !== 1`. |
| 6 | `BE/src/middleware/requireAdmin.js` | Chỉnh sửa | Tái sử dụng `req.user`, kiểm tra `status === 1` và `role === 'admin'`, loại bỏ truy vấn DB trùng lặp. |
| 7 | `FE/my-app/src/services/api/httpClient.js` | Chỉnh sửa | Dispatch `CustomEvent("auth:unauthorized")` khi gặp HTTP 401. |
| 8 | `FE/my-app/src/contexts/authContext.jsx` | Chỉnh sửa | Lắng nghe `auth:unauthorized` để dọn dẹp state `user` và `isAuthenticated`. |
| 9 | `BE/tests/auth/accountStatusGuard.test.js` | Tạo mới | Kiểm thử ba AC qua route Express thật với schema MySQL tạm, theo mẫu test Catalog và Order của repo. |
| 10 | `docs/code-changes/2026-11-20-chan-tai-khoan-khoa-change-log.md` | Tạo sau khi code | Báo cáo thay đổi chi tiết sau khi hoàn tất kiểm thử theo AGENTS.md 4.1. |
| 11 | `BE/src/middleware/requireCatalogOperator.js` | Chỉnh sửa | Thực hiện Q4 và giữ quyền Catalog của admin, staff. |
| 12 | `FE/my-app/src/components/comments/commentSection.jsx`, `FE/my-app/src/hooks/client/useProductReviews.js`, `FE/my-app/src/services/api/client/reviewService.js` | Sửa và thêm | Đi qua hook và service dùng HTTP client chung để thao tác ghi review cũng nhận xử lý 401. |
| 13 | `BE/package.json`, `BE/tests/catalogAuthGuard.test.js`, `BE/tests/orderStatusApproval.test.js` | Chỉnh sửa | Chạy cả test trong thư mục con và cập nhật kỳ vọng 401 cho tài khoản bị khóa hoặc xóa. |
| 14 | `FE/my-app/tests/authSession.test.mjs` | Tạo mới | Kiểm thử UI khi nhận 401 và khi phản hồi phiên đến muộn. |
| 15 | `FE/my-app/src/hooks/client/useCart.js`, `FE/my-app/src/hooks/client/useCheckout.js`, `FE/my-app/src/services/api/client/cartService.js`, `FE/my-app/src/components/header.jsx` | Chỉnh sửa | Ẩn dữ liệu giỏ, badge và checkout khi phiên kết thúc. Hủy các request giỏ cũ để bảo vệ trạng thái UI. |
| 16 | `FE/my-app/src/services/api/client/orderService.js`, `FE/my-app/src/pages/client/orderSuccess.jsx` | Chỉnh sửa | Bỏ kết quả đặt đơn đến muộn sau khi mất phiên. Chỉ chủ đơn hiện tại xem được xác nhận từ router state. |

---

## 6. Các Bước Triển khai Tuần tự (Implementation Steps)

### Giai đoạn 1: Triển khai Backend (Auth Boundary & Services)
- **Bước 1.1:** Cập nhật `BE/src/services/client/authService.js`:
  - Sửa `loginService`: thêm `status` vào attributes, thêm điều kiện `if (user.status !== 1) throw error(401)`.
  - Sửa `meService`: thêm `status` vào attributes, kiểm tra `user.status === 1`.
- **Bước 1.2:** Cập nhật `BE/src/middleware/requireAuth.js`:
  - Import `User = require("../models/userModel")`.
  - Định nghĩa `COOKIE_CLEAR_OPTIONS`.
  - Thêm truy vấn `User.findByPk(payload.userId, { attributes: ["id", "role", "status"] })`.
  - Xóa cookie và trả 401 nếu user không tồn tại hoặc `status !== 1`.
  - Gắn `req.user = { id: user.id, role: user.role, status: user.status }`.
  - Chuyển syntax sang arrow function `const requireAuth = async (...) => ...; module.exports = requireAuth;`.
- **Bước 1.3:** Cập nhật `requireAdmin` và `requireCatalogOperator` theo Q4:
  - Dùng `req.user` và giữ tập vai trò cho phép đã định nghĩa tại mỗi middleware.

### Giai đoạn 2: Triển khai Frontend (Session Sync)
- **Bước 2.1:** Cập nhật `FE/my-app/src/services/api/httpClient.js`:
  - Khi `!response.ok && response.status === 401`, bắn event `auth:unauthorized`.
- **Bước 2.2:** Cập nhật `FE/my-app/src/contexts/authContext.jsx`:
  - Thêm listener cho `auth:unauthorized` để dọn phiên, hủy request `/me` đang chờ.
- **Bước 2.3:** Dùng HTTP client chung cho thao tác ghi review.

### Giai đoạn 3: Kiểm thử Tự động & Nghiệm thu
- **Bước 3.1:** Viết kịch bản kiểm thử tự động tại `BE/tests/auth/accountStatusGuard.test.js` kiểm chứng đầy đủ 3 tiêu chí:
  - Kiểm chứng AC-01: Login tài khoản `status = 0` -> 401 Invalid credentials, không có cookie `Set-Cookie`.
  - Kiểm chứng AC-02: Đăng nhập lấy JWT, sau đó đổi `status = 0` hoặc xóa user khỏi DB. Gọi `/api/auth/me`, `/api/cart/items`, `/api/orders`, `/api/users/profile`, `/api/reviews`. Xác nhận 401, cookie hết hạn và dữ liệu nghiệp vụ không đổi.
  - Kiểm chứng AC-03: User active `status = 1` (`admin`, `staff`, `customer`) -> Gọi các API bình thường, không bị bypass hoặc chặn nhầm.
- **Bước 3.2:** Chạy kiểm thử tự động và ghi nhận kết quả thực tế.
- **Bước 3.3:** Chạy `node --check` cho các file JS Backend đã sửa và chạy lint, test, build Frontend theo script hiện có. Frontend chưa có script typecheck riêng.

### Giai đoạn 4: Tài liệu & Bàn giao
- **Bước 4.1:** Kiểm tra `git status --short` và `git diff --check`.
- **Bước 4.2:** Tạo tài liệu `docs/code-changes/2026-11-20-chan-tai-khoan-khoa-change-log.md` tuân thủ đủ 6 mục theo AGENTS.md Mục 4.
- **Bước 4.3:** Báo cáo bàn giao cho người dùng.

---

## 7. Phân tích Rủi ro & Kế hoạch Phòng ngừa (Risk Management)

| Rủi ro tiềm ẩn | Mức độ | Biện pháp phòng ngừa & Xử lý |
| :--- | :---: | :--- |
| **Gia tăng tải DB khi mọi API auth đều query user** | Thấp | Truy vấn theo khóa chính và chỉ lấy `id`, `role`, `status`. Admin và Catalog dùng lại kết quả trong request. Các route chỉ đi qua `requireAuth` có thêm một truy vấn so với trước. |
| **Mất đồng bộ Cookie options giữa set và clear** | Trung bình | Định nghĩa cấu hình cookie thống nhất (`httpOnly`, `secure: isProd`, `sameSite: isProd ? "none" : "lax"`) trong `requireAuth.js` để lệnh `res.clearCookie` xóa đúng cookie trên mọi trình duyệt. |
| **Vòng lặp sự kiện `auth:unauthorized` ở Frontend** | Thấp | Sự kiện `auth:unauthorized` chỉ đơn thuần set state `user = null`, không tự động gọi thêm bất kỳ API nào, ngăn ngừa 100% nguy cơ loop request. |
| **Lỗi DB kết nối trong middleware** | Thấp | Bao bọc toàn bộ logic trong khối `try/catch`. Nếu DB xảy ra sự cố đột xuất, chuyển tiếp lỗi sang `next(error)` để `errorHandler.js` trả về HTTP 500 chuẩn, không làm lộ stack trace hay cấu trúc database. |

---

## 8. Ma trận Kiểm thử Nghiệm thu (Verification Matrix)

| Mã Case | Tiêu chí | Mục tiêu kiểm tra | Dữ liệu đầu vào | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | `FUNC-MISS-003-AC-01` | Đăng nhập tài khoản bị khóa | Email tài khoản có `status = 0`, mật khẩu đúng | Trả về HTTP 401, message: `"Invalid credentials"`. Header không có `Set-Cookie` cấp `auth_token`. |
| **TC-02** | `FUNC-MISS-003-AC-01` | Đăng nhập tài khoản không tồn tại | Email không có trong hệ thống | Trả về HTTP 401, message: `"Invalid credentials"`. |
| **TC-03** | `FUNC-MISS-003-AC-02` | Gọi `GET /api/auth/me` với JWT của user bị khóa | Cookie `auth_token` hợp lệ của user có `status = 0` | Trả về HTTP 401, gửi `Set-Cookie` với `auth_token` rỗng và hạn trong quá khứ. |
| **TC-04** | `FUNC-MISS-003-AC-02` | Gọi `POST /api/cart/items` với JWT của user bị khóa | Cookie `auth_token` hợp lệ của user có `status = 0`, body thêm item | Trả về HTTP 401, dữ liệu giỏ hàng giữ nguyên, cookie bị xóa. |
| **TC-05** | `FUNC-MISS-003-AC-02` | Gọi `POST /api/orders` với JWT của user bị khóa | Cookie `auth_token` hợp lệ của user có `status = 0`, body tạo đơn | Trả về HTTP 401; không có Order nào được tạo; stock không bị trừ; cookie bị xóa. |
| **TC-06** | `FUNC-MISS-003-AC-02` | Gọi `PUT /api/users/profile` với JWT của user bị khóa | Cookie `auth_token` hợp lệ của user có `status = 0`, body update profile | Trả về HTTP 401; profile không bị sửa đổi; cookie bị xóa. |
| **TC-07** | `FUNC-MISS-003-AC-02` | Gọi `POST /api/reviews` với JWT của user bị khóa | Cookie `auth_token` hợp lệ của user có `status = 0`, body gửi review | Trả về HTTP 401; không có review mới được ghi; cookie bị xóa. |
| **TC-08** | `FUNC-MISS-003-AC-02` | Gọi API với JWT của user đã bị xóa khỏi DB | Cookie `auth_token` chứa `userId` không còn tồn tại trong bảng `users` | Trả về HTTP 401; cookie bị xóa. |
| **TC-09** | `FUNC-MISS-003-AC-03` | Smoke test customer active (`status = 1`) | Đăng nhập, xem me, thao tác giỏ hàng, xem đơn hàng | HTTP 200 thành công; hoạt động bình thường. |
| **TC-10** | `FUNC-MISS-003-AC-03` | Smoke test admin/staff active (`status = 1`) | Đăng nhập, truy cập Catalog, Order và duyệt review | Cả hai nhận 200 ở Catalog và Order. Chỉ admin duyệt được review, staff nhận 403. |

---

## 9. Quy định Kiểm tra Trước khi Bàn giao (Pre-delivery Checklist)

- [x] Đã cập nhật [GLOSSARY.md](../../GLOSSARY.md) đúng format, không chứa chi tiết cài đặt.
- [x] Đã hoàn thành [biên bản phỏng vấn](../interviews/2026-11-20-chan-tai-khoan-khoa-interview.md).
- [x] Mã Backend thay đổi tuân thủ CommonJS và quy tắc hàm/export ở AGENTS.md 3.2.
- [x] Mã Frontend thay đổi tuân thủ ESM và React rules of hooks.
- [x] Schema DB giữ nguyên.
- [x] `node --check` đạt cho các file Backend đã sửa.
- [x] Kiểm thử tự động đạt 10/10 ca trong ma trận.
- [x] Kiểm tra `git status --short` và `git diff --check`.
- [x] Hoàn thành [báo cáo thay đổi](../code-changes/2026-11-20-chan-tai-khoan-khoa-change-log.md) với bằng chứng từng AC.

## 10. Xác nhận phạm vi khi triển khai

Người dùng xác nhận áp dụng Q4 cho Catalog. Hai middleware Admin và Catalog dùng trạng thái và quyền đọc tại đầu mỗi request. Cơ chế kiểm tra có hiệu lực từ request kế tiếp sau thao tác khóa, xóa hoặc đổi role.

Các chỉnh sửa trong ma trận làm rõ endpoint thật, cách Express biểu diễn cookie hết hạn và quyền khác nhau giữa review với Catalog, Order. AC-01 đến AC-03 giữ nguyên. Chi tiết kết quả nằm trong [báo cáo thay đổi](../code-changes/2026-11-20-chan-tai-khoan-khoa-change-log.md).

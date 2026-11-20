# Kế hoạch Triển khai: Chặn tài khoản khóa trên login và API đã xác thực (FUNC-MISS-003)

> **Trạng thái tài liệu:** Kế hoạch baseline sau phỏng vấn (Shared Understanding), tuân thủ [AGENTS.md](../../AGENTS.md) và biên bản phỏng vấn [docs/interviews/2026-11-20-chan-tai-khoan-khoa-login-va-api-interview.md](../interviews/2026-11-20-chan-tai-khoan-khoa-login-va-api-interview.md).
>
> **Căn cứ nghiệp vụ:** [TechStore Master Plan](../../docs/TechStore_Master_Plan.xlsx) (Sheet Tổng quan, Chức năng, Tiêu chí kiểm thử, Lộ trình và phụ thuộc), [GLOSSARY.md](../../GLOSSARY.md).

> **Quyết định trước triển khai (phương án 1):** Đối chiếu với `main` tại `5becacd`, cập nhật hợp đồng login, endpoint ghi giỏ hàng và phạm vi Frontend. Kiểm thử tại HTTP API trên MySQL cô lập và tại giao diện qua AuthProvider với phản hồi HTTP giả lập. Các thay đổi dưới đây làm rõ AC-01 theo quyết định Q2–Q3 và sửa đường dẫn AC-02 theo router hiện hành.

---

## 1. Định vị trong Quy trình Phát triển và Ma trận Phụ thuộc

1. **Phân loại tác vụ:**
   - `FUNC-MISS-003` là tác vụ khắc phục lỗ hổng phân quyền và trạng thái phiên cấp thiết (**P0**) thuộc Nhóm B (*Chưa thực hiện / khắc phục*), Giai đoạn 1 (*Phase 1: Khởi động nền tảng bảo mật & riêng tư*) của MasterPlan.
   - **Độ phức tạp:** Mức **M** (Medium/Scoped), tác vụ bao phủ ranh giới xác thực Backend và cơ chế đồng bộ phiên Frontend.
   - **Phụ thuộc chặn trước (Dependencies):** Không có (Dependencies: *Không*).
   - **Tác vụ liên quan:** `FUNC-DONE-001` (Rà soát đăng nhập JWT cookie và phiên), `FUNC-DONE-005` (Đăng xuất xóa cookie phiên).
   - **Tác vụ bị chặn tiếp theo (Downstream Blocked Tasks):** Là điều kiện tiên quyết bắt buộc của 7 tác vụ tiếp theo trong lộ trình:
     - `FUNC-MISS-011` (Validation kiểu dữ liệu và độ dài cập nhật hồ sơ - Phase 1)
     - `FUNC-MISS-023` (Đồng bộ bằng chứng mua và Variant của review - Phase 2)
     - `FUNC-MISS-025` (Backend đặt lại mật khẩu bằng token một lần - Phase 2)
     - `FUNC-MISS-029` (Thêm role Shipper và giao việc cho đơn Shipping - Phase 2)
     - `FUNC-MISS-034` (API chi tiết Order theo chủ sở hữu và phân trang lịch sử - Phase 2)
     - `FUNC-ENH-011` (Lưu Product yêu thích theo tài khoản - Phase 4)
     - `FUNC-ENH-012` (Khóa/mở tài khoản và gán vai trò có audit - Phase 3)

2. **Lộ trình thực hiện:**
   - **Giai đoạn hiện tại (Plan & Align):** Thiết lập kế hoạch chi tiết, chốt ranh giới kỹ thuật, cấu trúc xử lý lỗi và kịch bản kiểm thử tự động.
   - **Giai đoạn triển khai (TDD Implementation):** Triển khai theo phương pháp Test-Driven Development (Red → Green → Refactor) sử dụng Node.js test runner trên database cô lập.
   - **Giai đoạn đánh giá & bàn giao (Review & Change Log):** Kiểm tra `git diff`, chạy lint/syntax check, đối chiếu 100% tiêu chí nghiệm thu (AC-01, AC-02, AC-03) và lập báo cáo thay đổi theo quy chuẩn của `AGENTS.md`.

---

## 2. Thông tin Tác vụ từ MasterPlan Baseline

| Thuộc tính | Chi tiết từ MasterPlan Baseline |
| :--- | :--- |
| **Task ID** | `FUNC-MISS-003` |
| **Tên task** | Chặn tài khoản khóa trên login và API đã xác thực |
| **Module / Nhóm** | Trạng thái tài khoản / B. Chưa thực hiện / khắc phục |
| **Mức độ ưu tiên** | **P0** (Rào chắn: Quyền và riêng tư / Toàn vẹn dữ liệu) |
| **Độ phức tạp** | **M** (Ước lượng sơ bộ, không phải deadline) |
| **Giai đoạn** | Giai đoạn 1 |
| **Hiện trạng thực tế** | `requireAuth` chỉ verify JWT; `login` và `me` không select status; Order operator mới kiểm active. |
| **Vấn đề / Thiếu sót** | User bị khóa có JWT cũ vẫn có thể gọi Cart, profile, createOrder và review. |
| **Mục tiêu** | `status = 0` hoặc user đã xóa không có quyền truy cập tài nguyên cần đăng nhập. Khóa tài khoản phải có tác dụng với cả phiên đang tồn tại. |
| **Phạm vi công việc** | **Backend:** kiểm user tồn tại/active trong auth boundary; login từ chối status 0; me không trả phiên hợp lệ. **Frontend:** xóa session UI khi 401/403 theo hợp đồng. **Database:** giữ status. |
| **Kết quả đầu ra** | Ma trận token hợp lệ nhưng user không còn quyền; bộ test tự động trên test database cô lập. |

### Tiêu chí Nghiệm thu Chi tiết (Acceptance Criteria)

| Mã AC | Tên tiêu chí | Điều kiện thử nghiệm | Dữ liệu kiểm thử | Các bước kiểm tra | Kết quả mong đợi bắt buộc |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`FUNC-MISS-003-AC-01`** | Tài khoản khóa không đăng nhập được | Môi trường thử nghiệm cô lập; dữ liệu giả; không dùng DB cửa hàng | `status = 0`, password đúng hoặc sai | Gọi `POST /api/auth/login` | Mật khẩu đúng trả **403 `ACCOUNT_LOCKED`**. Mật khẩu sai vẫn trả **401 `Invalid credentials`**. Cả hai trường hợp không cấp cookie phiên mới. |
| **`FUNC-MISS-003-AC-02`** | JWT cũ bị từ chối khi tài khoản khóa/xóa | Môi trường thử nghiệm cô lập; dữ liệu giả; không dùng DB cửa hàng | User active nhận JWT rồi chuyển `status = 0` hoặc xóa trong DB thử | Gọi `GET /api/auth/me`, `GET /api/cart`, `POST /api/cart/items`, `POST /api/orders`, `PUT /api/users/profile`, `POST /api/reviews` sau thay đổi | Khóa trả **403 `ACCOUNT_LOCKED`**, đã xóa trả **401 `Unauthorized`**. Xóa cookie và xác minh dữ liệu không đổi. |
| **`FUNC-MISS-003-AC-03`** | User active vẫn dùng được các luồng cũ | Môi trường thử nghiệm cô lập; dữ liệu giả; không dùng DB cửa hàng | `admin`, `staff`, `customer` đang active (`status = 1`) | Chạy smoke login/cart/profile/order và phân quyền | Không giảm kiểm quyền Order hoặc tạo bypass qua role; các luồng nghiệp vụ hoạt động trơn tru |

---

## 3. Phân tích Hiện trạng Mã nguồn & Rủi ro Kỹ thuật

### 3.1. Điểm rò rỉ 1: `requireAuth` chỉ verify chữ ký JWT, không kiểm tra trạng thái DB
Tại `BE/src/middleware/requireAuth.js` (Dòng 9–26):
```javascript
module.exports = function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const secret = process.env.JWT_SECRET;
    const payload = jwt.verify(token, secret);

    // payload dự kiến: { userId }
    req.user = { id: payload.userId };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
```
- **Rủi ro:** `requireAuth` coi mọi token có chữ ký hợp lệ là đáng tin cậy. Khi quản trị viên khóa tài khoản một người dùng (`users.status = 0`), token của người đó vẫn có thời hạn 7 ngày. Toàn bộ các API chỉ gắn `requireAuth` (như giỏ hàng `cartRoutes`, đặt hàng `orderRoutes`, cập nhật hồ sơ `userRoutes:updateProfile`, gửi review `reviewRoutes`) hoàn toàn không phát hiện tài khoản đã bị khóa.

### 3.2. Điểm rò rỉ 2: `loginService` không kiểm tra `user.status`
Tại `BE/src/services/client/authService.js` (Dòng 24–47):
```javascript
const user = await User.findOne({
  where: { email: normalizedEmail },
  attributes: [...USER_PRIVATE_FIELDS, "password"],
});

if (!user) {
  const err = new Error("Invalid credentials");
  err.statusCode = 401;
  throw err;
}

const ok = await bcrypt.compare(password, user.password);
if (!ok) {
  const err = new Error("Invalid credentials");
  err.statusCode = 401;
  throw err;
}

const token = buildJwt({ userId: user.id });
return { token, user: toPrivateUser(user) };
```
- **Rủi ro:** Trường `status` không nằm trong `USER_PRIVATE_FIELDS` nên không được SELECT; `loginService` chỉ so khớp bcrypt password. Nếu tài khoản có `status = 0`, hàm vẫn sinh JWT token và trả về HTTP 200, cấp cookie `auth_token` mới cho người dùng bị khóa.

### 3.3. Điểm rò rỉ 3: `meService` không kiểm tra trạng thái tài khoản
Tại `BE/src/services/client/authService.js` (Dòng 54–65):
```javascript
const meService = async ({ userId }) => {
  const user = await User.findByPk(userId, {
    attributes: [...USER_PRIVATE_FIELDS],
  });

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return toPrivateUser(user);
};
```
- **Rủi ro:** Khi Frontend gọi `/api/auth/me` để khôi phục phiên, `meService` không kiểm tra `status === 1`. Tài khoản bị khóa vẫn lấy được thông tin hồ sơ và UI tiếp tục duy trì trạng thái đăng nhập.

### 3.4. Điểm rủi ro Frontend: Thiếu cơ chế tự động dọn dẹp Session UI khi gặp lỗi phiên
Tại `FE/my-app/src/services/api/httpClient.js` và `FE/my-app/src/contexts/authContext.jsx`:
- `httpClient.js` chỉ throw Error thông thường khi `!response.ok`.
- `AuthContext.jsx` chỉ reset `user = null` khi `refreshMe` (gọi `/api/auth/me`) bị lỗi lúc tải trang. Nếu người dùng đang mở tab giỏ hàng hay hồ sơ và bị admin khóa trong DB, khi họ thực hiện thao tác (gọi API trả về 401 hoặc 403 `ACCOUNT_LOCKED`), UI không tự động đưa trạng thái đăng nhập về `null`.

---

## 4. Thiết kế Kiến trúc Kỹ thuật (Technical Architecture & Seam Design)

```mermaid
flowchart TD
  subgraph Client [Frontend UI]
    UserAction["Thao tác người dùng (Cart / Order / Profile / Me)"]
    HTTP["httpClient.js"]
    AuthCtx["AuthContext.jsx"]
    UserAction --> HTTP
    HTTP -- "401 / 403 (ACCOUNT_LOCKED)" --> Event["Event: auth:unauthorized"]
    Event --> AuthCtx
    AuthCtx --> ResetSession["setUser(null) & Clear UI State"]
  end

  subgraph Backend [Backend API Boundary]
    HTTP --> Middleware["requireAuth.js"]
    Middleware --> VerifyJWT["jwt.verify(token)"]
    VerifyJWT -- "Token hợp lệ" --> CheckDB["User.findByPk(id, ['id', 'role', 'status'])"]
    CheckDB -- "!user (Đã xóa)" --> Reject401["res.clearCookie + 401 Unauthorized"]
    CheckDB -- "status !== 1 (Bị khóa)" --> Reject403["res.clearCookie + 403 Forbidden (ACCOUNT_LOCKED)"]
    CheckDB -- "status === 1 (Active)" --> AttachUser["req.user = { id, role, status } -> next()"]

    AttachUser --> Services["Controllers & Services (Cart, Order, Profile, Me)"]
  end

  subgraph AuthCore [Auth Service (Defense in Depth)]
    LoginReq["POST /api/auth/login"] --> LoginService["authService.loginService"]
    LoginService --> CheckPass["bcrypt.compare"]
    CheckPass -- "Khớp" --> CheckStatus["if (user.status !== 1)"]
    CheckStatus -- "True" --> DenyLogin["Throw 403 (ACCOUNT_LOCKED) - Không sinh JWT"]
    CheckStatus -- "False" --> IssueJWT["Issue JWT & Return 200"]
  end
```

### 4.1. Cải tiến Middleware `BE/src/middleware/requireAuth.js`
- **Nguyên tắc:** Trở thành `Account Status Boundary` chuẩn mực của toàn bộ hệ thống.
- **Hành vi xử lý:**
  1. Đọc cookie `auth_token` từ request. Nếu không có ➡️ trả về `401 Unauthorized`.
  2. `jwt.verify(token, secret)`. Nếu token hết hạn hoặc sai chữ ký ➡️ dọn dẹp cookie và trả về `401 Unauthorized`.
  3. **Truy vấn kiểm tra DB:**
     ```javascript
     const user = await User.findByPk(payload.userId, {
       attributes: ["id", "role", "status"],
     });
     ```
  4. Nếu `!user` (tài khoản đã bị xóa):
     - Gọi `clearAuthCookie(res)`
     - Trả về `res.status(401).json({ success: false, message: "Unauthorized" })`.
  5. Nếu `user.status !== 1` (tài khoản bị khóa):
     - Gọi `clearAuthCookie(res)`
     - Trả về `res.status(403).json({ success: false, code: "ACCOUNT_LOCKED", message: "Tài khoản của bạn đã bị khóa hoặc tạm ngưng." })`.
  6. Nếu hợp lệ (`status === 1`):
     - Gán `req.user = { id: user.id, role: user.role, status: user.status }`.
     - Chuyển tiếp `return next()`.
- **Đồng bộ tùy chọn cookie:** Tái sử dụng cùng tên cookie, path và tùy chọn giữa login, logout, middleware và nhánh lỗi trạng thái tại `meController`.
  ```javascript
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  ```

### 4.2. Củng cố Tầng Nghiệp vụ `BE/src/services/client/authService.js`
- **Trong `loginService`:**
  - Thêm `"status"` vào danh sách `attributes` truy vấn `User.findOne`.
  - Sau khi `bcrypt.compare` thành công:
    ```javascript
    if (user.status !== 1) {
      const err = new Error("Tài khoản của bạn đã bị khóa hoặc tạm ngưng.");
      err.statusCode = 403;
      err.code = "ACCOUNT_LOCKED";
      throw err;
    }
    ```
- **Trong `meService`:**
  - Truy vấn `User.findByPk(userId, { attributes: [...USER_PRIVATE_FIELDS, "status"] })`.
  - Nếu `!user`: throw Error 401 "Unauthorized". `meController` xóa cookie khi lần đọc thứ hai phát hiện tài khoản đã bị xóa hoặc bị khóa.
  - Nếu `user.status !== 1`:
    ```javascript
    const err = new Error("Tài khoản của bạn đã bị khóa hoặc tạm ngưng.");
    err.statusCode = 403;
    err.code = "ACCOUNT_LOCKED";
    throw err;
    ```

### 4.3. Đồng bộ Phiên Frontend (`httpClient.js` & `authContext.jsx`)
- **Trong `FE/my-app/src/services/api/httpClient.js`:**
  - Khi `!response.ok`, kiểm tra nếu `response.status === 401` hoặc (`response.status === 403 && payload?.code === "ACCOUNT_LOCKED"`):
    ```javascript
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized", { detail: payload }));
    }
    ```
- **Trong `FE/my-app/src/contexts/authContext.jsx`:**
  - Hủy lần `refreshMe` đang chờ khi phiên bị xóa, khi có lần đọc mới hoặc khi provider unmount. Bỏ qua kết quả của request đã hủy.
  - Đăng ký `useEffect` lắng nghe sự kiện `"auth:unauthorized"`:
    ```javascript
    useEffect(() => {
      const handleUnauthorized = () => {
        setUser(null);
      };
      window.addEventListener("auth:unauthorized", handleUnauthorized);
      return () => {
        window.removeEventListener("auth:unauthorized", handleUnauthorized);
      };
    }, []);
    ```

---

## 5. Danh sách File Thay đổi và Ranh giới Dự án

### 5.1. File Tạo mới
| Đường dẫn file | Mục đích |
| :--- | :--- |
| `BE/tests/accountStatusAuth.test.js` | Test suite tích hợp tự động bao phủ 3 tiêu chí nghiệm thu AC-01, AC-02, AC-03 |
| `BE/src/utils/authCookie.js` | Dùng chung cấu hình cookie giữa login, logout, `requireAuth` và `meController` |
| `BE/src/utils/assertActiveAccount.js` | Chuẩn hóa lỗi tài khoản không tồn tại hoặc bị khóa |
| `FE/my-app/src/services/api/client/reviewService.js` | Gửi yêu cầu ghi Review qua HTTP client chung |
| `FE/my-app/src/hooks/client/useProductReviews.js` | Điều phối tải, gửi, tải lại và trạng thái lỗi của Review theo ADR Frontend |
| `FE/my-app/tests/authSession.test.mjs` | Kiểm tra mất phiên, lỗi vai trò, phản hồi đến muộn và thao tác Review |

### 5.2. File Chỉnh sửa
| Đường dẫn file | Thành phần thay đổi | Mục đích |
| :--- | :--- | :--- |
| `BE/src/middleware/requireAuth.js` | Hàm `requireAuth` | Truy vấn `findByPk`, kiểm tra `status === 1`, xóa cookie và trả 401/403 |
| `BE/src/services/client/authService.js` | Hàm `loginService` và `meService` | Kiểm tra `status === 1`, chặn cấp token và chặn trả phiên khi bị khóa |
| `BE/src/controllers/client/authController.js` | Login, logout và me | Dùng chung cấu hình cookie và xóa cookie nếu lần đọc tại me phát hiện phiên đã mất hiệu lực |
| `BE/tests/catalogAuthGuard.test.js`, `BE/tests/userPrivacy.test.js` | Kỳ vọng lỗi xác thực | Cập nhật kỳ vọng cho tài khoản khóa hoặc đã xóa, giữ các kỳ vọng phân quyền theo vai trò |
| `FE/my-app/src/services/api/httpClient.js` | Hàm `httpRequest` | Phát sự kiện toàn cục `"auth:unauthorized"` khi gặp 401/403 Account Locked |
| `FE/my-app/src/contexts/authContext.jsx` | Component `AuthProvider` | Lắng nghe `"auth:unauthorized"` và reset state `user = null` |
| `FE/my-app/src/components/comments/commentSection.jsx` | Tạo review, thích, trả lời | Dùng Review API service để lỗi mất phiên đến AuthProvider, giữ multipart khi gửi media |
| `FE/my-app/src/hooks/client/useCart.js`, `FE/my-app/src/components/header.jsx`, `FE/my-app/src/services/api/client/cartService.js` | Trạng thái giỏ và badge | Hủy request cũ và ẩn dữ liệu giỏ khi phiên kết thúc, theo kết quả review |
| `FE/my-app/src/hooks/client/useCheckout.js`, `FE/my-app/src/pages/client/orderSuccess.jsx`, `FE/my-app/src/services/api/client/orderService.js` | Checkout và xác nhận đơn | Chỉ hiển thị dữ liệu điều hướng cho chủ phiên hiện tại và bỏ qua phản hồi đặt hàng đến sau mất phiên |

### 5.3. Ranh giới không can thiệp (Out of Scope)
- **Database Schema:** Không thay đổi cấu trúc bảng; giữ nguyên kiểu `status: TINYINT` của bảng `users`.
- **Giao diện Quản trị User:** Chưa xây dựng màn hình khóa/mở tài khoản Admin (thuộc task `FUNC-ENH-012` ở Phase 3).
- **Các middleware chuyên biệt khác:** `requireCatalogOperator`, `requireActiveAdmin` và `orderStatusService.loadActor` đã tự kiểm tra `status === 1`, giữ nguyên để bảo đảm tính tương thích.
- **Hiệu lực:** Kiểm tra tại thời điểm request đọc trạng thái tài khoản. Request đã vượt qua lần đọc, kể cả login đang chờ xác thực mật khẩu, có thể hoàn tất. JWT còn hạn và còn được giữ ở client có thể dùng lại nếu tài khoản được mở khóa. Thu hồi vĩnh viễn các JWT cũ cần thiết kế phiên riêng.

---

## 6. Kế hoạch Triển khai theo Phương pháp TDD (Red → Green → Refactor)

### Bước 1: Khởi tạo Test Suite Tích hợp `BE/tests/accountStatusAuth.test.js` (RED)
- Thiết lập database test cô lập `techstore_account_status_test_${process.pid}`.
- Tạo dữ liệu giả với 6 actors:
  - Customer Active (`status = 1`), Customer Locked (`status = 0`)
  - Staff Active (`status = 1`), Staff Locked (`status = 0`)
  - Admin Active (`status = 1`), Admin Locked (`status = 0`)
- Viết 3 nhóm test case:
  1. **Test AC-01:** Login tài khoản `status = 0` bằng đúng password ➡️ Kỳ vọng nhận 403 `ACCOUNT_LOCKED`, không có `Set-Cookie` `auth_token`. Hiện tại `loginService` chưa kiểm tra ➡️ **Test báo FAIL (RED)**.
  2. **Test AC-02:** User active nhận JWT, cập nhật DB thành `status = 0` (hoặc xóa DB). Gọi `me`, `cart`, `orders`, `profile`, `reviews` ➡️ Kỳ vọng bị từ chối với 401/403, không có mutation, có header clear cookie. Hiện tại `requireAuth` không check DB ➡️ **Test báo FAIL (RED)**.
  3. **Test AC-03:** User active gọi các luồng bình thường ➡️ Kỳ vọng thành công, phân quyền role không bị bypass.

### Bước 2: Cập nhật `BE/src/services/client/authService.js` (GREEN 1: Login & Me)
- Cập nhật `loginService`: thêm `status` vào attributes, kiểm tra `user.status !== 1` thì throw 403 `ACCOUNT_LOCKED`.
- Cập nhật `meService`: kiểm tra `user.status !== 1` thì throw 403 `ACCOUNT_LOCKED`.
- Chạy lại test ➡️ Nhóm Test AC-01 chuyển sang **PASS (GREEN)**.

### Bước 3: Cập nhật `BE/src/middleware/requireAuth.js` (GREEN 2: Immediate Invalidation)
- Chuyển `requireAuth` thành async function.
- Sau `jwt.verify`, truy vấn `User.findByPk(payload.userId, { attributes: ["id", "role", "status"] })`.
- Xử lý xóa cookie và trả 401 (nếu `!user`) hoặc 403 (nếu `status !== 1`).
- Nếu hợp lệ, gắn `req.user = { id: user.id, role: user.role, status: user.status }`.
- Chạy lại test ➡️ Nhóm Test AC-02 và AC-03 chuyển sang **PASS (GREEN)**.

### Bước 4: Cập nhật Frontend UI Session Cleanup (GREEN 3)
- Cập nhật `FE/my-app/src/services/api/httpClient.js`: Dispatch event `"auth:unauthorized"`.
- Cập nhật `FE/my-app/src/contexts/authContext.jsx`: Lắng nghe event và dọn dẹp `user = null`.
- Chạy `npm test`, `npm run lint` và `npm run build` tại `FE/my-app/`.

### Bước 5: Refactor và Chạy Toàn bộ Kiểm tra Hệ thống
- Đảm bảo tuân thủ chuẩn CommonJS Backend và ES Modules Frontend.
- Kiểm tra cú pháp bằng `node --check`.
- Chạy toàn bộ regression test suite của Backend: `node --test tests/*.test.js`.

---

## 7. Rủi ro, Kịch bản Biên (Edge Cases) và Biện pháp Phòng ngừa

| STT | Tình huống biên (Edge Case) | Rủi ro tiềm ẩn | Biện pháp phòng ngừa kỹ thuật |
| :--- | :--- | :--- | :--- |
| 1 | Người dùng bị xóa cứng (hard delete) khỏi DB nhưng vẫn còn token cũ | `findByPk` trả về `null`, nếu đọc `user.status` sẽ gây crash `TypeError: Cannot read properties of null` (HTTP 500) | Kiểm tra `if (!user)` trước ➡️ dọn dẹp cookie và trả về `401 Unauthorized` ("Tài khoản không tồn tại"). |
| 2 | Khách hàng thường (role customer) truy cập API admin bị trả 403 | Frontend nhận 403 và hiểu nhầm là tài khoản bị khóa, tự động đăng xuất người dùng | `httpClient.js` chỉ phát sự kiện đăng xuất khi `response.status === 401` HOẶC (`response.status === 403 && payload?.code === "ACCOUNT_LOCKED"`). Lỗi 403 do Role sẽ không có code này nên không bị logout. |
| 3 | Lỗi kết nối cơ sở dữ liệu tạm thời khi `requireAuth` truy vấn `findByPk` | `requireAuth` nuốt lỗi hoặc trả về 401 sai bản chất | Bọc truy vấn trong `try/catch`. Nếu lỗi là database connection error, chuyển tiếp qua `next(error)` để `errorHandler.js` ghi nhận và trả về HTTP 500 hợp thức. |
| 4 | Cookie `auth_token` bị xóa không sạch trên trình duyệt | Client gửi tiếp token rác ở các request sau | Thiết lập đúng các tùy chọn `res.clearCookie("auth_token", { httpOnly: true, secure, sameSite })` khớp chính xác với tùy chọn khi cấp ở `loginController`. |
| 5 | Tác động hiệu năng khi mọi authenticated request đều truy vấn `findByPk` | Thêm một lượt đọc DB cho request đã xác thực | Chỉ SELECT các trường `id`, `role`, `status` qua khóa chính. Chưa có số đo độ trễ. |

---

## 8. Kế hoạch Kiểm tra Chất lượng (Quality Assurance Checklist theo AGENTS.md)

Trước khi nghiệm thu bàn giao:
- [ ] **Kiểm tra ranh giới:** Không sửa đổi file ngoài phạm vi task; không thay đổi schema database; cấu trúc API hợp đồng giữ nguyên.
- [ ] **Kiểm tra chuẩn mã nguồn:**
  - Backend CommonJS (`require` / `module.exports`); hàm viết arrow function tách rời export; thụt lề 2 spaces; dấu nháy kép `"`; không dùng `var`.
  - Frontend ES Modules (`import` / `export`); component và hook chuẩn React 19.
- [ ] **Kiểm tra cú pháp:** Chạy `node --check` cho toàn bộ các file JS mới và file JS được chỉnh sửa.
- [ ] **Kiểm tra kiểm thử tự động:** Toàn bộ test suite `BE/tests/accountStatusAuth.test.js` chạy đạt 100% Pass trên database cô lập.
- [ ] **Kiểm tra kiểm thử hồi quy (Regression):** Toàn bộ các test suite hiện có của Backend (`userPrivacy.test.js`, `catalogAuthGuard.test.js`...) tiếp tục Pass 100%.
- [ ] **Đối chiếu Tiêu chí Nghiệm thu:**
  - `FUNC-MISS-003-AC-01`: Đạt (Có bằng chứng test POST login trả 403 `ACCOUNT_LOCKED`, không cấp cookie).
  - `FUNC-MISS-003-AC-02`: Đạt (Có bằng chứng test JWT cũ bị chặn trước mutation trên me, cart, order, profile, review).
  - `FUNC-MISS-003-AC-03`: Đạt (Có bằng chứng user active vận hành thông suốt không bị ảnh hưởng).
- [ ] **Tài liệu bàn giao:** Lập báo cáo thay đổi `docs/code-changes/2026-11-20-chan-tai-khoan-khoa-login-va-api-change-log.md` ghi nhận kết quả thực tế.

---

## 9. Đối chiếu tính khả thi trước triển khai

- **Khả thi về Backend:** `requireAuth` và `authService` nằm trong vùng kiểm soát trực tiếp của dự án; việc thêm truy vấn `findByPk` theo id và kiểm tra `user.status === 1` hoàn toàn tương thích với các middleware hiện có (`requireCatalogOperator`, `requireActiveAdmin`).
- **Khả thi về Frontend:** Cơ chế CustomEvent `"auth:unauthorized"` là kỹ thuật native chuẩn của trình duyệt, không đòi hỏi thêm bất kỳ thư viện bên thứ ba nào, hoàn toàn tương thích với React 19 và Vite.
- **Khả thi về Môi trường Test:** Dự án đã có sẵn hạ tầng chạy Node.js test runner kết hợp Sequelize và MySQL cục bộ, đã được kiểm chứng hoạt động ổn định qua `BE/tests/userPrivacy.test.js` và `BE/tests/catalogAuthGuard.test.js`.

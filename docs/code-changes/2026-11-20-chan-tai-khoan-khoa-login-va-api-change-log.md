# Thay đổi FUNC-MISS-003

Ngày tạo: 2026-11-20. Baseline: `5becacd4812eccbf83f9938bb81f35214c900d4f`.

[Kế hoạch](../task-plans/2026-11-20-chan-tai-khoan-khoa-login-va-api-plan.md) · [Biên bản phỏng vấn](../interviews/2026-11-20-chan-tai-khoan-khoa-login-va-api-interview.md) · [Code review](../code-reviews/2026-11-20-chan-tai-khoan-khoa-login-va-api-code-review.md)

## Luồng hoạt động

Login kiểm tra mật khẩu trước, rồi kiểm tra trạng thái tài khoản. Tài khoản khóa nhận `403 ACCOUNT_LOCKED` trước bước ký JWT, còn mật khẩu sai vẫn nhận `401 Invalid credentials`. Trên API đã xác thực, middleware xác minh JWT, đọc trạng thái hiện tại từ DB và dọn cookie khi JWT không hợp lệ, tài khoản đã bị xóa hoặc tài khoản bị khóa. Lỗi truy vấn chuyển tới error handler. Các guard phân quyền và serializer tiếp tục xử lý quyền truy cập và dữ liệu trả về.

HTTP client báo mất phiên khi nhận `401` hoặc `403 ACCOUNT_LOCKED`. AuthProvider xóa người dùng hiện tại và hủy lần đọc hồ sơ đang chờ. Giỏ, Checkout và trang xác nhận đơn kiểm tra chủ dữ liệu đang hiển thị. Review dùng cùng HTTP client cho các thao tác ghi và tiếp tục gửi `FormData` khi có media.

## Tệp thay đổi

| Tệp | Thay đổi và tác động |
|---|---|
| [`BE/src/middleware/requireAuth.js`](../../BE/src/middleware/requireAuth.js) | Từ xác minh token sang xác minh token và đọc `id`, `role`, `status` theo khóa chính. ID trong token không hợp lệ hoặc tài khoản đã xóa trả 401. Tài khoản khóa trả 403 kèm mã lỗi. Tài khoản active đi tiếp với danh tính đọc từ DB. |
| [`BE/src/services/client/authService.js`](../../BE/src/services/client/authService.js) | Login đọc thêm `status` và kiểm tra sau bcrypt. Me đọc thêm `status` để kiểm tra lại khi tải hồ sơ. Cả hai tiếp tục trả hồ sơ qua serializer hiện tại. |
| [`BE/src/controllers/client/authController.js`](../../BE/src/controllers/client/authController.js) | Login/logout dùng chung tùy chọn cookie. Me cũng xóa cookie nếu lần đọc thứ hai phát hiện trạng thái đã đổi sau middleware. |
| [`BE/src/utils/assertActiveAccount.js`](../../BE/src/utils/assertActiveAccount.js) | Thêm kiểm tra dùng chung khi bản ghi vắng mặt hoặc có `status !== 1`. Middleware và service dùng cùng HTTP status, mã lỗi và thông báo. |
| [`BE/src/utils/authCookie.js`](../../BE/src/utils/authCookie.js) | Thêm tên cookie và tùy chọn dùng chung cho tạo và xóa, bao gồm `Path=/`, `HttpOnly`, `SameSite` và `Secure` theo môi trường. |
| [`BE/tests/accountStatusAuth.test.js`](../../BE/tests/accountStatusAuth.test.js) | Thêm test HTTP trên schema MySQL riêng cho login, JWT cũ sau khóa/xóa, cookie hết hạn, dữ liệu ghi giữ nguyên và quyền của tài khoản active. Sử dụng `POST /api/cart/items` và gửi Review theo multipart. |
| [`BE/tests/catalogAuthGuard.test.js`](../../BE/tests/catalogAuthGuard.test.js) | Sửa kỳ vọng cho tài khoản khóa và tài khoản đã xóa theo tầng xác thực mới. Giữ các ca customer thiếu quyền, DB lỗi và chặn trước Multer. |
| [`BE/tests/userPrivacy.test.js`](../../BE/tests/userPrivacy.test.js) | Sửa kỳ vọng thông báo và mã lỗi của admin bị khóa. Giữ kiểm thử quyền admin và các ca kiểm tra payload an toàn. |
| [`FE/my-app/src/services/api/httpClient.js`](../../FE/my-app/src/services/api/httpClient.js) | Phát tín hiệu mất phiên trên `401` hoặc `403 ACCOUNT_LOCKED` của request còn hiệu lực. Caller vẫn nhận lỗi với `status` và `payload`. |
| [`FE/my-app/src/contexts/authContext.jsx`](../../FE/my-app/src/contexts/authContext.jsx) | Nghe tín hiệu để xóa phiên. Hủy `refreshMe` khi phiên kết thúc, có lần đọc mới hoặc provider unmount, để kết quả cũ không khôi phục phiên. |
| [`FE/my-app/src/components/comments/commentSection.jsx`](../../FE/my-app/src/components/comments/commentSection.jsx) | Chuyển điều phối API sang hook, giữ phần trình bày, xem thêm và thử lại. Lỗi xác thực từ thao tác Review đi qua HTTP client. |
| [`FE/my-app/src/hooks/client/useProductReviews.js`](../../FE/my-app/src/hooks/client/useProductReviews.js) | Thêm luồng tải danh sách, gửi, thích và trả lời Review. Bỏ qua phản hồi đọc khi rời sản phẩm và phản hồi ghi khi sản phẩm hoặc tài khoản thay đổi. |
| [`FE/my-app/src/services/api/client/reviewService.js`](../../FE/my-app/src/services/api/client/reviewService.js) | Thêm API service Review dựa trên HTTP client hiện có. Gửi `FormData` cho tạo review, JSON cho trả lời và giữ chế độ credentials cũ cho GET công khai. |
| [`FE/my-app/src/hooks/client/useCart.js`](../../FE/my-app/src/hooks/client/useCart.js) | Gắn trạng thái giỏ và thao tác cập nhật với chủ phiên. Ẩn giỏ cũ khi mất/đổi phiên và hủy request liên quan. Chuyển ID chủ giỏ cùng dữ liệu điều hướng sang Checkout. |
| [`FE/my-app/src/components/header.jsx`](../../FE/my-app/src/components/header.jsx) | Gắn số lượng badge với ID chủ giỏ và hủy request badge khi phiên hoặc đường dẫn thay đổi. |
| [`FE/my-app/src/services/api/client/cartService.js`](../../FE/my-app/src/services/api/client/cartService.js) | Cho phép truyền `AbortSignal` khi đọc, đổi số lượng hoặc xóa mục trong giỏ. Giữ phương thức và endpoint hiện tại. |
| [`FE/my-app/src/hooks/client/useCheckout.js`](../../FE/my-app/src/hooks/client/useCheckout.js) | Chỉ hiển thị giỏ Checkout của tài khoản đang hoạt động. Quay về giỏ khi mất phiên và bỏ qua kết quả POST đến muộn. |
| [`FE/my-app/src/services/api/client/orderService.js`](../../FE/my-app/src/services/api/client/orderService.js) | Cho phép truyền `AbortSignal` khi tạo đơn để Checkout có thể dừng chờ phản hồi. |
| [`FE/my-app/src/pages/client/orderSuccess.jsx`](../../FE/my-app/src/pages/client/orderSuccess.jsx) | Chỉ hiển thị đơn từ dữ liệu điều hướng khi người dùng hiện tại là chủ đơn. |
| [`FE/my-app/tests/authSession.test.mjs`](../../FE/my-app/tests/authSession.test.mjs) | Thêm kiểm thử React qua HTTP giả lập cho phân biệt 403 theo vai trò, mất phiên do Review, multipart/thử lại, giỏ cũ sau mất hoặc đổi phiên, Checkout và quyền xem xác nhận đơn. |
| [Kế hoạch](../task-plans/2026-11-20-chan-tai-khoan-khoa-login-va-api-plan.md) | Ghi quyết định phương án 1 trước triển khai. Làm rõ AC-01, sửa endpoint AC-02 và bổ sung điểm tích hợp Frontend được phát hiện khi đối chiếu và review. |
| [Code review](../code-reviews/2026-11-20-chan-tai-khoan-khoa-login-va-api-code-review.md) | Ghi nhận hai lượt rà soát Standards và Spec, các phát hiện và phần xử lý. |

## Đối chiếu nghiệm thu

| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| AC-01 | Đạt | Khách, staff và admin bị khóa với mật khẩu đúng nhận `403 ACCOUNT_LOCKED`, không có cookie mới. Sai mật khẩu hoặc email không tồn tại nhận cùng lỗi 401 chung. |
| AC-02 | Đạt | Cookie lấy từ login thật bị từ chối khi thay đổi DB sang khóa hoặc xóa. Có header cookie hết hạn. Test xác minh giỏ, đơn, kho, hồ sơ và Review. Frontend bỏ qua phản hồi phiên và giỏ cũ. |
| AC-03 | Đạt | Khách active vẫn đăng nhập, đọc phiên, cập nhật hồ sơ, mua hàng và gửi Review. Admin/staff vẫn truy cập Order/Catalog, quyền kiểm duyệt Review vẫn chỉ dành cho admin. Bộ hồi quy User Privacy đạt. |

## Kiểm tra và giới hạn

- Quan sát RED trên mã gốc: login và `/me` của tài khoản khóa trả 200. Test Frontend xác nhận `401` và `403 ACCOUNT_LOCKED` chưa xóa UI trước khi sửa.
- Backend `npm test` đạt 192/192. Chạy riêng test tài khoản với `NODE_ENV=production` đạt 11/11, gồm kiểm tra thuộc tính cookie qua HTTP.
- Frontend `npm test` đạt 32/32. ESLint và Vite build thành công. Vite báo cảnh báo kích thước một chunk.
- `node --check` đạt cho các tệp Backend thêm/sửa. `git diff --check` theo phạm vi task không báo lỗi. Lệnh toàn worktree báo dòng trống cuối `GLOSSARY.md` thuộc thay đổi có sẵn từ trước.
- Tích hợp DB chạy trên schema riêng, Frontend chạy trong jsdom. Chưa kiểm tra vòng đời cookie qua trình duyệt HTTPS thật. Trạng thái khóa được áp dụng tại lần đọc DB của request, và JWT còn hạn có thể được chấp nhận lại sau khi mở khóa nếu client còn giữ token.

# FUNC-MISS-003 — Chặn tài khoản khóa

Ngày tạo 2026-11-20. Mốc đối chiếu mã nguồn `465aef9ca3c6e941da780cfee72423c7a3e300ef`.

[Kế hoạch](../task-plans/2026-11-20-chan-tai-khoan-khoa-plan.md) · [Biên bản phỏng vấn](../interviews/2026-11-20-chan-tai-khoan-khoa-interview.md) · [Code review](../code-reviews/2026-11-20-chan-tai-khoan-khoa-code-review.md)

## 1. Hành vi đã thay đổi

Đăng nhập chỉ tạo JWT sau khi mật khẩu đúng và tài khoản còn hoạt động. Mỗi API được bảo vệ xác minh JWT rồi đọc `id`, `role`, `status` hiện tại từ bảng `users`. Request bắt đầu sau khi tài khoản bị khóa hoặc xóa nhận 401 và cookie hết hạn trước khi đến nghiệp vụ. JWT sai hoặc hết hạn cũng nhận 401 và cookie hết hạn. Request thiếu cookie nhận 401. Lỗi truy vấn đi qua error handler trả 500.

Admin và Catalog dùng lại dữ liệu tài khoản đã nạp trong cùng request theo Q4. Admin review yêu cầu `admin`, Catalog chấp nhận `admin` và `staff`, Order vẫn dùng middleware và kiểm tra nghiệp vụ của mình. Kiểm tra theo request giúp áp dụng trạng thái hiện tại ngay lần gọi kế tiếp. Cơ chế dựa trên trạng thái tài khoản và cookie hết hạn, nên không bảo đảm vô hiệu hóa vĩnh viễn một bản sao JWT còn hạn nếu tài khoản sau này được mở khóa.

HTTP client phát `auth:unauthorized` khi nhận 401. AuthContext hủy lần đọc `/me` đang chờ rồi dọn phiên. Trang giỏ, badge và checkout ngừng hiển thị cart của phiên đã hết. Các thao tác cần xác thực trên trang review dùng cùng cơ chế HTTP.

## 2. Chi tiết theo file

| File | Trước và sau thay đổi |
| --- | --- |
| [requireAuth.js](../../BE/src/middleware/requireAuth.js) | Trước chỉ xác minh chữ ký và lấy ID từ JWT. Nay kiểm tra ID, truy vấn theo khóa chính, trả 401 và gửi cookie hết hạn khi phiên không hợp lệ. Khi tài khoản active, nạp `req.user` từ DB để lớp quyền dùng tiếp. |
| [authService.js](../../BE/src/services/client/authService.js) | Trước đăng nhập và `me` bỏ qua trạng thái. Nay đăng nhập lỗi 401 chung sau khi đối chiếu mật khẩu nếu tài khoản bị khóa. `me` kiểm tra trạng thái trước khi trả profile. Các payload thành công giữ nguyên định dạng. |
| [requireAdmin.js](../../BE/src/middleware/requireAdmin.js) | Thay truy vấn lặp bằng kiểm tra role `admin` và trạng thái active từ `req.user`. Mã 403 và thông báo thiếu quyền của review được giữ nguyên. |
| [requireCatalogOperator.js](../../BE/src/middleware/requireCatalogOperator.js) | Theo Q4, dùng `req.user` thay truy vấn riêng cho bốn router Catalog. Hai vai trò active `admin` và `staff` tiếp tục qua được lớp quyền. |
| [httpClient.js](../../FE/my-app/src/services/api/httpClient.js) | Phát sự kiện với HTTP 401 trong trình duyệt nếu request còn hiệu lực. Giữ `status` và `payload` của lỗi cho caller. |
| [authContext.jsx](../../FE/my-app/src/contexts/authContext.jsx) | Dọn phiên khi nhận sự kiện hoặc đăng xuất. Hủy `/me` cũ khi làm mới, thu hồi phiên hoặc unmount để phản hồi cũ không ghi đè người dùng hiện tại. |
| [commentSection.jsx](../../FE/my-app/src/components/comments/commentSection.jsx) | Chuyển tải và cập nhật review từ `fetch` trực tiếp sang hook. Giữ cách trình bày, phân trang cục bộ và các trạng thái UI. |
| [useProductReviews.js](../../FE/my-app/src/hooks/client/useProductReviews.js) | Thêm hook quản lý danh sách, thao tác tạo/thích/trả lời, lỗi và request chờ. Kết quả của sản phẩm cũ không cập nhật danh sách hiện tại. |
| [reviewService.js](../../FE/my-app/src/services/api/client/reviewService.js) | Thêm lớp API cho bốn thao tác review. Dùng HTTP client chung, giữ kiểu FormData cho tạo review, JSON cho trả lời và cách gửi cookie của GET công khai. |
| [cartService.js](../../FE/my-app/src/services/api/client/cartService.js) | Thêm tham số `signal` tùy chọn cho các lời gọi đọc, đổi số lượng và xóa món. Caller hiện có vẫn có thể gọi như trước. |
| [useCart.js](../../FE/my-app/src/hooks/client/useCart.js) | Hủy request giỏ khi phiên đổi hoặc màn hình unmount. Bỏ qua kết quả và rollback đã hủy. Khi thiếu phiên, trả giỏ rỗng ngay cho UI. |
| [header.jsx](../../FE/my-app/src/components/header.jsx) | Ẩn badge ngay khi thiếu xác thực. Hủy request đếm giỏ đang chờ khi effect gắn với phiên hoặc route kết thúc. |
| [useCheckout.js](../../FE/my-app/src/hooks/client/useCheckout.js) | Checkout chờ xác thực trước khi hiển thị dữ liệu giỏ từ router state. Sau khi phiên hết, ẩn nội dung, hủy request tạo đơn đang chờ và quay lại giỏ. |
| [orderService.js](../../FE/my-app/src/services/api/client/orderService.js) | Thêm `signal` tùy chọn cho tạo đơn để checkout hủy request đang chờ khi phiên đổi hoặc unmount. |
| [orderSuccess.jsx](../../FE/my-app/src/pages/client/orderSuccess.jsx) | Trước hiển thị xác nhận từ router state. Nay chờ xác thực và kiểm tra ID chủ đơn trước khi hiển thị. |
| [accountStatusGuard.test.js](../../BE/tests/auth/accountStatusGuard.test.js) | Thêm 10 ca nghiệm thu qua các route thật với dữ liệu giả. Chứng minh cookie hết hạn và xác minh dữ liệu giỏ, đơn, tồn kho, profile, review trên schema tạm. |
| [catalogAuthGuard.test.js](../../BE/tests/catalogAuthGuard.test.js) | Cập nhật các ca bị khóa hoặc xóa sang 401 tại ranh giới xác thực. Ca đổi xuống customer active tiếp tục kỳ vọng 403. |
| [orderStatusApproval.test.js](../../BE/tests/orderStatusApproval.test.js) | Cập nhật tài khoản khóa sang 401. Giữ 403 cho customer active trên route Order quản trị. |
| [BE/package.json](../../BE/package.json) | Dùng tự khám phá test của `node --test` để suite chính chạy cả test nằm trong `tests/auth`. |
| [authSession.test.mjs](../../FE/my-app/tests/authSession.test.mjs) | Thêm test React cho 401, 403, phản hồi `/me` và cart đến muộn, review bị từ chối, checkout mất phiên, kết quả đặt đơn đến muộn và màn xác nhận đơn. |
| [Kế hoạch](../task-plans/2026-11-20-chan-tai-khoan-khoa-plan.md) | Cập nhật phạm vi Q4, endpoint cart, kiểm tra cookie hết hạn và quyền theo từng route. Giữ nguyên ba tiêu chí nghiệm thu. |
| [Biên bản phỏng vấn](../interviews/2026-11-20-chan-tai-khoan-khoa-interview.md) | Đồng bộ danh sách phạm vi với quyết định Q4 được người dùng xác nhận. |
| Báo cáo thay đổi và [code review](../code-reviews/2026-11-20-chan-tai-khoan-khoa-code-review.md) | Ghi diff, kiểm thử, đối chiếu tiêu chí và kết quả rà soát. |

## 3. Quyết định khi triển khai

Bộ test dùng MySQL với schema tạm tạo riêng theo tiến trình, thay cho SQLite hoặc mock DB nêu trong bản kế hoạch ban đầu. Cách này theo harness Catalog và Order hiện có, kiểm được Sequelize, transaction và trạng thái tồn kho với cùng hệ quản trị. Test xác minh header cookie theo hành vi của Express `clearCookie` với `Expires` đã qua và các cờ đúng môi trường.

Phần Frontend được mở rộng tới review và các bề mặt giỏ vì chỉ dọn AuthContext vẫn để một số request hoặc router state hiển thị dữ liệu cũ. Không có migration hoặc chỉnh schema ứng dụng.

## 4. Kiểm thử thực tế

| Kiểm tra | Kết quả |
| --- | --- |
| Backend `npm test` | 188/188 test và subtest đạt, gồm 10 ca nghiệm thu và nhóm test cha. |
| Backend `NODE_ENV=production` với test trạng thái tài khoản | 11/11 test và subtest đạt, bao gồm `Secure`, `SameSite=None` và cookie hết hạn. |
| Backend `node --check` | Đạt trên toàn bộ file JavaScript Backend đã thêm hoặc sửa. |
| Frontend `npm test` | 29/29 test và subtest đạt. |
| Frontend `npm run lint`, `npm run build` | Đạt. Build báo cảnh báo kích thước chunk JavaScript. |
| Git diff và kiểm trạng thái | Đã kiểm tra staged, unstaged và các file mới. |

Hai test Backend cho login và `/me` tái hiện 200 trước khi sửa, sau đó đạt 401. Test React tái hiện phiên vẫn còn sau khi API trả 401 trước khi thêm cơ chế đồng bộ.

## 5. Đối chiếu nghiệm thu

| Tiêu chí | Kết luận | Bằng chứng |
| --- | --- | --- |
| AC-01 | Đạt | TC-01 và TC-02 kiểm 401, thông báo chung và không có cookie phiên mới. |
| AC-02 | Đạt | TC-03 đến TC-08 dùng cookie thật đã cấp trước khi khóa hoặc xóa. Các route bảo vệ trả 401 và cookie hết hạn. Các kiểm tra DB và GET review chứng minh thao tác bị chặn trước khi ghi. |
| AC-03 | Đạt | TC-09 và TC-10 kiểm login, profile, cart, tạo và đọc đơn, quyền Catalog và quyền duyệt review. Suite Catalog và Order xác minh phân quyền và nghiệp vụ cũ. |

## 6. Giới hạn

Đã kiểm ở Node 24 và MySQL cô lập. Frontend chạy với jsdom và xác minh header cookie ở HTTP integration, chưa chạy trên trình duyệt thật hoặc môi trường triển khai. Frontend không có script typecheck riêng. Thay đổi `GLOSSARY.md` và `package-lock.json` gốc đã có trước lượt triển khai. Kết quả ở worktree `fix/func-miss-003`, chưa commit.

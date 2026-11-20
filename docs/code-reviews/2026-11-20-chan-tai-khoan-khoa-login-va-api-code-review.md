# Code review FUNC-MISS-003

Ngày tạo: 2026-11-20. Baseline: `5becacd4812eccbf83f9938bb81f35214c900d4f`.

[Kế hoạch](../task-plans/2026-11-20-chan-tai-khoan-khoa-login-va-api-plan.md) · [Báo cáo thay đổi và danh sách tệp](../code-changes/2026-11-20-chan-tai-khoan-khoa-login-va-api-change-log.md)

Hai lượt rà soát độc lập đọc thay đổi worktree bằng `git diff HEAD -- BE FE` và các tệp mới từ `git status --short`. Phạm vi gồm xác thực Backend, HTTP client, AuthProvider, Cart, Checkout, Review, trang xác nhận đơn và các bài kiểm thử tương ứng. Chuẩn đối chiếu là [AGENTS.md](../../AGENTS.md), [ADR Frontend](../adr/0001-frontend-architecture-and-conventions.md) và kế hoạch đã chốt.

## Standards

| Phát hiện | Xử lý |
|---|---|
| P2. Phản hồi giỏ cũ có thể khôi phục danh sách và badge sau khi phiên kết thúc. | Đã sửa. Dữ liệu giỏ/badge gắn với ID tài khoản. Request cũ bị hủy và kết quả đến muộn bị bỏ qua. Có test mất phiên và chuyển trực tiếp hai tài khoản. |
| P2. Checkout và trang xác nhận đang hiển thị dữ liệu điều hướng khi người dùng mất phiên. Kết quả đặt hàng đến muộn có thể điều hướng lại. | Đã sửa. Kiểm tra chủ dữ liệu và phiên trước khi hiển thị. Hủy chờ kết quả đặt hàng khi rời phiên Checkout. Có test cho cả hai màn hình. |
| P3. Phản hồi ghi Review có thể cập nhật màn hình sau khi đổi sản phẩm hoặc tài khoản. | Đã sửa. Các thao tác ghi có tín hiệu hủy theo vòng đời sản phẩm và tài khoản. Lint, build và test Review đạt trên bản cuối. |

Backend giữ CommonJS, dùng chung cấu hình cookie, chuyển lỗi DB qua error handler và giữ các guard chuyên biệt. Frontend giữ ESM và tái sử dụng HTTP client qua service.

## Spec

| Tiêu chí | Kết quả rà soát |
|---|---|
| AC-01 | Đạt. Tài khoản khóa nhận `403 ACCOUNT_LOCKED` sau khi xác thực đúng mật khẩu. Test bao phủ cả ba vai trò và cookie không được cấp. |
| AC-02 | Đạt. Request dùng JWT cũ bị chặn trước mutation theo trạng thái hiện tại của DB. Test dùng đúng `POST /api/cart/items`, tách khóa/xóa và kiểm tra cookie hết hạn. Phát hiện giỏ cũ hiện lại sau mất hoặc đổi phiên đã được sửa và kiểm thử. |
| AC-03 | Đạt. Bộ hồi quy xác nhận luồng tài khoản active và phân quyền Order/Catalog/Review. Kỳ vọng User Privacy được cập nhật cho lỗi khóa tài khoản. |

## Kết luận

**Đạt.** Backend 192/192, riêng ca trạng thái tài khoản với `NODE_ENV=production` 11/11, Frontend 32/32. ESLint, Vite build và kiểm tra cú pháp Backend đạt. Vite báo cảnh báo kích thước một chunk. Xác minh cookie production dựa trên HTTP header. Trình duyệt HTTPS thực tế và xử lý ở nhiều tab chưa được kiểm chứng.

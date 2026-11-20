# FUNC-MISS-002 — Code review quyền riêng tư tài khoản

- Ngày tạo 2026-11-20.
- [Kế hoạch triển khai](../task-plans/2026-11-20-dong-danh-sach-user-loai-hash-plan.md), [quyết định phỏng vấn](../interviews/2026-11-20-dong-danh-sach-user-loai-hash-interview.md) và [báo cáo thay đổi](../code-changes/2026-11-20-dong-danh-sach-user-loai-hash-change-log.md).
- Chuẩn áp dụng theo [AGENTS.md](../../AGENTS.md).

## Mốc và phạm vi

Diff giữa commit `465aef9ca3c6e941da780cfee72423c7a3e300ef` và working tree trong `BE/`, cộng bốn file mới `createAdminGuard.js`, `requireActiveAdmin.js`, `userSerializer.js` và `userPrivacy.test.js`. Tổng cộng chín file JS được review. Hai reviewer độc lập đọc diff theo hai trục.

## Standards

- Review vòng đầu phát hiện biến thể guard mới được gắn như thuộc tính trên export hàm của `requireAdmin.js`, khác quy ước CommonJS tại mục 3.2.
- Bản sửa tách factory và hai middleware thành các module export trực tiếp. Tùy chọn kiểm tra trạng thái được đặt tên. Reviewer kiểm tra lại cú pháp, diff và khả năng tương thích với cách các tuyến review import middleware cũ.
- **Kết luận Đạt.** Không còn phát hiện cần xử lý.

## Spec

- Review vòng đầu phát hiện responses 403 dùng chung một thông báo dù mục 4.2 mô tả hai thông báo riêng. Bản sửa áp dụng đúng thông báo theo vai trò và trạng thái, đồng thời bổ sung đối chiếu trong integration test.
- **AC-01 Đạt.** Schema test kiểm chứng 401 cho khách, 403 cho customer, staff và admin bị khóa, 200 kèm danh sách theo allowlist cho admin đang hoạt động.
- **AC-02 Đạt.** Register, login, me và update profile xuất user theo allowlist. Test quét toàn bộ JSON và kiểm tra cookie HTTP-only.
- **AC-03 Đạt.** Đăng ký với OTP hợp lệ trả 201, sau đó đăng nhập tài khoản vừa tạo trả 200.
- **Kết luận Đạt.** Reviewer kiểm tra lại bản sửa và không còn phát hiện cần xử lý.

## Bằng chứng và giới hạn

- `npm test` trong `BE` đạt **181/181** sau bản sửa review.
- `node --check` cho chín file JS và kiểm tra whitespace trong phạm vi Backend đạt. `git diff --check` toàn worktree báo dòng trống cuối file có sẵn tại `GLOSSARY.md:99`.
- Reviewer đánh giá mã và test. Kết quả chạy test do agent triển khai ghi nhận trên MySQL với schema riêng. Chưa kiểm thử UI hoặc gửi email thật.

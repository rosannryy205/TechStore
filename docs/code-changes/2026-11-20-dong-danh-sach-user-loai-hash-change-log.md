# FUNC-MISS-002 — Báo cáo thay đổi quyền riêng tư tài khoản

- Ngày tạo 2026-11-20.
- [Kế hoạch triển khai](../task-plans/2026-11-20-dong-danh-sach-user-loai-hash-plan.md) và [quyết định phỏng vấn](../interviews/2026-11-20-dong-danh-sach-user-loai-hash-interview.md).
- Mốc trước triển khai `465aef9ca3c6e941da780cfee72423c7a3e300ef`.

## Các file thay đổi

| File | Logic trước và sau | Mục đích và ảnh hưởng |
| --- | --- | --- |
| [createAdminGuard.js](../../BE/src/middleware/createAdminGuard.js) | Tách logic kiểm tra admin từ guard cũ vào factory dùng chung. Theo tùy chọn, truy vấn đọc thêm `status`, từ chối admin bị khóa và chuyển lỗi đọc DB sang error handler. | Kiểm tra quyền từ bản ghi hiện tại bằng một truy vấn và giới hạn thay đổi phân quyền ở danh sách người dùng. |
| [requireAdmin.js](../../BE/src/middleware/requireAdmin.js) | Guard review trước đây tự kiểm tra `id` và `role`. Hiện khởi tạo từ factory với tùy chọn mặc định, giữ kiểm tra vai trò và contract lỗi đang dùng. | Các tuyến review tiếp tục gọi cùng export CommonJS. |
| [requireActiveAdmin.js](../../BE/src/middleware/requireActiveAdmin.js) | Middleware mới khởi tạo từ factory với kiểm tra `status = 1` và thông báo từ chối dành cho danh sách. | Kích hoạt yêu cầu admin đang hoạt động tại đúng tuyến danh sách. |
| [userRoutes.js](../../BE/src/routes/client/userRoutes.js) | `GET /` trước đây gọi thẳng controller. Tuyến hiện kiểm tra cookie bằng `requireAuth`, sau đó kiểm tra admin đang hoạt động trước khi vào controller. `PUT /profile` vẫn dùng `requireAuth`. | Khách nhận 401. Customer, staff và admin bị khóa nhận 403. Admin đang hoạt động nhận 200. |
| [userSerializer.js](../../BE/src/utils/userSerializer.js) | Module mới nhận bản ghi Sequelize, object thuần hoặc giá trị nullish. `toPrivateUser` xuất tám trường trong kế hoạch, `toPublicUser` xuất bốn trường công khai. Các trường thiếu nhận `null`. | Service dùng chung allowlist để kiểm soát trường xuất hiện trong JSON. Cả hai helper được kiểm thử. Hiện các tuyến trong task dùng `toPrivateUser`. |
| [registerService.js](../../BE/src/services/client/registerService.js) | Thay kết quả `createdUser.toJSON()` bằng dữ liệu từ `toPrivateUser(createdUser)` sau khi xác minh OTP, băm mật khẩu và tạo bản ghi. | Controller giữ response 201 dạng `{ success, data }`. Hash vẫn được lưu phục vụ đăng nhập và được loại khỏi JSON. |
| [authService.js](../../BE/src/services/client/authService.js) | Login trước đây dùng danh sách trường riêng và ánh xạ thủ công. Hiện truy vấn dùng allowlist cộng `password` để so bcrypt, sau đó serialize user. Me dùng cùng allowlist cho truy vấn và dữ liệu phản hồi. | `data.user` có cùng bộ trường trên các tuyến tài khoản. Login tiếp tục phát JWT qua cookie HTTP-only. |
| [userService.js](../../BE/src/services/client/userService.js) | Danh sách và kết quả update trước đây chỉ loại `password` ở truy vấn. Hiện cả hai truy vấn theo allowlist và xuất object qua serializer. Bước xác nhận tài khoản tồn tại trước khi update chỉ đọc `id`. | Controller tiếp tục bọc kết quả như trước. Update chỉ xử lý `name`, `phone`, `address` của tài khoản từ phiên. |
| [userPrivacy.test.js](../../BE/tests/userPrivacy.test.js) | Suite mới tạo schema theo PID, dùng bảng Sequelize thật, chạy app trên loopback và chèn OTP giả đã băm. Kiểm tra các vai trò, danh sách admin, đăng ký, cookie đăng nhập, đọc và sửa hồ sơ, quét khóa lồng nhau và kiểm tra hai helper. | Các bài test dùng dữ liệu giả. Teardown đóng server/kết nối và chỉ xóa schema do lượt chạy tạo thành công. |
| [Kế hoạch triển khai](../task-plans/2026-11-20-dong-danh-sach-user-loai-hash-plan.md) | Thêm mục 9 ghi kết quả khảo sát trước khi sửa. | Ghi rõ lệch giữa giả định về `requireAdmin` và mã nguồn, cách giới hạn ảnh hưởng, cùng căn cứ về MySQL. Tiêu chí nghiệm thu gốc giữ nguyên. |
| [Báo cáo thay đổi](2026-11-20-dong-danh-sach-user-loai-hash-change-log.md) và [code review](../code-reviews/2026-11-20-dong-danh-sach-user-loai-hash-code-review.md) | Hai tài liệu mới ghi nhận diff, bằng chứng kiểm thử và kết quả review độc lập. | Truy vết cách hiện thực hóa các tiêu chí trong kế hoạch. |

## Luồng và đánh giá phương án

`GET /api/users` đi qua xác thực cookie, kiểm tra quyền từ DB, rồi mới truy vấn danh sách theo allowlist và trả JSON. Các tuyến tài khoản giữ nguyên cấu trúc response và dùng cùng lớp chiếu dữ liệu. Truy vấn allowlist giới hạn dữ liệu đọc để phản hồi. Serializer áp dụng thêm ranh giới khi trả object, bao gồm kết quả từ `User.create` và truy vấn login có hash.

Phạm vi triển khai là Backend. Schema ứng dụng và Frontend giữ nguyên. Bài kiểm thử đăng ký tạo OTP giả trong schema test nên không cần SMTP. MySQL lưu `created_at` ở độ chính xác giây. Test so thời điểm đăng ký và dữ liệu đã lưu ở độ chính xác này.

## Kiểm thử và nghiệm thu

| Tiêu chí | Kết quả | Bằng chứng |
| --- | --- | --- |
| FUNC-MISS-002-AC-01 | **Đạt** | HTTP 401 với khách và 403 với customer, staff, admin bị khóa. Các body lỗi chỉ có `success` và `message`. Admin đang hoạt động nhận 200 với danh sách đúng allowlist. |
| FUNC-MISS-002-AC-02 | **Đạt** | Quét đệ quy JSON của register, login, me và update profile. Các object user chỉ có trường allowlist. Login phát cookie HTTP-only và phiên truy cập được me/profile. |
| FUNC-MISS-002-AC-03 | **Đạt** | Đăng ký với OTP hợp lệ trả 201, rồi đăng nhập bằng chính tài khoản vừa tạo trả 200. |

- TDD ghi nhận trước khi sửa: request khách trả 200 khi kỳ vọng 401, sau đó ca đăng ký phát hiện khóa nhạy cảm trong JSON. Sau khi triển khai, cả hai kiểm tra đều đạt.
- `npm test` trong `BE` đạt **181/181**, gồm bốn bài test mới.
- `node --check` đạt trên chín file JS thêm hoặc sửa. `git diff --check` cho Backend đạt. Kiểm tra toàn worktree báo dòng trống EOF đã có tại `GLOSSARY.md:99`, ngoài phần thay đổi triển khai.
- Chưa kiểm thử UI trên trình duyệt hoặc gửi email thật. Kiểm chứng tích hợp giới hạn ở app HTTP cục bộ với schema MySQL riêng.

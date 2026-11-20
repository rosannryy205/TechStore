# Code review FUNC-MISS-003

Ngày tạo 2026-11-20. Mốc đối chiếu `465aef9ca3c6e941da780cfee72423c7a3e300ef`. Rà soát diff của worktree `fix/func-miss-003` và các test, hook, service mới chưa được Git theo dõi.

[Kế hoạch](../task-plans/2026-11-20-chan-tai-khoan-khoa-plan.md) · [Báo cáo thay đổi và danh sách file](../code-changes/2026-11-20-chan-tai-khoan-khoa-change-log.md)

## Standards

Rà soát theo [AGENTS.md](../../AGENTS.md), [ADR kiến trúc Frontend](../adr/0001-frontend-architecture-and-conventions.md) và [ADR quyền Order](../adr/0004-order-shipping-role-boundary.md).

| Phát hiện | Xử lý |
| --- | --- |
| Kết quả cart đến muộn có thể ghi lại dữ liệu sau khi phiên kết thúc. | Hủy request cũ, bỏ kết quả và rollback đã hủy, đồng thời ẩn dữ liệu giỏ và badge ngay khi mất xác thực. |
| Glob lồng nhau của lệnh test phụ thuộc phiên bản Node. | Dùng cơ chế khám phá của `node --test`. |
| Lời gọi từ component review cần qua hook và API service. | Tách xử lý review vào `useProductReviews` và `reviewService`, tiếp tục dùng `httpRequest`. |

Kết luận **Đạt**. Vòng rà soát lại không còn điểm cần sửa trong phạm vi thay đổi. Badge Header được kiểm tra qua mã nguồn.

## Spec

| Tiêu chí | Kết luận và bằng chứng |
| --- | --- |
| AC-01 | **Đạt.** TC-01 và TC-02 kiểm 401, thông báo chung, không có cookie phiên mới. |
| AC-02 | **Đạt.** TC-03 đến TC-08 kiểm 401 và cookie hết hạn trên route thật. Dữ liệu nghiệp vụ và tồn kho được đối chiếu trong môi trường cô lập. |
| AC-03 | **Đạt.** TC-09, TC-10 và test Catalog, Order kiểm cả tài khoản active được phép và bị từ chối theo vai trò. Q4 dùng quyền hiện tại từ DB. |

Phát hiện về UI giỏ, checkout và phản hồi tạo đơn đến muộn đã được xử lý. Checkout quay về giỏ khi phiên kết thúc. Test React mô phỏng phản hồi đặt đơn 201 đến sau 401 và xác minh trang vẫn ở giỏ khách. Trang xác nhận chỉ hiển thị dữ liệu đơn khi người dùng hiện tại là chủ đơn.

Kết luận **Đạt**. Test Backend chạy trên schema MySQL tạm. Test Frontend qua jsdom, không có kết quả kiểm thử trình duyệt thật. Backend đạt 188/188, Frontend đạt 29/29. Lint, build và kiểm tra cú pháp Backend đạt.

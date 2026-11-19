# FUNC-MISS-001 — Code Review bảo mật catalog

- Ngày tạo: 2026-11-19.
- Đặc tả: [kế hoạch catalog-auth-guard](../task-plans/2026-11-19-catalog-auth-guard-plan.md).
- Kết quả triển khai/kiểm thử: [change log A–F](../code-changes/2026-11-19-catalog-auth-guard-change-log.md).
- Tiêu chuẩn: [.agentrules.md](../../.agentrules.md), [AGENTS.md](../../AGENTS.md), [README.md](../../README.md), [ADR0004](../adr/0004-order-shipping-role-boundary.md).

## Phạm vi và mốc cố định

Mốc trước triển khai: `361fa16a96de1e384f0755a2b1230a3997a3ad14`. Không có commit mới; HEAD giữ nguyên theo RULE 7. Do đó `git diff <mốc>...HEAD` không biểu diễn triển khai chưa commit. Review trực tiếp working tree bằng:

```text
git diff 361fa16a96de1e384f0755a2b1230a3997a3ad14 -- BE/src/routes/admin/productRoutes.js BE/src/routes/admin/brandRoutes.js BE/src/routes/admin/categoryRoutes.js BE/src/routes/admin/variantAttributeRoutes.js
```

Đọc bổ sung hai file mới chưa tracked: `BE/src/middleware/requireCatalogOperator.js`, `BE/tests/catalogAuthGuard.test.js`; đối chiếu kế hoạch hiện có và change log. Những thay đổi tài liệu/đổi tên file/lockfile đã tồn tại trước task không được gộp vào review này. Không tạo commit chỉ để có diff.

Hai reviewer độc lập chạy song song theo skill `code-review`: Standards đánh giá quy tắc repo và code smells; Spec đối chiếu hành vi với AC gốc. Các reviewer chỉ đọc mã, không chạy lại integration test; bằng chứng chạy test dưới đây do agent triển khai ghi nhận.

## Standards

Không phát hiện vi phạm tiêu chuẩn bắt buộc hoặc code smell cần xử lý trong 6 file mã nguồn thuộc phạm vi task.

Guard dùng Sequelize để đọc quyền hiện tại, nằm trong middleware theo kiến trúc repo và chuyển lỗi qua error handler tập trung. Cả 4 router gắn guard trước upload/validator/controller; Brand đã bỏ GET trùng. Logic quyền được dùng chung, không phát sinh abstraction dư thừa.

Test sử dụng DB tạm theo PID, payload hợp lệ, kiểm tra tác động lên catalog/upload và đóng kết nối/drop đúng schema do tiến trình tạo. Không thấy thay đổi ngoài phạm vi trong diff được giao.

Kiểm tra tài liệu bổ sung: change log đủ A–F, liệt kê chính xác 6 file mã nguồn, phân tích trước/sau và tác động từng file, giữ baseline AC, đồng thời phân biệt rõ phần đạt và chưa kiểm chứng. Thống kê 177 = 155 catalog + 22 có sẵn khớp cấu trúc test và kết quả thực thi. Các giới hạn về positive multipart, browser, lỗi DB mô phỏng và whitespace ngoài phạm vi được ghi trung thực.

**Standards: 0 finding; không có mục bắt buộc sửa.**

## Spec

**0 findings.** Implementation matches plan sections 4–7 and clarification section 10:

- All four catalog routers enforce `requireAuth → requireCatalogOperator` before upload, validators and controllers; duplicate Brand GET removed.
- Middleware loads current account role/status from DB, grants only active Admin/Staff, denies missing/locked/customer accounts with `403`, and forwards DB failures to the sanitized error handler.
- Integration tests cover all 12 distinct routes, valid Admin/Staff operations, unauthorized/forbidden requests, unchanged catalog data, multipart requests without new files, and revoked permissions with an existing JWT.
- Test schema is generated from PID before model import, created independently, and dropped only if this run created it.
- Review authorization and Order behavior remain unchanged; Review’s admin-only boundary has explicit regression coverage, while the existing Order suite checks ADR0004.

Verification limits: read-only review; parent reports **177/177 backend tests passing**. Browser behavior and successful authenticated file uploads were not exercised; the DB-failure test simulates an unavailable users table rather than a complete MySQL outage. No scope creep identified.

## Bằng chứng kiểm chứng

- TDD từng router: Product/Brand/Attribute GET trả 200 thay vì 401 trước guard; Category POST payload rỗng trả 400 thay vì 401. Từng lát cắt được chạy đỏ trước khi sửa rồi xanh sau khi thêm guard.
- `npm test` trong `BE`: **177/177 pass**, 0 fail/cancel/skip/todo, khoảng 4,43 giây. Có 155 test/subtest catalog và 22 test Order/Product Search/Banner có sẵn.
- Kiểm tra cú pháp `node --check` trên đủ 6 file JS thêm/sửa: đạt.
- `git diff --check` với 4 router và kế hoạch trong phạm vi task: đạt; kiểm tra file source mới không có whitespace cuối dòng: đạt.
- Kiểm tra 22 liên kết Markdown nội bộ trong kế hoạch, change log và báo cáo review: 0 liên kết hỏng.
- `git diff --check` toàn repo: phát hiện dòng trống EOF tại `docs/code-changes/2026-11-14-product-search-change-log.md`, là thay đổi có sẵn ngoài phạm vi. Không chỉnh sửa file người dùng để làm sạch kết quả.
- Giới hạn: chưa chạy trình duyệt/FE build/lint, chưa kiểm thử upload file thành công của admin/staff; lỗi DB được mô phỏng bằng đổi tên bảng User chỉ trong schema test, không ngắt MySQL thật.

## Kết luận theo hai trục

Standards: **0 finding**, không có vấn đề cần sửa. Spec: **0 finding**, không có yêu cầu thiếu/sai được phát hiện. Review hai trục hoàn tất; các giới hạn kiểm chứng được giữ nguyên ở trên.

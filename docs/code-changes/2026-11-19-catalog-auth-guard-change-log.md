# FUNC-MISS-001 — Bảo vệ API quản trị catalog

- Ngày tạo: 2026-11-19. Task: `catalog-auth-guard`.
- Baseline: [kế hoạch triển khai](../task-plans/2026-11-19-catalog-auth-guard-plan.md), [.agentrules.md](../../.agentrules.md), [ADR0004](../adr/0004-order-shipping-role-boundary.md).
- Mốc đối chiếu mã nguồn trước triển khai: `361fa16a96de1e384f0755a2b1230a3997a3ad14`. Kết quả nằm trong working tree, chưa commit.

## A. Tổng quan chức năng

### Yêu cầu và vấn đề ban đầu

Bốn router Product, Brand, Category và Variant Attribute được mount trực tiếp trong app mà chưa xác thực/phân quyền. Khách vãng lai có thể đọc dữ liệu quản trị hoặc gửi request ghi. Riêng Brand/Product, Multer chạy trước mọi kiểm tra quyền nên có thể ghi file của request trái phép.

### Hành vi đã triển khai

Tất cả **12 route phân biệt** được bảo vệ bằng `requireAuth → requireCatalogOperator` ở cấp router. JWT không hợp lệ/không có cookie nhận `401`; user không tồn tại, bị khóa hoặc không phải admin/staff nhận `403`. Quyền và trạng thái luôn được đọc lại từ database, nên token được cấp trước khi đổi role/khóa/xóa user không giữ quyền cũ. Chỉ tài khoản có `status === 1` và role `admin`/`staff` được chạy tiếp vào upload, validator và nghiệp vụ.

Lỗi truy vấn quyền đi tới error handler tập trung, trả `500` với thông báo chung, không cho upload chạy hoặc lộ SQL. Đã bỏ route `GET /` Brand bị khai báo trùng.

### Kết quả và phạm vi diff

Sáu file mã nguồn thay đổi, không sửa controller/service/model, frontend, Order, Review hoặc schema cửa hàng. Bộ test BE cuối cùng đạt **177/177**, không fail/cancel/skip; trong đó 155 test/subtest catalog và 22 test có sẵn. Nội dung các bảng catalog và danh sách file upload giữ nguyên trong các ca bị từ chối.

Diff kiểm tra bằng `git diff 361fa16a96de1e384f0755a2b1230a3997a3ad14 -- BE/src/routes/admin/` cùng nội dung hai file mới chưa tracked. Đã kiểm tra staged, unstaged và untracked bằng Git; các thay đổi tài liệu, đổi tên file và `package-lock.json` có sẵn trước task được bảo toàn, không tính là kết quả triển khai này.

## B. Danh sách file mã nguồn thay đổi

| File | Loại thay đổi | Thành phần | Mục đích |
| --- | --- | --- | --- |
| [requireCatalogOperator.js](../../BE/src/middleware/requireCatalogOperator.js) | Tạo mới | `requireCatalogOperator` | Kiểm tra user active và quyền catalog từ DB |
| [productRoutes.js](../../BE/src/routes/admin/productRoutes.js) | Sửa | `router.use` | Bảo vệ cả GET/POST trước upload Product |
| [brandRoutes.js](../../BE/src/routes/admin/brandRoutes.js) | Sửa | `router.use`, GET trùng | Bảo vệ GET/POST trước upload logo, bỏ khai báo thừa |
| [categoryRoutes.js](../../BE/src/routes/admin/categoryRoutes.js) | Sửa | `router.use` | Bảo vệ POST Category trước validator/nghiệp vụ |
| [variantAttributeRoutes.js](../../BE/src/routes/admin/variantAttributeRoutes.js) | Sửa | `router.use` | Bảo vệ đủ 7 route Attribute/Attribute Option |
| [catalogAuthGuard.test.js](../../BE/tests/catalogAuthGuard.test.js) | Tạo mới | HTTP integration harness và ma trận quyền | Khóa hành vi bảo mật, kiểm tra DB/upload và hồi quy |

Tài liệu bổ sung: mục 10 trong kế hoạch hiện có; file change log này; [Code Review độc lập](../code-reviews/2026-11-19-khac-phuc-lo-hong-catalog-auth-code-review.md). Giữ nguyên tên/ngày gốc của kế hoạch và task name `catalog-auth-guard`. Không tạo interview mới vì task đã có yêu cầu/biên kiểm thử chi tiết, theo RULE 0.4.

## C. Phân tích chi tiết từng file code

### 1. `BE/src/middleware/requireCatalogOperator.js`

- **Vai trò/trạng thái:** middleware phân quyền mới, dùng chung cho 4 router catalog; chạy sau `requireAuth`.
- **Đầu vào và xử lý:** nhận `req.user.id` đã xác thực; dùng `User.findByPk` chỉ lấy `id`, `role`, `status`. Nếu không tìm thấy user, `status !== 1` hoặc role không thuộc `admin/staff`, dừng request với `403` và `{ success: false, message: "Forbidden: Bạn không có quyền thực hiện thao tác này." }`.
- **Đầu ra hợp lệ:** gắn `req.user.role` và `req.user.status` từ DB, gọi `next()` đúng một lần. Lỗi truy vấn gọi `next(error)` để error handler chuẩn hóa `500`.
- **Trước/sau:** trước đây không có rào quyền catalog ở backend; sau thay đổi, quyền hiện tại trong DB quyết định quyền truy cập, kể cả JWT chứa role admin hoặc là phiên cũ.
- **Lựa chọn kỹ thuật:** dùng middleware chuyên biệt theo mẫu router Order, nhưng không dùng lại guard Order vì catalog có trách nhiệm độc lập và không nên phụ thuộc quy tắc trạng thái Order. Không nới `requireAdmin`, tránh vô tình cấp quyền Review cho Staff.
- **Tác dụng/ảnh hưởng:** tập trung một quy tắc quyền cho 12 endpoint; thêm một truy vấn PK nhỏ cho mỗi request catalog có JWT hợp lệ. Không thay đổi JWT/cookie hoặc dữ liệu tài khoản. Nếu thiếu middleware này, user có JWT nhưng không đủ quyền có thể đi vào nghiệp vụ.

### 2. `BE/src/routes/admin/productRoutes.js`

- **Vai trò/trạng thái:** router quản trị Product hiện có, được sửa.
- **Thay đổi:** import `requireAuth`, `requireCatalogOperator` và gắn `router.use(requireAuth, requireCatalogOperator)` trước mọi route.
- **Trước:** POST chạy `uploadProduct.array("images", 10)` ngay; GET trả dữ liệu quản trị công khai. **Sau:** cả POST và GET yêu cầu user active admin/staff; upload, validator và controller chỉ chạy khi đã qua guard.
- **Mục đích/lý do:** bảo vệ cả đọc và ghi với một khai báo chung, không lặp guard ở từng route; các route thêm phía dưới trong tương lai cũng được bảo vệ.
- **Ảnh hưởng:** request trái phép dừng sớm; request hợp lệ giữ nguyên payload, response `200/201`, logic Product/Variant/Image và transaction hiện có. Không thay đổi upload MIME/size hoặc logic tạo Variant.

### 3. `BE/src/routes/admin/brandRoutes.js`

- **Vai trò/trạng thái:** router quản trị Brand hiện có, được sửa.
- **Thay đổi:** import/gắn cùng cặp guard trước GET/POST; xóa khai báo GET `/` thứ hai.
- **Trước:** người lạ có thể đọc/tạo Brand và upload logo; GET trùng không có tác dụng vì handler trước đã trả response. **Sau:** guard dừng request trước `uploadBrand.single("logo")`; chỉ giữ một GET.
- **Mục đích/lý do:** ngăn ghi Brand/file trái phép, giữ một định nghĩa route rõ ràng. Dùng cùng middleware để quyền không lệch với Product/Category/Attribute.
- **Ảnh hưởng:** không đổi endpoint hay nghiệp vụ Brand; admin/staff active tiếp tục nhận `200/201`. Không xóa file upload có sẵn hoặc thay schema.

### 4. `BE/src/routes/admin/categoryRoutes.js`

- **Vai trò/trạng thái:** router tạo Category hiện có, được sửa.
- **Thay đổi:** import/gắn cặp guard ở đầu router trước `createCategoryRules()`.
- **Trước:** mọi request có thể chạy validator và service tạo Category/CategoryBrand. **Sau:** phải qua kiểm tra JWT và DB role/status trước; khách vãng lai nhận `401` ngay cả khi payload thiếu field.
- **Mục đích/lý do:** chặn tạo danh mục/liên kết Brand trái phép bằng cùng cơ chế router chung.
- **Ảnh hưởng:** transaction Category/CategoryBrand, payload `brandIds` và response `201` không đổi; không thêm route đọc Category quản trị.

### 5. `BE/src/routes/admin/variantAttributeRoutes.js`

- **Vai trò/trạng thái:** router CRUD Attribute/Attribute Option hiện có, được sửa.
- **Thay đổi:** import/gắn cặp guard trước 7 khai báo GET/POST/PUT/DELETE, gồm cả các route Option lồng dưới Attribute.
- **Trước:** cả đọc, tạo, sửa và xóa mềm đều công khai. **Sau:** chỉ admin/staff active được thực thi; customer/locked user không thể đổi nội dung hoặc trạng thái bản ghi.
- **Mục đích/lý do:** bảo vệ trọn router để tránh sót route con, dùng quy tắc quyền duy nhất.
- **Ảnh hưởng:** giữ nguyên validator, service, tham số thực tế `:optionId`, response `200/201` và cơ chế soft delete. Không mở rộng validation scope/quan hệ Option–Attribute ngoài kế hoạch.

### 6. `BE/tests/catalogAuthGuard.test.js`

- **Vai trò/trạng thái:** file integration test mới, dùng `node:test`, `node:assert/strict`, Fetch/FormData/Blob và dependency BE đã có, không thêm package.
- **Harness:** load cấu hình kết nối từ môi trường, ghi đè DB_NAME bằng `techstore_catalog_test_${process.pid}` trước khi import models; JWT_SECRET ngẫu nhiên riêng cho tiến trình. Tạo schema mới, sync models, seed fixture admin/staff/customer active và staff/admin locked cùng Brand/Category/Attribute/Option. App thật listen ở cổng ngẫu nhiên trên `127.0.0.1`.
- **Cô lập/dọn dẹp:** xác thực định dạng tên schema; chỉ drop nếu chính hook đã tạo thành công. `after()` dùng các khối finally để đóng server, Sequelize, drop đúng schema test và đóng kết nối quản trị. Không gọi connectDB/seed trên database cửa hàng. Không xóa file upload người dùng.
- **Ma trận bị từ chối:** 8 trạng thái người gọi × 12 route, gồm no cookie, sai chữ ký, hết hạn, customer, staff/admin khóa, user không tồn tại và JWT khai role admin trái với DB. Payload ghi hợp lệ và ID mục tiêu tồn tại; so sánh chính xác response và toàn bộ dữ liệu 9 bảng catalog sau từng request, phát hiện cả update/soft delete không đổi số lượng row.
- **Upload:** 8 trạng thái × 2 route multipart có file ảnh giả lập; đọc danh sách file tại `BE/src/uploads/brands/` và `BE/src/uploads/products/` trước/sau, đồng thời kiểm tra DB không đổi.
- **Ma trận được phép:** admin/staff thực thi thành công mỗi người đủ 12 endpoint với payload hợp lệ; đọc lại Product/Variant, Brand, Attribute/Option qua API; xác nhận CategoryBrand được tạo. Kiểm tra xóa mềm Option/Attribute làm chúng biến mất khỏi API đọc.
- **Bổ sung:** validator vẫn trả `400` với admin/staff có payload thiếu; cùng cookie phản ánh khóa/đổi role/xóa user ngay; Review vẫn chỉ admin được reply/duyệt; API đọc Product/Category/Review công khai tiếp tục hoạt động. Test lỗi DB tạm đổi tên bảng users trong schema test, khôi phục trong finally; kiểm tra `500` chung, không đổi catalog và không sinh file.
- **Trước/sau và lý do:** trước chưa có test cho quyền catalog; sau có đặc tả hành vi qua HTTP thật và tác động DB/filesystem đã định trong kế hoạch, không mock controller/service nội bộ. Các kiểm tra DB phụ trợ phục vụ trực tiếp AC không ghi dữ liệu trái phép, không kiểm tra cấu trúc triển khai private.
- **Ảnh hưởng:** test cần quyền tạo/drop schema MySQL tạm và chạy từ `BE`; `npm test` hiện có tự nhận file, không sửa package scripts. Bộ test có 155 test/subtest theo thống kê Node.

## D. Giải thích luồng xử lý tổng thể

1. Frontend hiện có gửi cookie `auth_token` qua `credentials: "include"`; nhánh admin chỉ cho role admin/staff vào giao diện.
2. App parse JSON/form-urlencoded/cookie rồi chuyển tới router catalog tương ứng.
3. `requireAuth` xác minh cookie JWT: không có/sai/hết hạn → `401`, không trả dữ liệu quản trị.
4. `requireCatalogOperator` tra User từ DB: không tồn tại/không active/không đúng role → `403`; lỗi đọc DB → error handler trả `500` an toàn.
5. Khi được phép, Brand/Product chạy Multer; các route chạy validator hiện có rồi Controller → Service → Model → Database.
6. Controller trả response như cũ; lỗi đi qua error handler. Frontend httpClient đã giữ `error.status`/`error.payload` cho `401/403`, không cần sửa frontend.

Thứ tự guard nằm trước middleware upload/validator ở 4 router, dù upload module được import lúc khởi tạo app. Import có thể tạo thư mục upload rỗng theo code có sẵn; request bị từ chối không lưu file.

## E. Đánh giá phương án triển khai

- **Kiến trúc:** route chỉ cấu hình pipeline; middleware kiểm tra quyền; controller/service/model hiện có giữ trách nhiệm nghiệp vụ. Không sao chép CRUD vào guard.
- **Tinh giản/trùng lặp:** một middleware cho 4 router; bỏ GET Brand trùng. Không tạo framework phân quyền mới cho một task nhỏ.
- **Bảo mật:** kiểm tra status/role từ DB mỗi request thay vì tin claim JWT; dừng trước upload/validator; lỗi nội bộ được che bởi error handler. Không đồng nhất quyền catalog với Review admin-only hoặc Order ADR0004.
- **Hiệu năng/toàn vẹn:** thêm một SELECT theo khóa chính với 3 field trên request đã xác thực; không thêm truy vấn cho khách vãng lai và không ghi User. Request bị từ chối không đi tới transaction catalog hoặc Multer.
- **Sai lệch kế hoạch đã ghi trước khi code:** thực tế 12 thay vì 11 route; upload nằm tại `BE/src/uploads`; cookie JWT fixture thay cho login API để kiểm thử quyền độc lập; triển khai test theo lát cắt dọc từng router; review working tree thay vì commit vì RULE 7. Tiêu chí AC gốc giữ nguyên.
- **Giới hạn:** không triển khai upload MIME/content hardening, CSRF, sửa đăng nhập hoặc các quyền ngoài catalog. Test positive dùng payload JSON không kèm file; multipart kiểm chứng trực tiếp nhánh bị từ chối. Test lỗi DB mô phỏng bảng User không truy vấn được, không phải ngắt toàn bộ MySQL. Việc đổi role đồng thời sau lúc guard đọc DB không được khóa xuyên transaction nghiệp vụ.

## F. Kiểm thử và nghiệm thu

### TDD thực tế

Tất cả lệnh test chạy trong `BE/`, MySQL hoạt động; không dùng database cửa hàng.

| Lát cắt | Bằng chứng Red trước khi sửa router | Kết quả Green sau khi sửa |
| --- | --- | --- |
| Product GET không cookie | `200 !== 401`, 0/1 pass | 1/1 pass |
| Brand GET không cookie | `200 !== 401`, 1/2 pass | 2/2 pass |
| Category POST payload rỗng không cookie | `400 !== 401`, 2/3 pass | 3/3 pass |
| Attribute GET không cookie | `200 !== 401`, 3/4 pass | 4/4 pass |

Lệnh từng lát cắt: `node --test tests/catalogAuthGuard.test.js`. Sau khi mở rộng ma trận từ chối và multipart: **125/125 pass**. Sau khi bổ sung ma trận được phép, validator, thu hồi quyền, Review/public API, lỗi DB: `node --test --test-reporter=dot tests/catalogAuthGuard.test.js` exit `0`.

### Kết quả cuối và AC

`npm test` → `node --test tests/*.test.js`: **177 tests, 177 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo**, thời gian runner khoảng **4,43 giây**. Bao gồm catalog 155, Order 12, Product Search 6 và Banner 4. Hook dọn dẹp schema/kết nối hoàn tất thành công.

| Tiêu chí baseline | Trạng thái | Bằng chứng |
| --- | --- | --- |
| `FUNC-MISS-001-AC-01` | **Đạt** | 12 route không cookie nhận 401 với response chung; snapshot 9 bảng không đổi; 2 POST multipart không lưu file. JWT sai/hết hạn cũng bị chặn. |
| `FUNC-MISS-001-AC-02` | **Đạt** | Customer/staff locked nhận 403 trên 12 route với payload hợp lệ; dữ liệu catalog không đổi; multipart không sinh file. Bổ sung admin locked, user không tồn tại và JWT role sai. |
| `FUNC-MISS-001-AC-03` | **Đạt** | Admin/staff active thực hiện đủ 12 route, 200/201 và kiểm tra dữ liệu sau ghi. Test Review chỉ admin được duyệt/trả lời; 12 test Order hiện có đạt, giữ ranh giới Shipping theo ADR0004. |

**Chưa đạt:** không có AC baseline nào chưa đạt trong phạm vi kiểm thử backend. **Chưa kiểm chứng:** tương tác toast/redirect bằng trình duyệt, upload thành công của tài khoản hợp lệ với file thật và vận hành trên môi trường triển khai. Frontend chỉ được đối chiếu mã `RequireAdmin` và `httpClient`; không chạy FE build/lint/browser vì không đổi frontend. BE không có script lint/build/typecheck riêng; không ghi nhận các lệnh đó là đã chạy.

`git diff --check` toàn repo phát hiện một dòng trống EOF trong `docs/code-changes/2026-11-14-product-search-change-log.md`, thuộc thay đổi người dùng có sẵn. Không sửa file ngoài phạm vi để che kết quả kiểm tra. Kiểm tra diff/whitespace trong phạm vi task được ghi trong báo cáo Code Review độc lập.

Review độc lập đã hoàn tất: **Standards 0 finding, Spec 0 finding**, tổng hợp tại [báo cáo Code Review](../code-reviews/2026-11-19-khac-phuc-lo-hong-catalog-auth-code-review.md). Kiểm tra cú pháp đủ 6 file JS đạt; 22 liên kết Markdown nội bộ trong ba tài liệu không có link hỏng. Giữ toàn bộ thay đổi chưa commit của người dùng; không commit, push, merge, reset hoặc thao tác worktree khác.

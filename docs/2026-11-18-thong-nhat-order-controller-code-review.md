# Báo cáo phân tích code: thống nhất controller đơn hàng theo Category

## A. Tổng quan chức năng

Người dùng yêu cầu thống nhất cách viết `BE/src/controllers/admin/orderController.js` với `categoryController.js`: khai báo hàm riêng bằng `const`, tách bước lấy dữ liệu/gọi service/trả response, trình bày `try/catch` nhiều dòng và export tập trung cuối file.

Code trước tác vụ đã có đủ năm handler nhưng dùng `exports.list/detail/advance/bulk/cancel`, tên service chung chung và nhiều câu lệnh gộp một dòng. Kết quả chỉnh sửa là năm hàm có tên cụ thể, service có tên rõ, response HTTP 200 được viết tường minh và router dùng đúng các tên export mới. Không thay URL, method, body được gửi tới service, cấu trúc JSON hoặc quy tắc nghiệp vụ.

### Phạm vi diff của riêng tác vụ này

- Chỉ sửa hai file code được phân tích tại B/C. `categoryController.js`, service, validator, model, FE và dependency không được sửa trong tác vụ chuẩn hóa này.
- Hai file code vốn đã tồn tại trong working tree từ tác vụ triển khai trước, dù Git vẫn báo untracked. Vì vậy trạng thái trong báo cáo này là **Sửa**, không nhận việc tạo hai file là công việc mới của ngày 18/11.
- Đã đọc status/diff staged và danh sách tham chiếu. Không có thay đổi staged. So sánh trước/sau dùng snapshot hai file lấy ngay trước khi sửa, qua `git diff --no-index`; không lấy toàn bộ thay đổi khác đang có trong workspace làm thay đổi của lượt này.
- `package-lock.json` ở gốc và những file triển khai khác đã có thay đổi từ trước, không thuộc phạm vi chuẩn hóa controller.
- Cập nhật mục controller và các tham chiếu trong [báo cáo triển khai trước](./2026-11-14-duyet-trang-thai-don-hang.md) để tên hàm trong tài liệu tiếp tục khớp code.

## B. Danh sách file mã nguồn thay đổi

| File | Loại thay đổi trong tác vụ này | Thành phần thay đổi | Mục đích |
| --- | --- | --- | --- |
| [BE/src/controllers/admin/orderController.js](../BE/src/controllers/admin/orderController.js) | Sửa | Import alias, năm handler, destructuring, response, `module.exports` | Thống nhất cách trình bày với Category và đặt tên handler rõ trách nhiệm |
| [BE/src/routes/admin/orderRoutes.js](../BE/src/routes/admin/orderRoutes.js) | Sửa | Biến `orderController` và năm tham chiếu callback | Nối router với các export mới, giữ nguyên contract HTTP và middleware |

Tài liệu được cập nhật/tạo trong cùng tác vụ: `docs/2026-11-14-duyet-trang-thai-don-hang.md` và báo cáo này. Không tạo, xóa file code hoặc thêm test file mới.

## C. Phân tích chi tiết từng file code

### C.1. BE/src/controllers/admin/orderController.js

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/controllers/admin/orderController.js`.
- **Vai trò:** adapter HTTP nhận dữ liệu đã được router/validator kiểm tra, gọi service và trả response hoặc chuyển lỗi.
- **Trạng thái:** sửa file đã có trước tác vụ.
- **Vị trí:** `getOrders:4`, `getOrderDetail:17`, `advanceOrder:31`, `bulkAdvanceOrders:51`, `cancelOrder:69`, `module.exports:91`.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Khai báo service, hàm và export tập trung

- **Trước khi sửa:** import tên `service`/`statusService`, gán trực tiếp từng hàm vào `exports.list`, `exports.detail`, `exports.advance`, `exports.bulk`, `exports.cancel`.
- **Đã thay đổi gì / sau khi sửa:** đổi tên import thành `orderService`/`orderStatusService`; khai báo năm hàm bằng `const`; cuối file `module.exports` liệt kê năm tên handler mới.
- **Logic hoạt động như thế nào:** CommonJS khởi tạo các hàm trong module, sau đó xuất object chứa các hàm để router lấy callback. Không dùng đồng thời export tên cũ và mới.
- **Mục đích:** giúp tìm hàm theo nghiệp vụ, đặt breakpoint và xem toàn bộ giao diện của controller ở một chỗ.
- **Phục vụ chức năng:** tổ chức code cho năm API quản trị đơn đang tồn tại.
- **Tại sao lựa chọn phương án này:** cùng cấu trúc `const createCategory` và `module.exports = { createCategory }` của Category; hai cú pháp export đều hợp lệ, lựa chọn này phục vụ tính nhất quán, không được coi là tối ưu hiệu năng.
- **Tác dụng cốt lõi:** làm rõ ranh giới controller và trách nhiệm của hai service; tránh tên `service` không cho biết module nào đang xử lý.
- **Ảnh hưởng đến code khác:** router phải đổi tên callback tương ứng. Qua tìm kiếm trong repo, router quản trị đơn là nơi gọi các handler này; không thêm alias cũ vì không còn tham chiếu cần giữ trong code hiện có.

##### getOrders — lấy danh sách

- **Trước khi sửa:** `exports.list` lồng `await service.getOrders(req.query)` ngay trong object truyền cho `res.json` và gộp `try/catch` một dòng.
- **Đã thay đổi gì / sau khi sửa:** khai báo `getOrders`; lưu kết quả await vào biến `orders`, rồi `return res.status(200).json({ success: true, ...orders })`.
- **Logic hoạt động như thế nào:** chuyển nguyên `req.query` sang cùng service; chờ service trả `{data,total,page,limit,totalPages,countsByStatus}`; spread các trường ở cấp response ngoài như trước.
- **Mục đích:** tách rõ gọi service và tạo response để kiểm tra metadata tại breakpoint.
- **Phục vụ chức năng:** danh sách/phân trang/số đếm quản trị đã có.
- **Tại sao lựa chọn phương án này:** không chuyển metadata vào `data`, vì hook đang đọc chúng ở cấp ngoài. Viết status 200 rõ ràng tương đương mặc định của `res.json` trước đây.
- **Tác dụng cốt lõi:** đổi cách viết mà không làm caller mất `total`, `page` hoặc `countsByStatus`.
- **Ảnh hưởng đến code khác:** router gọi `orderController.getOrders`; service và hook FE không cần thay đổi.

##### getOrderDetail — lấy chi tiết

- **Trước khi sửa:** `exports.detail` gọi `service.getOrder(req.params.id)` và trả response trên một dòng.
- **Đã thay đổi gì / sau khi sửa:** destructure `id`, lưu kết quả vào `order`, trả HTTP200 với `{success:true,data:order}`.
- **Logic hoạt động như thế nào:** `id` vẫn được chuyển nguyên kiểu/giá trị đã có trong params xuống `orderService.getOrder`; controller không thêm ép kiểu hoặc query.
- **Mục đích:** làm rõ dữ liệu đầu vào và kết quả chi tiết trước khi trả HTTP.
- **Phục vụ chức năng:** drawer chi tiết/lịch sử/email đang có.
- **Tại sao lựa chọn phương án này:** theo trình tự của Category, đồng thời giữ nguyên việc service quyết định 404 và shape DTO.
- **Tác dụng cốt lõi:** không để việc chuẩn hóa cách viết trở thành thay đổi logic tìm đơn.
- **Ảnh hưởng đến code khác:** router đổi từ `detail` sang `getOrderDetail`; API vẫn là GET `/api/admin/orders/:id`.

##### advanceOrder — chuyển trạng thái từng đơn

- **Trước khi sửa:** `exports.advance` truyền một object dài trên một dòng, đọc trực tiếp nhiều thuộc tính request tại cùng biểu thức.
- **Đã thay đổi gì / sau khi sửa:** tách `id`, `expected_status`, `target_status`; gọi `orderStatusService.advanceOrder` bằng object nhiều dòng; lưu kết quả rồi trả HTTP200.
- **Logic hoạt động như thế nào:** params.id → orderId, req.user.id → actorId, body.expected_status → expectedStatus, body.target_status → targetStatus. Các trường và service nhận dữ liệu giữ nguyên.
- **Mục đích:** làm rõ ánh xạ snake_case ở HTTP sang camelCase trong service, tránh bỏ sót trường khi review.
- **Phục vụ chức năng:** duyệt từng đơn đến Shipping đã được triển khai ở service.
- **Tại sao lựa chọn phương án này:** controller chỉ ánh xạ dữ liệu; không đưa kiểm quyền/transaction hoặc bảng NEXT từ service lên controller.
- **Tác dụng cốt lõi:** giữ trạng thái nguồn và actor xác thực được chuyển đúng, không nhận actor từ client.
- **Ảnh hưởng đến code khác:** router đổi callback thành `advanceOrder`; quyền, validator, service và endpoint PATCH giữ nguyên.

##### bulkAdvanceOrders — chuyển trạng thái hàng loạt

- **Trước khi sửa:** `exports.bulk` lồng await và tạo response trong một biểu thức ngắn.
- **Đã thay đổi gì / sau khi sửa:** tách `orders`/`target_status`, gọi `orderService.bulkAdvance`, lưu `result`, trả `{success:true,data:result}` qua HTTP200.
- **Logic hoạt động như thế nào:** giữ nguyên array orders từ body và actor từ session; service vẫn trả kết quả từng đơn/tổng thành công/thất bại; controller không tự duyệt vòng lặp hoặc sửa response.
- **Mục đích:** phân biệt rõ danh sách đầu vào với kết quả tổng hợp đầu ra.
- **Phục vụ chức năng:** bulk thành công một phần hiện có.
- **Tại sao lựa chọn phương án này:** tên handler mô tả nhiều Order, trong khi tên service `bulkAdvance` được giữ để không mở rộng refactor ngoài phạm vi.
- **Tác dụng cốt lõi:** không làm mất `results`, `updatedCount` hoặc `failedCount` mà UI cần.
- **Ảnh hưởng đến code khác:** router đổi callback; JSON trong `data` và POST `/bulk-status` giữ nguyên.

##### cancelOrder — hủy quản trị

- **Trước khi sửa:** `exports.cancel` tạo object tham số dài một dòng rồi trả `data`.
- **Đã thay đổi gì / sau khi sửa:** tách `id`, `expected_status`, `request_id`, `reason`; dùng object nhiều dòng cho `orderStatusService.cancelOrder` rồi trả HTTP200.
- **Logic hoạt động như thế nào:** giữ nguyên orderId, actorId từ session, operator=true và ba trường dữ liệu hủy; service vẫn quyết định thành công/từ chối, kho, history và email.
- **Mục đích:** để developer thấy rõ key chống lặp, lý do và trạng thái nguồn được chuyển đi đâu.
- **Phục vụ chức năng:** hủy quản trị đã có, không thêm luồng hủy mới.
- **Tại sao lựa chọn phương án này:** giữ service dùng chung với khách; chỉ khác cờ operator được controller quản trị đặt như trước.
- **Tác dụng cốt lõi:** không vô tình bỏ request_id hoặc operator khi đổi cách trình bày.
- **Ảnh hưởng đến code khác:** router gọi `cancelOrder`; method PUT, validator và dữ liệu FE/Postman không đổi.

##### Response thành công và catch nhiều dòng

- **Trước khi sửa:** `res.json` dùng mặc định200; nhiều `catch` gộp cùng dòng; không return response.
- **Đã thay đổi gì / sau khi sửa:** năm handler viết `return res.status(200).json(...)`; mỗi catch có khối riêng và `next(error)`.
- **Logic hoạt động như thế nào:** success kết thúc nhánh handler sau gửi response; service throw/reject thì cùng object lỗi được chuyển cho error handler, không tự tạo thông điệp lỗi mới tại controller.
- **Mục đích:** thể hiện rõ đường thành công và đường lỗi; thuận tiện đặt breakpoint tại bước await/response/catch.
- **Phục vụ chức năng:** hợp đồng HTTP hiện có của toàn bộ năm endpoint.
- **Tại sao lựa chọn phương án này:** status 201 của Category dành cho tạo mới, không sao chép 201 sang endpoint đọc/cập nhật đơn. Cùng cách viết không có nghĩa mọi chức năng phải cùng HTTP status.
- **Tác dụng cốt lõi:** khả năng đọc tốt hơn, giữ nguyên response/status/error forwarding; không tuyên bố có cải thiện hiệu năng từ việc thêm dòng.
- **Ảnh hưởng đến code khác:** errorHandler, FE và Postman nhận cùng kết quả HTTP như trước.

### C.2. BE/src/routes/admin/orderRoutes.js

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/routes/admin/orderRoutes.js`.
- **Vai trò:** nối URL quản trị và middleware với callback controller.
- **Trạng thái:** sửa file đã có trước tác vụ.
- **Vị trí:** import dòng 2 và đăng ký năm route dòng 5–9.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Đổi tham chiếu tới handler mới

- **Trước khi sửa:** dùng biến `controller` với thuộc tính `list`, `bulk`, `detail`, `advance`, `cancel`.
- **Đã thay đổi gì / sau khi sửa:** biến import đổi thành `orderController`, lần lượt gọi `getOrders`, `bulkAdvanceOrders`, `getOrderDetail`, `advanceOrder`, `cancelOrder`.
- **Logic hoạt động như thế nào:** Express giữ nguyên thứ tự `requireAuth → requireOrderOperator → rules → validate → handler`; chỉ function reference ở cuối mỗi route được nối với tên export mới.
- **Mục đích:** để router tải được callback sau khi module thay tên export.
- **Phục vụ chức năng:** năm API quản trị đang có, không thêm endpoint.
- **Tại sao lựa chọn phương án này:** sửa đúng consumer thay vì giữ đồng thời tên cũ/mới gây hai bộ tên handler không cần thiết.
- **Tác dụng cốt lõi:** nếu chỉ đổi controller mà bỏ sót router, Express sẽ nhận callback undefined và có thể lỗi khi nạp route.
- **Ảnh hưởng đến code khác:** controller và app mount router; không đổi guard, validator hoặc route khách.

| Method/URL tương đối | Callback trước | Callback sau |
| --- | --- | --- |
| GET `/` | controller.list | orderController.getOrders |
| POST `/bulk-status` | controller.bulk | orderController.bulkAdvanceOrders |
| GET `/:id` | controller.detail | orderController.getOrderDetail |
| PATCH `/:id/status` | controller.advance | orderController.advanceOrder |
| PUT `/:id/cancel` | controller.cancel | orderController.cancelOrder |

## D. Giải thích luồng xử lý tổng thể

`Frontend/Postman → Express route → guard/validator hiện có → controller với tên mới → service hiện có → response/error handler`.

Route xác định callback đúng tên. Controller lấy query/params/body, lấy actor từ session, chuyển cho service tương ứng và trả JSON. Nghiệp vụ chuyển/hủy, transaction, kho, lịch sử và email vẫn nằm trong service đã có; không có logic DB nào được chuyển vào controller.

Nhánh thành công của từng handler trả HTTP200. Danh sách giữ metadata ở cấp ngoài; bốn handler còn lại giữ kết quả trong `data`. Nhánh lỗi chuyển nguyên error cho `next`; middleware chung vẫn quyết định HTTP code và thông điệp công khai.

## E. Đánh giá phương án triển khai

- **Phù hợp kiến trúc:** thống nhất cấu trúc khai báo/export với Category và giữ Controller–Service–Model như quy tắc TechStore.
- **Lý do tách biến kết quả:** giúp breakpoint/đọc dữ liệu service trả về; không thay query, thuật toán hoặc hiệu năng DB.
- **Cách export:** `exports.x = ...` và `module.exports = { x }` đều đúng CommonJS. Cách mới được chọn để giữ style nhất quán, không vì cách cũ sai hoặc chậm.
- **Rủi ro thực sự của lần sửa:** đổi tên export có thể làm router gọi undefined; đã kiểm cả năm binding sau sửa. Những caller ngoài repo tự require tên cũ không được cam kết tương thích; trong repo đã tìm và cập nhật router liên quan.
- **Không phát sinh trùng lặp:** không thêm alias export cũ, wrapper, service mới hoặc test file chỉ để kiểm định dạng.
- **Phạm vi ảnh hưởng:** hai file BE và hai tài liệu. Không đổi dependency, biến môi trường, FE, schema hoặc bảo mật/điều kiện nghiệp vụ.
- **Giới hạn kết luận:** kiểm tra controller với service giả chứng minh ánh xạ/thông điệp tương đương; không được dùng để tuyên bố đã chạy lại transaction hoặc SMTP/DB tích hợp trong lượt này.

## F. Kiểm thử và nghiệm thu

| Kiểm tra | Kết quả mong đợi | Kết quả thực tế |
| --- | --- | --- |
| `node --check src/controllers/admin/orderController.js` trong BE | Parse thành công | Đạt |
| `node --check src/routes/admin/orderRoutes.js` trong BE | Parse thành công | Đạt |
| So sánh trước/sau bằng Node VM với snapshot controller trước khi sửa | Cùng service, cùng arguments, cùng HTTP status và JSON khi success; cùng error được next khi fail | Đạt 10 trường hợp: 5 handler × 2 nhánh success/error |
| Nạp router Express thật và so reference từng handler | Đủ năm method/path, callback khớp export mới | Đạt 5/5 binding, không chạy query DB |
| Tìm tham chiếu trong BE và cập nhật báo cáo cũ | Router/tài liệu dùng tên mới; tên cũ chỉ xuất hiện khi giải thích phần trước khi sửa | Đã đối chiếu |
| `git diff --check` | Không có lỗi whitespace | Đạt; Git chỉ cảnh báo chuẩn hóa LF/CRLF của một số file có sẵn |

Không thêm file test mới cho refactor này. Script kiểm tra tương đương được chạy tạm trong Node, chỉ mock ranh giới service và đọc router thực tế; không thay service trong source và không gửi email. Không chạy lại suite DB/FE trong tác vụ chuẩn hóa vì không sửa nghiệp vụ hoặc FE. Kết quả BE22/22 và FE25/25 trong báo cáo ngày14 là kết quả trước đó, không nhận thành test mới của lượt18.

**Đối chiếu cuối đã chạy:** đủ A–F, hai mục phân tích riêng cho hai file code và tám khối logic có đủ nhãn giải thích/trước–sau; tổng 50 liên kết nội bộ ở hai báo cáo đều tồn tại, không có khoảng trắng cuối dòng. Các tham chiếu controller trong báo cáo cũ đã cập nhật sang tên mới. Kết quả kiểm tài liệu không được tính thành test DB/SMTP hoặc FE.

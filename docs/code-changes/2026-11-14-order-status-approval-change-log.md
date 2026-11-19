# Báo cáo phân tích thay đổi mã nguồn: duyệt trạng thái đơn hàng

## A. Tổng quan chức năng

**Phạm vi báo cáo:** phân tích code thực tế trong working tree của TechStore, không phải kế hoạch hay nhật ký hoạt động. Gốc dự án là `C:/Users/USER/orca/workspaces/TechStore/Xây-dựng-chức-năng-duyệt-trạng-thái-đơn-hàng`; mọi đường dẫn dưới đây tính đầy đủ từ gốc này. Giữ tên tài liệu hiện có theo yêu cầu trực tiếp của người dùng.

**Yêu cầu ban đầu:** thay dữ liệu mẫu quản trị đơn bằng FE/BE thật, cho Admin/Staff duyệt tuần tự đến Shipping, hủy theo quyền/điều kiện thanh toán, lưu lịch sử và gửi email khi đang giao hoặc yêu cầu hủy thành công/thất bại có lý do. Completed và phần Shipper để nâng cấp sau.

**Vấn đề trong code trước sửa:** quản trị dùng localStorage/mock, gán trạng thái không được BE bảo vệ; hủy khách chưa khóa Order và chưa chống replay; thiếu dữ liệu hủy/history/email outbox; drawer lấy dữ liệu từ trang hiện tại nên có thể mất đơn sau đổi trạng thái.

**Code đã thực hiện:** bổ sung router/controller/service/model/migration/worker; nối hook và service FE với API; kiểm soát quyền, trạng thái, paid, transaction và hoàn kho; lưu kết quả hủy riêng khỏi history; xử lý retry email; cập nhật giao diện, CSV/in và request Postman. Các phần C–F chỉ phân tích phần có trong code hoặc kết quả kiểm chứng thật.

**Kết quả kiểm chứng đã có:** BE 22/22 test trên MySQL tạm; FE 25/25 test, lint và build thành công. Đã nghiệm thu trình duyệt desktop bằng tài khoản Staff trên fixture riêng: Processing → Shipping, drawer vẫn mở sau khi đơn rời bộ lọc, có history và email Chờ gửi, không có thao tác Completed. Chưa gửi email tới khách thật, chưa chạy collection Postman, chưa nghiệm thu mobile/in nhiều trang hoặc migration trên DB cửa hàng. Không coi toàn bộ việc triển khai vận hành đã hoàn tất chỉ từ kết quả test này.

**Căn cứ diff và ranh giới tác vụ:**

- Mốc đối chiếu: `65b49421c97e8dbecc7ce722bc32546239d2567f` (`HEAD`). Đây là thay đổi working tree, chưa có commit triển khai mới.
- Đã đọc `git diff HEAD`, `git diff --cached`, `git diff --name-only`, `git ls-files --others --exclude-standard`; các file mới được đọc và đối chiếu như phần thêm mới, gồm `git diff --no-index -- NUL <file>` cho module BE mới.
- Không có thay đổi staged tại thời điểm đối chiếu. Phạm vi mã nguồn/cấu hình/request thực thi là **46 file: 22 tạo mới, 24 sửa; không xóa file code**. Viết lại hook là sửa file đang theo dõi, không phải xóa một file rồi bàn giao thiếu file đó.
- `package-lock.json` ở gốc đã có một dòng bị xóa trước khi Agent bắt đầu; không tính vào thay đổi do Agent thực hiện, không nhận là thay đổi dependency của chức năng.
- `GLOSSARY.md`, ADR0004, tài liệu phỏng vấn/kế hoạch và báo cáo này là tài liệu hỗ trợ; không tính chúng thành file code. Các nội dung dự kiến trong tài liệu kế hoạch không được dùng làm bằng chứng đã triển khai.
- Các test/fixture dùng dữ liệu riêng; báo cáo không ghi mật khẩu, JWT, email thật hoặc giá trị cấu hình bí mật.

## B. Danh sách file mã nguồn thay đổi

Bảng bao gồm toàn bộ 46 file code/cấu hình/request đã tạo hoặc sửa trong tác vụ. Các file YAML Postman có script kiểm tra response nên cũng được tính vào phạm vi review. Không có file code bị xóa.

| File | Loại thay đổi | Thành phần thay đổi | Mục đích |
| --- | --- | --- | --- |
| [BE/package.json](<../BE/package.json>) | Sửa | scripts, dòng 10–12 | Cho developer chạy hai trách nhiệm vận hành độc lập với HTTP server. |
| [BE/src/app.js](<../BE/src/app.js>) | Sửa | app.use('/api/admin/orders'), dòng 64 | Đưa API quản trị mới vào ứng dụng thực tế. |
| [BE/src/controllers/admin/orderController.js](<../BE/src/controllers/admin/orderController.js>) | Tạo mới | getOrders; getOrderDetail; advanceOrder; bulkAdvanceOrders; cancelOrder; module.exports | Chuyển đầu vào HTTP thành lời gọi service; khai báo và export tập trung theo mẫu Category. |
| [BE/src/controllers/client/orderController.js](<../BE/src/controllers/client/orderController.js>) | Sửa | cancelOrderController, dòng 62 | Mang trạng thái đã xem và danh tính lần yêu cầu xuống service dùng chung. |
| [BE/src/middleware/errorHandler.js](<../BE/src/middleware/errorHandler.js>) | Sửa | errorHandler, dòng 4 | Cho FE phân biệt xung đột/kết quả hủy đã xác định nhưng không lộ lỗi hạ tầng. |
| [BE/src/middleware/requireOrderOperator.js](<../BE/src/middleware/requireOrderOperator.js>) | Tạo mới | Middleware export, dòng 3 | Cho Staff vận hành đơn hàng theo Q5 mà không nới quyền quản trị ngoài phạm vi. |
| [BE/src/migrations/addOrderStatusApproval.js](<../BE/src/migrations/addOrderStatusApproval.js>) | Tạo mới | migrate, dòng 4; entrypoint dòng 13 | Cung cấp bước chuẩn bị schema có thể gọi lại cho chức năng mới. |
| [BE/src/models/index.js](<../BE/src/models/index.js>) | Sửa | Imports dòng 13–15; associations 72–78; exports 187–189 | Giữ cách tổ chức quan hệ Sequelize tập trung và tên alias nhất quán. |
| [BE/src/models/orderCancellationAttemptModel.js](<../BE/src/models/orderCancellationAttemptModel.js>) | Tạo mới | sequelize.define, dòng 5 | Phân biệt một lần yêu cầu hủy với lần chuyển trạng thái thực sự. |
| [BE/src/models/orderEmailOutboxModel.js](<../BE/src/models/orderEmailOutboxModel.js>) | Tạo mới | sequelize.define, dòng 4 | Không đánh mất công việc email khi API đã trả thành công hoặc worker khởi động lại. |
| [BE/src/models/orderModel.js](<../BE/src/models/orderModel.js>) | Sửa | Các thuộc tính cancellation_reason/cancelled_by/cancelled_at, dòng 76–78 | Lưu thông tin hủy trực tiếp để đọc chi tiết mà không phải suy ra từ note/updated_at. |
| [BE/src/models/orderStatusHistoryModel.js](<../BE/src/models/orderStatusHistoryModel.js>) | Tạo mới | sequelize.define, dòng 4 | Cung cấp bằng chứng ai đã đổi gì, lúc nào. |
| [BE/src/routes/admin/orderRoutes.js](<../BE/src/routes/admin/orderRoutes.js>) | Tạo mới | router.use dòng 4; năm route dòng 5–9 | Đảm bảo không endpoint quản trị nào bỏ qua xác thực, quyền hoặc kiểm tra dữ liệu. |
| [BE/src/routes/client/orderRoutes.js](<../BE/src/routes/client/orderRoutes.js>) | Sửa | Import validator dòng 5; PUT /:id/cancel dòng 30 | Ngăn lệnh hủy thiếu định danh yêu cầu hoặc trạng thái nguồn đi vào DB. |
| [BE/src/services/admin/orderService.js](<../BE/src/services/admin/orderService.js>) | Tạo mới | serializeOrders:13; getOrders:28; getOrder:64; bulkAdvance:73 | Nối dữ liệu quan hệ BE vào component trước đó chờ shape mock. |
| [BE/src/services/client/emailService.js](<../BE/src/services/client/emailService.js>) | Sửa | createTransport dòng 3; export dòng 94 | Không sao chép cấu hình gửi thư và không để một SMTP treo giữ worker vô hạn. |
| [BE/src/services/client/orderService.js](<../BE/src/services/client/orderService.js>) | Sửa | createOrder:37; getOrdersByUser:265; cancelOrder:338 | Có một định danh dễ đọc nhất quán giữa API khách và quản trị. |
| [BE/src/services/orderEmailService.js](<../BE/src/services/orderEmailService.js>) | Tạo mới | queueOrderEmail:11; buildOrderEmail:22; claimEmail:37; processNextEmail:56 | Ghi công việc email dù không có SMTP ngay lúc xử lý đơn. |
| [BE/src/services/orderStatusService.js](<../BE/src/services/orderStatusService.js>) | Tạo mới | problem:9; loadActor:13; dataProblem:21; allowedActions:28; lockedOrder:40; advanceOrder:47; cancelOrder:69 | Tách tập giá trị hợp lệ trong enum với các cạnh nghiệp vụ được phép. |
| [BE/src/validators/adminOrderValidators.js](<../BE/src/validators/adminOrderValidators.js>) | Tạo mới | idRule:4; statusRules:5; cancelRules:6; listRules:11; bulkRules:22; validate:27 | Chặn payload không có hợp đồng rõ ràng trước transaction. |
| [BE/src/workers/orderEmailWorker.js](<../BE/src/workers/orderEmailWorker.js>) | Tạo mới | run dòng 9; xử lý signal dòng 5–7 | Gửi thư ngoài request và ngoài transaction nghiệp vụ. |
| [BE/tests/orderBrowserFixture.js](<../BE/tests/orderBrowserFixture.js>) | Tạo mới | database dòng 6; stop:13; run:20 | Kiểm UI với router/service/DB thật nhưng không gửi thư hoặc sửa dữ liệu cửa hàng. |
| [BE/tests/orderStatusApproval.test.js](<../BE/tests/orderStatusApproval.test.js>) | Tạo mới | before/after dòng 29–57; 12 test dòng 59–239 | Kiểm quy tắc tại ranh giới API thực, không chỉ mock helper nội bộ. |
| [FE/my-app/src/components/admin/orders/orderCancelModal.jsx](<../FE/my-app/src/components/admin/orders/orderCancelModal.jsx>) | Sửa | OrderCancelModal/handleSubmit; prop busy và textarea | Giảm gửi lặp từ thao tác liên tục và báo lỗi độ dài sớm ngay trên form. |
| [FE/my-app/src/components/admin/orders/orderDetailDrawer.jsx](<../FE/my-app/src/components/admin/orders/orderDetailDrawer.jsx>) | Sửa | OrderDetailDrawer; nextStatus dòng 47; section history/email từ dòng 125 | Làm giao diện khớp quyền và điều kiện payment hiện tại. |
| [FE/my-app/src/components/admin/orders/orderManagementHeader.jsx](<../FE/my-app/src/components/admin/orders/orderManagementHeader.jsx>) | Sửa | OrderManagementHeader; props và cụm nút | Loại thao tác không có ý nghĩa khi dữ liệu chuyển sang DB thật. |
| [FE/my-app/src/components/admin/orders/orderPrintModal.jsx](<../FE/my-app/src/components/admin/orders/orderPrintModal.jsx>) | Sửa | OrderPrintModal; style @media print dòng 22 và header/chữ ký | Phiếu in phản ánh đơn được chọn thay vì thông tin mẫu hoặc toàn dashboard. |
| [FE/my-app/src/components/admin/orders/orderTableRow.jsx](<../FE/my-app/src/components/admin/orders/orderTableRow.jsx>) | Sửa | OrderTableRow; statusConfig/paymentConfig, onError, nút xác nhận | Không gợi ý thao tác trên đơn dữ liệu thiếu hoặc phải chặn theo nghiệp vụ. |
| [FE/my-app/src/components/client/userProfile/OrderTrackingDrawer.jsx](<../FE/my-app/src/components/client/userProfile/OrderTrackingDrawer.jsx>) | Sửa | OrderTrackingDrawer; status/payment fallback và canCancel dòng 64 | Khách nhìn thấy dữ liệu không chắc chắn thay vì bị hướng dẫn theo giả định sai. |
| [FE/my-app/src/components/client/userProfile/OrderTrackingStepper.jsx](<../FE/my-app/src/components/client/userProfile/OrderTrackingStepper.jsx>) | Sửa | OrderTrackingStepper dòng 52; nhánh cancelled và timestamp hiện tại | Không tạo một lịch sử/thời gian mà DB chưa lưu. |
| [FE/my-app/src/components/client/userProfile/ProfileOrderCard.jsx](<../FE/my-app/src/components/client/userProfile/ProfileOrderCard.jsx>) | Sửa | ProfileOrderCard; statusInfo và canCancel | Đồng nhất quyền hủy giữa thẻ và drawer, gồm cả đơn cũ. |
| [FE/my-app/src/constants/orderStatus.js](<../FE/my-app/src/constants/orderStatus.js>) | Sửa | needsOrderReview dòng 109; canCustomerCancelOrder dòng 115 | Có một quy tắc hiển thị chung thay vì sửa hai component cùng lúc. |
| [FE/my-app/src/hooks/admin/useAdminOrders.js](<../FE/my-app/src/hooks/admin/useAdminOrders.js>) | Sửa | useAdminOrders dòng 5; effects danh sách/chi tiết; mutate và các handler | Không thao tác nhầm đơn đã bị ẩn khi thay tập kết quả. |
| [FE/my-app/src/hooks/client/useUserProfile.js](<../FE/my-app/src/hooks/client/useUserProfile.js>) | Sửa | cancelRequests/cancelBusy; executeCancelOrder từ dòng 97 | Bảo toàn một lần yêu cầu của khách giữa các lần gửi lại. |
| [FE/my-app/src/layouts/adminLayout.jsx](<../FE/my-app/src/layouts/adminLayout.jsx>) | Sửa | AdminLayoutInner effect và Outlet, dòng 58–92 | Bảo toàn state khi cập nhật tiêu chí và tránh mất drawer do loading của layout. |
| [FE/my-app/src/pages/admin/orders/orderManagement.jsx](<../FE/my-app/src/pages/admin/orders/orderManagement.jsx>) | Sửa | OrderManagement dòng 12; fieldset/error/bulkResult/detail status | Thể hiện trạng thái API và kết quả một phần rõ ràng thay vì chỉ toast thành công chung. |
| [FE/my-app/src/services/api/admin/orderService.js](<../FE/my-app/src/services/api/admin/orderService.js>) | Tạo mới | normalize:4; adminOrderService:5; exportOrdersCsv:28 | Đưa mock caller sang native Fetch API đúng hợp đồng BE. |
| [FE/my-app/src/services/api/client/orderService.js](<../FE/my-app/src/services/api/client/orderService.js>) | Sửa | orderService.cancelOrder dòng 15 | Làm caller hiện có tương thích yêu cầu chống replay của API. |
| [FE/my-app/tests/orderManagement.test.mjs](<../FE/my-app/tests/orderManagement.test.mjs>) | Tạo mới | Harness/mount dòng 10–37; sáu test dòng 39–150 | Đo hành vi hook khi API chậm/lỗi mà không mock implementation riêng của hook. |
| [postman/collections/TechStore API/Admin - Orders/advanceOrder.request.yaml](<../postman/collections/TechStore API/Admin - Orders/advanceOrder.request.yaml>) | Tạo mới | PATCH URL, JSON body và script afterResponse | Cho developer tái hiện contract advance mà không tự đoán tên trường. |
| [postman/collections/TechStore API/Admin - Orders/bulkAdvance.request.yaml](<../postman/collections/TechStore API/Admin - Orders/bulkAdvance.request.yaml>) | Tạo mới | POST bulk-status, orders array và script afterResponse | Mô tả chính xác shape bulk thay cho mảng ID trần của mock cũ. |
| [postman/collections/TechStore API/Admin - Orders/cancelOrder.request.yaml](<../postman/collections/TechStore API/Admin - Orders/cancelOrder.request.yaml>) | Tạo mới | PUT cancel, beforeRequest và afterResponse | Cho developer kiểm hủy có lý do và không hoàn kho/email lần nữa khi retry cùng ý định. |
| [postman/collections/TechStore API/Admin - Orders/getOrderDetail.request.yaml](<../postman/collections/TechStore API/Admin - Orders/getOrderDetail.request.yaml>) | Tạo mới | GET /api/admin/orders/{{order_id}} và afterResponse | Giúp review trực tiếp tài nguyên drawer độc lập với trang list. |
| [postman/collections/TechStore API/Admin - Orders/getOrders.request.yaml](<../postman/collections/TechStore API/Admin - Orders/getOrders.request.yaml>) | Tạo mới | GET query và afterResponse | Cho developer dùng được API dữ liệu thật theo shape FE đọc. |
| [postman/collections/TechStore API/Orders/cancelOrderAuthenticated.request.yaml](<../postman/collections/TechStore API/Orders/cancelOrderAuthenticated.request.yaml>) | Tạo mới | PUT client cancel, body và hai script | Cập nhật contract client cancel mà route mới đang bắt buộc. |
| [postman/collections/TechStore API/Orders/Cancel Order - Not Found.request.yaml](<../postman/collections/TechStore API/Orders/Cancel Order - Not Found.request.yaml>) | Sửa | Headers/body thêm trước scripts | Giữ ca kiểm thử âm đúng tầng đang muốn kiểm. |

## C. Phân tích chi tiết từng file code

### C.1. `BE/package.json`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/package.json`.
- **Vai trò:** Cấu hình các lệnh vận hành backend.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** scripts, dòng 10–12.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Hai script migrate:orders và worker:order-email

- **Trước khi sửa:** Chỉ có start/dev/seed/test; chưa có lệnh riêng cho cấu trúc duyệt đơn hoặc tiến trình gửi thông báo.
- **Đã thay đổi gì / sau khi sửa:** Thêm lệnh chạy addOrderStatusApproval.js và orderEmailWorker.js; không thêm dependency.
- **Logic hoạt động như thế nào:** npm chuyển điều khiển đến entrypoint migration hoặc worker tương ứng. Migration kết thúc sau khi cập nhật cấu trúc; worker tiếp tục xử lý outbox.
- **Mục đích:** Cho developer chạy hai trách nhiệm vận hành độc lập với HTTP server.
- **Phục vụ chức năng:** Cài đặt schema duyệt đơn và gửi email bền sau khi đơn đã commit.
- **Tại sao chọn cách này:** Worker riêng tránh bắt request duyệt chờ SMTP và tránh mỗi lần gửi đều đồng bộ schema.
- **Tác dụng cốt lõi:** Nếu không chạy worker thì email vẫn nằm trong outbox; có job không đồng nghĩa thư đã gửi.
- **Ảnh hưởng đến code khác:** Phụ thuộc hai entrypoint mới; dùng các biến DB và SMTP hiện có, không thay package-lock hay biến môi trường mới.

### C.2. `BE/src/app.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/app.js`.
- **Vai trò:** Khởi tạo Express và gắn router vào URL gốc.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** app.use('/api/admin/orders'), dòng 64.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Mount router quản trị đơn

- **Trước khi sửa:** Chỉ mount /api/orders cho khách; chưa có router quản trị đơn thật.
- **Đã thay đổi gì / sau khi sửa:** Mount routes/admin/orderRoutes dưới /api/admin/orders.
- **Logic hoạt động như thế nào:** Request khớp prefix được chuyển vào router mới, đi qua cookie/JWT, quyền người vận hành và validator trước controller.
- **Mục đích:** Đưa API quản trị mới vào ứng dụng thực tế.
- **Phục vụ chức năng:** Danh sách, chi tiết, duyệt, bulk và hủy quản trị.
- **Tại sao chọn cách này:** Gắn đúng composition root hiện có thay vì tạo Express server thứ hai hoặc nhét nghiệp vụ vào app.
- **Tác dụng cốt lõi:** Không mount thì các module mới tồn tại trên đĩa nhưng API vẫn trả 404.
- **Ảnh hưởng đến code khác:** Giữ router khách; errorHandler cuối app tiếp tục nhận lỗi từ router mới.

### C.3. `BE/src/controllers/admin/orderController.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/controllers/admin/orderController.js`.
- **Vai trò:** Adapter HTTP cho quản trị đơn, không chứa quy tắc chuyển trạng thái.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** getOrders; getOrderDetail; advanceOrder; bulkAdvanceOrders; cancelOrder và module.exports cuối file. Cách trình bày được chuẩn hóa theo Category trong [tác vụ ngày 18/11](./2026-11-18-thong-nhat-order-controller-code-review.md).

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### getOrders, getOrderDetail và khai báo/export controller

- **Trước khi sửa:** Chưa có handler quản trị đọc đơn từ database.
- **Đã thay đổi gì / sau khi sửa:** getOrders nhận req.query gọi orderService.getOrders và trả metadata ở cấp ngoài; getOrderDetail lấy id từ params, gọi orderService.getOrder và trả data. Các handler dùng const có tên đầy đủ, tách kết quả await ra biến và export tập trung bằng module.exports.
- **Logic hoạt động như thế nào:** getOrders → orderService.getOrders(filters) → HTTP200 với {success,data,total,page,limit,totalPages,countsByStatus}; getOrderDetail → orderService.getOrder(id) → HTTP200 với {success,data}. Cả hai bắt lỗi rồi next(error). Trước lần chuẩn hóa ngày 18/11, file dùng exports.list/exports.detail và try/catch rút gọn; kết quả JSON và service nhận dữ liệu vẫn giữ nguyên.
- **Mục đích:** Chuyển đầu vào HTTP thành lời gọi đọc dữ liệu, giữ response dễ dùng cho hook.
- **Phục vụ chức năng:** Bảng phân trang, số đếm và drawer lấy chi tiết độc lập với bộ lọc.
- **Tại sao chọn cách này:** Controller chỉ điều phối theo kiến trúc 3 lớp; query/join/DTO nằm trong service.
- **Tác dụng cốt lõi:** Giữ ranh giới HTTP và nghiệp vụ; tránh lặp truy vấn hoặc quy tắc dữ liệu trong handler.
- **Ảnh hưởng đến code khác:** routes/admin/orderRoutes, services/admin/orderService và adminOrderService FE phải thống nhất shape response.

##### advanceOrder

- **Trước khi sửa:** FE chỉ đổi trạng thái trong mock; không có HTTP handler thật.
- **Đã thay đổi gì / sau khi sửa:** Chuyển id, expected_status, target_status và req.user.id cho advanceOrder.
- **Logic hoạt động như thế nào:** Validator nhận payload trước; controller lấy actor từ session, await service rồi trả {success:true,data}; lỗi chuyển next.
- **Mục đích:** Nhận lệnh chuyển trạng thái mà không tin actor hoặc role do client khai.
- **Phục vụ chức năng:** Duyệt từng đơn đến Shipping.
- **Tại sao chọn cách này:** Trạng thái cũ từ client chỉ phục vụ phát hiện xung đột; service kiểm lại Order trong transaction.
- **Tác dụng cốt lõi:** Ngăn HTTP endpoint bỏ qua kiểm tra nguồn/đích hoặc quyền đã được đóng trong service.
- **Ảnh hưởng đến code khác:** orderStatusService.advanceOrder, validator statusRules và FE updateStatus.

##### bulkAdvanceOrders

- **Trước khi sửa:** Mock gán trực tiếp một trạng thái cho mọi ID.
- **Đã thay đổi gì / sau khi sửa:** Nhận orders/target_status và actor session, gọi bulkAdvance, trả kết quả từng đơn.
- **Logic hoạt động như thế nào:** Sau bulkRules, controller chuyển nguyên danh sách đã validate; service quyết định từng giao dịch và tổng kết.
- **Mục đích:** Cung cấp response thành công một phần thay vì báo thành công chung cho cả tập.
- **Phục vụ chức năng:** Duyệt/chuẩn bị nhiều đơn cùng lúc.
- **Tại sao chọn cách này:** Không cho controller mở một transaction bao toàn bộ bulk, vì Q9 yêu cầu các đơn hợp lệ không bị mất kết quả.
- **Tác dụng cốt lõi:** Giữ kết quả từng ID để UI trình bày chính xác đơn nào lỗi.
- **Ảnh hưởng đến code khác:** bulkAdvance, POST bulk-status và bulkResult trong useAdminOrders.

##### cancelOrder

- **Trước khi sửa:** Chưa có handler hủy đơn quản trị.
- **Đã thay đổi gì / sau khi sửa:** Truyền operator:true cùng id, actor, expected_status, request_id và reason cho cancelOrder.
- **Logic hoạt động như thế nào:** Service xác định hủy thành công hoặc từ chối đã commit attempt/outbox; controller chỉ trả success/data hoặc next(error).
- **Mục đích:** Phân biệt quyền quản trị với khách và bảo toàn mã chống xử lý lặp.
- **Phục vụ chức năng:** Hủy trước Shipping, lý do bắt buộc và email kết quả hủy.
- **Tại sao chọn cách này:** Dùng chung cancellation service thay vì sao chép logic kho của khách.
- **Tác dụng cốt lõi:** Nếu bỏ request_id/expected_status, API sẽ không bảo vệ đúng replay và dữ liệu cũ.
- **Ảnh hưởng đến code khác:** orderStatusService.cancelOrder, cancelRules(true), errorHandler và modal/hook quản trị.

### C.4. `BE/src/controllers/client/orderController.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/controllers/client/orderController.js`.
- **Vai trò:** Controller cho API đặt/xem/hủy đơn của khách.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** cancelOrderController, dòng 62.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Chuyển tiếp dữ liệu yêu cầu hủy

- **Trước khi sửa:** Handler chỉ chuyển orderId/userId cho service cũ.
- **Đã thay đổi gì / sau khi sửa:** Bổ sung expectedStatus, requestId, reason lấy từ body đã validate; không thay handler tạo đơn hoặc lấy danh sách.
- **Logic hoạt động như thế nào:** id từ params và userId từ cookie session kết hợp payload hủy; gọi client orderService rồi trả {success,data}, catch chuyển errorHandler.
- **Mục đích:** Mang trạng thái đã xem và danh tính lần yêu cầu xuống service dùng chung.
- **Phục vụ chức năng:** Khách tự hủy Pending an toàn và nhận email kết quả.
- **Tại sao chọn cách này:** Giữ đường dẫn API cũ, thay contract payload để chống hủy/hoàn kho trùng.
- **Tác dụng cốt lõi:** Controller không tự kết luận đơn được hủy; service vẫn kiểm ownership và dữ liệu hiện tại.
- **Ảnh hưởng đến code khác:** Client route thêm cancelRules; caller FE/Postman phải gửi hai trường mới. Caller cũ không gửi sẽ nhận 400.

### C.5. `BE/src/middleware/errorHandler.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/middleware/errorHandler.js`.
- **Vai trò:** Chuẩn hóa lỗi HTTP dùng chung toàn backend.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** errorHandler, dòng 4.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Thông điệp công khai và mã lỗi có kiểm soát

- **Trước khi sửa:** Trả trực tiếp err.message cho cả HTTP 500; response không có code nghiệp vụ.
- **Đã thay đổi gì / sau khi sửa:** Lỗi từ 500 trở lên trả thông điệp chung; code được trả với lỗi dưới 500 và riêng CANCELLATION_FAILED.
- **Logic hoạt động như thế nào:** Lấy statusCode/status hoặc 500 → chọn message an toàn → trả {success:false,message,code?}. Không trả stack hoặc raw lỗi DB/SMTP trong response 500.
- **Mục đích:** Cho FE phân biệt xung đột/kết quả hủy đã xác định nhưng không lộ lỗi hạ tầng.
- **Phục vụ chức năng:** Xử lý lỗi duyệt/hủy và retry an toàn; đồng thời ảnh hưởng các API khác dùng middleware này.
- **Tại sao chọn cách này:** Hủy thất bại đã được lưu cần code ổn định để FE bỏ mã cũ; các lỗi 500 không xác định không được coi là kết quả hủy chắc chắn.
- **Tác dụng cốt lõi:** Giảm lộ chi tiết nội bộ và tránh FE gửi lại cùng một yêu cầu đã biết chắc thất bại mãi mãi.
- **Ảnh hưởng đến code khác:** Toàn app dùng middleware; cách hiển thị lỗi server của đăng ký, sản phẩm và các API cũ cũng đổi thành thông điệp chung. Chưa kiểm SMTP OTP thật sau thay đổi transport.

### C.6. `BE/src/middleware/requireOrderOperator.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/middleware/requireOrderOperator.js`.
- **Vai trò:** Giới hạn router quản trị đơn cho Admin/Staff hoạt động.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** Middleware export, dòng 3.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Nạp lại quyền người vận hành

- **Trước khi sửa:** requireAdmin hiện có chỉ cho Admin; mở rộng trực tiếp sẽ ảnh hưởng quyền của router khác.
- **Đã thay đổi gì / sau khi sửa:** Gọi loadActor(req.user.id,true), gắn role đã đọc vào req.user và next; lỗi next(error).
- **Logic hoạt động như thế nào:** Chạy sau requireAuth nên có user.id; loadActor đọc users, kiểm status=1 và role admin/staff.
- **Mục đích:** Cho Staff vận hành đơn hàng theo Q5 mà không nới quyền quản trị ngoài phạm vi.
- **Phục vụ chức năng:** Phân quyền mọi API /api/admin/orders.
- **Tại sao chọn cách này:** Middleware chuyên biệt có ranh giới nhỏ hơn sửa requireAdmin dùng chung.
- **Tác dụng cốt lõi:** Thiếu middleware này, khách có session có thể tới controller quản trị hoặc Staff bị chặn toàn bộ nếu dùng guard cũ.
- **Ảnh hưởng đến code khác:** Phụ thuộc loadActor; service mutation tiếp tục tự kiểm actor để không dựa hoàn toàn vào router.

### C.7. `BE/src/migrations/addOrderStatusApproval.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/migrations/addOrderStatusApproval.js`.
- **Vai trò:** Thêm cấu trúc cần thiết mà không reset dữ liệu cửa hàng.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** migrate, dòng 4; entrypoint dòng 13.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Migration bổ sung cột và bảng

- **Trước khi sửa:** orders chưa có metadata hủy và chưa có history/attempt/outbox; dự án dùng runtime sync({alter:true}) và chưa có runner migration chuẩn.
- **Đã thay đổi gì / sau khi sửa:** describeTable orders; addColumn từng cột cancellation_reason/cancelled_by/cancelled_at nếu thiếu; sync ba model mới; entrypoint báo kết quả và đóng kết nối.
- **Logic hoạt động như thế nào:** Chỉ thêm phần vắng mặt; không đổi enum trạng thái, users.role, backfill hoặc seed. Có thể import migrate cho test mà không tự chạy entrypoint.
- **Mục đích:** Cung cấp bước chuẩn bị schema có thể gọi lại cho chức năng mới.
- **Phục vụ chức năng:** Lưu lý do hủy, lịch sử, idempotency và hàng đợi email.
- **Tại sao chọn cách này:** Kiểm tra cột trước khi thêm tránh lỗi cột trùng; sync riêng ba bảng tránh một lệnh alter toàn bộ schema trong script này.
- **Tác dụng cốt lõi:** Chạy code mới trên schema chưa có cột/bảng sẽ lỗi SQL; migration là điều kiện triển khai thực tế.
- **Ảnh hưởng đến code khác:** orders và ba bảng mới; runtime db.js vẫn có alter:true không được sửa trong tác vụ. Test đã gọi migration hai lần sau sequelize.sync, chưa thử đường nâng cấp một bản sao schema cũ thiếu cột hoặc chạy trên DB cửa hàng.

### C.8. `BE/src/models/index.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/models/index.js`.
- **Vai trò:** Điểm import/export model và khai báo association dùng chung.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** Imports dòng 13–15; associations 72–78; exports 187–189.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Đăng ký history, attempt và outbox

- **Trước khi sửa:** Order chỉ liên kết User/OrderItem; service không thể import ba model mới qua cổng chung.
- **Đã thay đổi gì / sau khi sửa:** Import/export ba model; khai báo Order.hasMany với alias status_history/cancellation_attempts/email_notifications và belongsTo ngược; history/attempt belongsTo User bằng actor_id.
- **Logic hoạt động như thế nào:** Nạp models/index đăng ký schema/associations; service truy vấn history include actor với alias đã khai báo; migration/test có thể dùng cùng model registry.
- **Mục đích:** Giữ cách tổ chức quan hệ Sequelize tập trung và tên alias nhất quán.
- **Phục vụ chức năng:** Lịch sử quản trị, kết quả hủy và thông báo theo từng Order.
- **Tại sao chọn cách này:** Dùng association chuẩn thay vì raw join rải trong controller hoặc mỗi service tự khai báo quan hệ.
- **Tác dụng cốt lõi:** Thiếu alias actor thì include lịch sử sẽ lỗi; thiếu export thì transaction/service không lấy được model.
- **Ảnh hưởng đến code khác:** Truy vấn quản trị, orderStatusService, orderEmailService, migration và sequelize.sync khi khởi động. Không thêm association/role Shipper.

### C.9. `BE/src/models/orderCancellationAttemptModel.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/models/orderCancellationAttemptModel.js`.
- **Vai trò:** Lưu kết quả của từng Cancellation Attempt.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** sequelize.define, dòng 5.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Snapshot kết quả và khóa duy nhất chống replay

- **Trước khi sửa:** Chưa có bản ghi riêng cho yêu cầu hủy thất bại; không có kết quả để trả lại khi client retry.
- **Đã thay đổi gì / sau khi sửa:** Thêm order_id, actor_id, request_id tối đa 64, fingerprint, response JSON, created_at; unique(order_id,actor_id,request_id).
- **Logic hoạt động như thế nào:** Service khóa Order trước, tìm attempt cùng scope; cùng fingerprint trả response cũ, khác fingerprint bị từ chối; yêu cầu mới ghi kết quả thành công hoặc thất bại.
- **Mục đích:** Phân biệt một lần yêu cầu hủy với lần chuyển trạng thái thực sự.
- **Phục vụ chức năng:** Idempotency hủy và email cả khi hủy bị từ chối.
- **Tại sao chọn cách này:** History chỉ phản ánh thay đổi thành công nên không phù hợp lưu business rejection; unique là hàng rào dữ liệu bổ sung ngoài khóa transaction.
- **Tác dụng cốt lõi:** Không có attempt thì request lặp có thể sinh email mới, không thể xác định kết quả sau mất phản hồi commit.
- **Ảnh hưởng đến code khác:** cancelOrder, quan hệ Order/User, event key cancel:<attempt.id>. response là kết quả nghiệp vụ, không phải raw exception hay credentials.

### C.10. `BE/src/models/orderEmailOutboxModel.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/models/orderEmailOutboxModel.js`.
- **Vai trò:** Lưu công việc gửi thông báo bền trong database.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** sequelize.define, dòng 4.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Định danh sự kiện, trạng thái retry và lease

- **Trước khi sửa:** Email chỉ có sendVerificationEmail chờ SMTP, không có bản ghi notification bền.
- **Đã thay đổi gì / sau khi sửa:** Thêm event_key unique, recipient/payload snapshot, status pending/sending/sent/failed/skipped, attempts, next_attempt_at, lease_until, lease_token, last_error và timestamps/index status+next_attempt_at.
- **Logic hoạt động như thế nào:** Transaction nghiệp vụ tạo pending hoặc skipped; worker claim đổi sending/tăng attempts/gắn lease; gửi ngoài transaction rồi cập nhật sent/pending/failed nếu lease_token vẫn khớp.
- **Mục đích:** Không đánh mất công việc email khi API đã trả thành công hoặc worker khởi động lại.
- **Phục vụ chức năng:** Email Shipping/kết quả hủy, retry hữu hạn và tình trạng gửi cho quản trị.
- **Tại sao chọn cách này:** Dùng MySQL sẵn có thay vì thêm Redis/queue service; event_key chống tạo nhiều job cho cùng một sự kiện.
- **Tác dụng cốt lõi:** Tách độ tin cậy nghiệp vụ và SMTP. Thiếu lease, nhiều worker có thể nhận cùng job; thiếu unique, replay có thể tạo nhiều thông báo.
- **Ảnh hưởng đến code khác:** queueOrderEmail, claimEmail/processNextEmail, worker và drawer quản trị. Payload có thông tin đơn/địa chỉ nhận nên API khách không được trả bảng này; không chứa mật khẩu SMTP.


### C.11. `BE/src/models/orderModel.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/models/orderModel.js`.
- **Vai trò:** Khai báo cấu trúc bảng orders.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** Các thuộc tính cancellation_reason/cancelled_by/cancelled_at, dòng 76–78.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Metadata hủy trên Order

- **Trước khi sửa:** Order chỉ có order_status/note, không có lý do, người hoặc thời điểm hủy.
- **Đã thay đổi gì / sau khi sửa:** Thêm cancellation_reason STRING(1000), cancelled_by INTEGER và cancelled_at DATE, đều nullable; giữ nguyên enum sáu trạng thái và trường thanh toán.
- **Logic hoạt động như thế nào:** cancelOrder chỉ gán ba giá trị khi hủy thực sự thành công; đơn cũ giữ null. Client chỉ được lấy lý do/thời điểm, actor đầy đủ đọc qua history quản trị.
- **Mục đích:** Lưu thông tin hủy trực tiếp để đọc chi tiết mà không phải suy ra từ note/updated_at.
- **Phục vụ chức năng:** Hiển thị lý do hủy và thời gian có bằng chứng.
- **Tại sao chọn cách này:** Nullable giữ tương thích dữ liệu cũ; không backfill lịch sử không tồn tại. cancelled_by là ID, không ghi tên giả vào dữ liệu.
- **Tác dụng cốt lõi:** Phân biệt thời điểm hủy với ngày tạo hoặc lần sửa Order khác.
- **Ảnh hưởng đến code khác:** Migration, cancelOrder, getOrdersByUser, drawer/stepper. cancelled_by chưa có association riêng trong Order; tên người thao tác lấy qua OrderStatusHistory.actor.

### C.12. `BE/src/models/orderStatusHistoryModel.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/models/orderStatusHistoryModel.js`.
- **Vai trò:** Khai báo bảng lịch sử chuyển trạng thái thành công.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** sequelize.define, dòng 4.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Lưu cạnh chuyển và người thực hiện

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Tạo order_id, actor_id, from_status, to_status, reason, created_at; không có updated_at; thêm index order_id/id.
- **Logic hoạt động như thế nào:** advanceOrder/cancelOrder tạo history trong cùng transaction với Order. API quản trị đọc theo ID tăng dần, include actor; API khách chỉ trích thời điểm phù hợp trạng thái hiện tại.
- **Mục đích:** Cung cấp bằng chứng ai đã đổi gì, lúc nào.
- **Phục vụ chức năng:** Timeline quản trị và thời điểm trạng thái cho khách.
- **Tại sao chọn cách này:** History là bản ghi sự kiện thay vì ghi đè trên Order; không có cập nhật lịch sử trong các service mới.
- **Tác dụng cốt lõi:** Không ghi history cho hủy bị từ chối; nếu thiếu phân biệt này timeline sẽ báo sai rằng đơn đã đổi trạng thái.
- **Ảnh hưởng đến code khác:** models/index khai báo FK/alias; service nghiệp vụ và hai API đọc dùng bảng này. Index phục vụ truy vấn theo Order, chưa có chính sách lưu trữ dài hạn.

### C.13. `BE/src/routes/admin/orderRoutes.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/routes/admin/orderRoutes.js`.
- **Vai trò:** Định tuyến HTTP quản trị đơn và sắp thứ tự middleware.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** router.use dòng 4; năm route dòng 5–9.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Guard chung và năm endpoint

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Thêm GET /, GET /:id, PATCH /:id/status, POST /bulk-status và PUT /:id/cancel dưới prefix /api/admin/orders.
- **Logic hoạt động như thế nào:** Mọi request chạy requireAuth → requireOrderOperator → rules tương ứng → validate → controller. GET danh sách dùng listRules; detail dùng idRule; status dùng statusRules; bulk dùng bulkRules; cancel dùng cancelRules(true).
- **Mục đích:** Đảm bảo không endpoint quản trị nào bỏ qua xác thực, quyền hoặc kiểm tra dữ liệu.
- **Phục vụ chức năng:** Toàn bộ API quản trị đơn thật.
- **Tại sao chọn cách này:** Guard đặt một lần ở router.use giảm nguy cơ quên ở route mới; route tĩnh bulk-status đặt rõ trước tham số ID.
- **Tác dụng cốt lõi:** URL/verb quyết định luồng xử lý, nhưng router không quyết định cạnh chuyển hay sửa kho.
- **Ảnh hưởng đến code khác:** app.js mount prefix, validators và controller mới; không có route Completed, Shipper hoặc chỉnh payment_status.

### C.14. `BE/src/routes/client/orderRoutes.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/routes/client/orderRoutes.js`.
- **Vai trò:** Router đơn hàng dành cho khách.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** Import validator dòng 5; PUT /:id/cancel dòng 30.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Validation contract hủy khách

- **Trước khi sửa:** PUT cancel chỉ có requireAuth rồi tới controller, không kiểm payload chống lặp.
- **Đã thay đổi gì / sau khi sửa:** Chèn cancelRules() và validate trước cancelOrderController; giữ URL/verb và các route tạo/xem đơn.
- **Logic hoạt động như thế nào:** Sau JWT, kiểm ID dương, request_id và expected_status; reason tùy chọn. Payload sai trả 400 trước khi tạo Cancellation Attempt.
- **Mục đích:** Ngăn lệnh hủy thiếu định danh yêu cầu hoặc trạng thái nguồn đi vào DB.
- **Phục vụ chức năng:** Hủy đơn của chính khách an toàn trước replay.
- **Tại sao chọn cách này:** Tái sử dụng factory rule với operator=false thay vì copy cùng validator; quyền ownership vẫn phải kiểm trong service.
- **Tác dụng cốt lõi:** Client cũ gửi PUT không body sẽ bị từ chối; FE và Postman trong tác vụ đã được cập nhật contract.
- **Ảnh hưởng đến code khác:** Client controller/service, FE cancelOrder và request Postman. Dùng validator đặt trong file tên adminOrderValidators là chia sẻ code thực tế, không đồng nghĩa mở quyền quản trị cho route khách.

### C.15. `BE/src/services/admin/orderService.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/services/admin/orderService.js`.
- **Vai trò:** Query/DTO và điều phối bulk của quản trị.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** serializeOrders:13; getOrders:28; getOrder:64; bulkAdvance:73.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### itemInclude và serializeOrders

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Include OrderItem → ProductVariant → Product/attributeValues; gom product IDs để đọc ảnh; chuyển kết quả thành DTO phẳng và thêm allowedActions/TS-{id}.
- **Logic hoạt động như thế nào:** Giá, số lượng, thành tiền lấy OrderItem; tên/SKU/thuộc tính lấy quan hệ hiện có; ảnh ưu tiên đúng variant rồi ảnh của product. Không có ảnh trả null để FE dùng fallback nội bộ.
- **Mục đích:** Nối dữ liệu quan hệ BE vào component trước đó chờ shape mock.
- **Phục vụ chức năng:** Bảng đơn, drawer, CSV và phiếu in thật.
- **Tại sao chọn cách này:** Adapter ở service tránh viết lại mọi component; truy vấn ảnh một lần cho tập product thay vì một lần mỗi item.
- **Tác dụng cốt lõi:** Giữ nguồn giá chốt từ OrderItem; không dùng giá hiện tại của Variant thay tiền đơn.
- **Ảnh hưởng đến code khác:** API quản trị, imageHelper FE và allowedActions. Tên/SKU là dữ liệu hiện tại, chưa có snapshot tên sản phẩm tại thời điểm mua; sản phẩm đổi tên có thể đổi tên hiển thị của đơn cũ.

##### getOrders

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Xây where từ status/paymentMethod/paymentStatus/search/dateRange; tìm mã, người nhận, điện thoại, email và nhãn TS-ID; đếm và phân trang tại BE.
- **Logic hoạt động như thế nào:** Escape ký tự LIKE → áp filter → count không join → đọc group count toàn bộ trạng thái → clamp page → sort allowlist kèm ID → query Order có limit/offset → serialize. Ngày bắt đầu tính theo UTC+7.
- **Mục đích:** Không lọc/sort một trang mock rồi bỏ sót đơn ngoài trang.
- **Phục vụ chức năng:** Search/filter/sort/8 đơn mỗi trang và badge trạng thái.
- **Tại sao chọn cách này:** Count trên orders tránh nhân tổng bởi item/history; tách badge toàn cục với total sau lọc giữ hành vi đã chốt.
- **Tác dụng cốt lõi:** Total, trang và dữ liệu phải cùng tiêu chí lọc; ID phụ làm sort ổn định khi trùng giá/thời điểm.
- **Ảnh hưởng đến code khác:** listRules, orderController.getOrders, hook metadata và bảng FE. Cách tìm LIKE nhiều cột có thể tốn chi phí khi dữ liệu lớn; chưa benchmark quy mô lớn.

##### getOrder

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Đọc Order theo ID độc lập danh sách; trả history kèm actor và tình trạng email.
- **Logic hoạt động như thế nào:** Không tìm thấy trả 404; serialize Order; query history tăng dần theo ID, include actor id/name/role; query outbox chỉ các trường đã chọn, giảm dần theo ID.
- **Mục đích:** Giữ drawer có dữ liệu ngay cả khi đơn rời filter/trang hiện tại.
- **Phục vụ chức năng:** Chi tiết, lịch sử và theo dõi gửi email của Admin/Staff.
- **Tại sao chọn cách này:** Endpoint riêng tách vòng đời chi tiết khỏi kết quả phân trang.
- **Tác dụng cốt lõi:** Không dựa vào orders.find ở trang hiện tại để xác định chi tiết còn tồn tại hay không.
- **Ảnh hưởng đến code khác:** Hook effect tải detail, drawer history/email. Endpoint nằm sau guard quản trị; API khách không gọi service này.

##### bulkAdvance

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Duyệt từng Order trong vòng lặp, thu success/message/code và tổng updatedCount/failedCount.
- **Logic hoạt động như thế nào:** Mỗi phần tử gọi advanceOrder riêng với actor/expectedStatus/target; lỗi một phần tử được chuyển thành kết quả công khai, vòng lặp tiếp tục.
- **Mục đích:** Đáp ứng thành công một phần và hiển thị lý do từng đơn.
- **Phục vụ chức năng:** Duyệt/chuẩn bị hàng loạt tối đa tám đơn.
- **Tại sao chọn cách này:** Transaction riêng từng đơn thay vì all-or-nothing; xử lý tuần tự làm luồng dễ kiểm tra với giới hạn nhỏ.
- **Tác dụng cốt lõi:** Một đơn Cancelled hoặc stale không rollback các đơn hợp lệ khác.
- **Ảnh hưởng đến code khác:** POST bulk-status, bulkRules và bảng bulkResult FE. loadActor được gọi lại theo mỗi mutation, thêm truy vấn nhưng giữ service tự bảo vệ.

### C.16. `BE/src/services/client/emailService.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/services/client/emailService.js`.
- **Vai trò:** Transport SMTP dùng chung và email OTP đăng ký hiện có.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** createTransport dòng 3; export dòng 94.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Tái sử dụng transport, timeout và xác minh TLS

- **Trước khi sửa:** Transport chỉ dùng nội bộ OTP, secure=false cố định và bỏ kiểm tra chứng chỉ TLS; chưa có timeout tường minh.
- **Đã thay đổi gì / sau khi sửa:** Export createTransport; secure=true khi port 465; timeout kết nối/chào 15 giây, socket 45 giây; rejectUnauthorized=true. Giữ API sendVerificationEmail/template OTP.
- **Logic hoạt động như thế nào:** Transport đọc SMTP_* và MAIL_FROM hiện có, thiếu cấu hình thì throw; worker tạo transport khi gửi, OTP vẫn gọi cùng factory.
- **Mục đích:** Không sao chép cấu hình gửi thư và không để một SMTP treo giữ worker vô hạn.
- **Phục vụ chức năng:** Gửi thông báo đơn hàng đồng thời bảo toàn API email OTP.
- **Tại sao chọn cách này:** Dùng Nodemailer đã có; xác minh certificate giúp tránh chấp nhận máy chủ giả. Timeout cần nhỏ hơn lease job trong vận hành thông thường.
- **Tác dụng cốt lõi:** Lỗi SMTP xảy ra ngoài transaction đơn; thiếu cấu hình không khiến việc duyệt đã commit bị hoàn tác.
- **Ảnh hưởng đến code khác:** orderEmailService và đăng ký OTP đều chịu cấu hình TLS/timeout mới. SMTP dùng certificate tự ký có thể bị từ chối; chưa kiểm vận hành OTP/SMTP thật với cấu hình người dùng.

### C.17. `BE/src/services/client/orderService.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/services/client/orderService.js`.
- **Vai trò:** Tạo/xem/hủy đơn ở phía khách, nối quy tắc hủy dùng chung.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** createOrder:37; getOrdersByUser:265; cancelOrder:338.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Mã hiển thị dự phòng trong createOrder/getOrdersByUser

- **Trước khi sửa:** Order có order_code null nên caller phải tự đoán nhãn hoặc hiển thị trống.
- **Đã thay đổi gì / sau khi sửa:** Nếu order_code rỗng/null, gán TS-{id} vào object response sau query, không update cột DB.
- **Logic hoạt động như thế nào:** Query Order → to plain object → dùng mã có sẵn hoặc nhãn theo primary key → trả caller.
- **Mục đích:** Có một định danh dễ đọc nhất quán giữa API khách và quản trị.
- **Phục vụ chức năng:** Màn đặt đơn thành công/danh sách/theo dõi đơn.
- **Tại sao chọn cách này:** Không tự backfill hoặc thay mã cũ; ID duy nhất đã có đủ cho nhãn dự phòng.
- **Tác dụng cốt lõi:** Phân biệt mã hiển thị với thao tác đổi dữ liệu Order thật.
- **Ảnh hưởng đến code khác:** Caller đọc order_code, email/DTO quản trị dùng cùng quy ước. Logic checkout giá/trừ kho hiện có không bị thay bởi đoạn sửa này.

##### getOrdersByUser: dữ liệu hủy và thời điểm có bằng chứng

- **Trước khi sửa:** API không trả lý do/thời điểm hủy; UI lấy updated_at hoặc created_at để làm ngày chuyển.
- **Đã thay đổi gì / sau khi sửa:** Chọn cancellation_reason/cancelled_at; đọc history của các order đã thuộc user rồi bổ sung status_changed_at từ entry mới nhất có to_status khớp.
- **Logic hoạt động như thế nào:** where user_id giới hạn sở hữu → query items → query history chỉ lấy order_id/to_status/created_at → map thời điểm hoặc null; không trả actor/history/outbox.
- **Mục đích:** Hiển thị thời điểm thật và lý do hủy mà không công khai hoạt động nội bộ.
- **Phục vụ chức năng:** Theo dõi đơn và Q18/Q19 về dữ liệu cũ.
- **Tại sao chọn cách này:** updated_at có thể đổi vì thông tin khác; created_at không phải bằng chứng giao/hủy. Null minh bạch hơn dựng mốc giả.
- **Tác dụng cốt lõi:** Ngăn khách hiểu nhầm ngày tạo thành ngày giao hàng hoặc xem tên nhân viên.
- **Ảnh hưởng đến code khác:** OrderTrackingStepper/Drawer; vẫn lấy toàn bộ đơn và history tương ứng của user. Map hiện dùng find lặp nên cần cân nhắc Map theo Order khi dữ liệu lịch sử lớn.

##### cancelOrder wrapper

- **Trước khi sửa:** Có transaction hủy riêng, không khóa Order, không chống replay và chỉ save order_status sau increment kho.
- **Đã thay đổi gì / sau khi sửa:** Thay bằng lời gọi orderStatusService.cancelOrder với actorId=userId, operator mặc định false, expectedStatus/requestId/reason.
- **Logic hoạt động như thế nào:** Service chung kiểm user đang hoạt động và ownership, chỉ Pending/chưa paid, xử lý kho/history/attempt/outbox trong transaction.
- **Mục đích:** Dùng một nguồn quy tắc hủy cho khách và quản trị.
- **Phục vụ chức năng:** Hủy khách không hoàn kho lặp, có thông báo kết quả và lý do từ chối.
- **Tại sao chọn cách này:** Giữ public module/API cũ giúp controller ổn định nhưng loại hai implementation tồn kho dễ lệch nhau.
- **Tác dụng cốt lõi:** Giới hạn khách nằm trong service, không chỉ ở việc ẩn nút FE.
- **Ảnh hưởng đến code khác:** Controller khách, mã yêu cầu FE, validator và Postman. Wrapper chỉ điều phối, không còn tự cập nhật DB.

### C.18. `BE/src/services/orderEmailService.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/services/orderEmailService.js`.
- **Vai trò:** Tạo outbox, dựng nội dung email và xử lý một job gửi.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** queueOrderEmail:11; buildOrderEmail:22; claimEmail:37; processNextEmail:56.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### queueOrderEmail và validEmail

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Chọn recipient từ receiver_email.trim hoặc email tài khoản nếu trống; validate định dạng tối thiểu/độ dài; tạo payload snapshot và status pending/skipped.
- **Logic hoạt động như thế nào:** Nhận Order/eventKey/event/reason/transaction → đọc email tài khoản → ưu tiên email Order → tạo outbox cùng transaction; thiếu địa chỉ ghi MISSING_VALID_RECIPIENT.
- **Mục đích:** Ghi công việc email dù không có SMTP ngay lúc xử lý đơn.
- **Phục vụ chức năng:** Email Shipping, cancel thành công và cancel thất bại.
- **Tại sao chọn cách này:** Địa chỉ snapshot không thay đổi theo profile sau này; skipped không retry vô ích nhưng không chặn nghiệp vụ.
- **Tác dụng cốt lõi:** Trạng thái đơn không phụ thuộc việc khách có nhập email checkout. Email Order không hợp lệ nhưng không trống sẽ bị skipped, không tự đổi sang tài khoản.
- **Ảnh hưởng đến code khác:** User, Outbox và orderStatusService. Helper kiểm email là kiểm tra thực dụng, không cam kết địa chỉ tồn tại/hộp thư nhận được.

##### buildOrderEmail và escapeHtml

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Chỉ nhận event shipping/cancelled/cancel_failed; tạo subject, text/HTML tiếng Việt và messageId ổn định theo job.
- **Logic hoạt động như thế nào:** Lấy mã đơn/lý do/thời điểm snapshot → format UTC+7 → bỏ CR/LF khỏi mã trong subject → escape HTML nội dung → trả mail cho transport.
- **Mục đích:** Thông báo kết quả dễ hiểu và không chèn HTML do reason/order_code chứa ký tự đặc biệt.
- **Phục vụ chức năng:** Khách biết đang giao hoặc hủy thất bại vì sao; không email Confirmed/Processing.
- **Tại sao chọn cách này:** Template tối thiểu dùng chung ba event, không đưa actor/history nội bộ vào payload.
- **Tác dụng cốt lõi:** Failure reason là thông điệp công khai từ service; không đưa raw exception vào thư.
- **Ảnh hưởng đến code khác:** Nodemailer/worker; Completed chưa có template/trigger trong code hiện tại, đúng giới hạn Shipper nâng cấp sau.

##### claimEmail

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Claim job pending đến hạn hoặc sending hết lease bằng row lock/skipLocked; tăng attempts, cấp lease_token và hạn 120 giây.
- **Logic hoạt động như thế nào:** Transaction chọn job ID nhỏ nhất đủ điều kiện → nếu đã thử ba lần thì failed → nếu còn lượt thì sending và commit snapshot; không gửi SMTP trong transaction này.
- **Mục đích:** Tránh hai worker cùng nhận một job và cho phép thu hồi job bị bỏ dở.
- **Phục vụ chức năng:** Retry bền và phục hồi sau restart.
- **Tại sao chọn cách này:** Dùng khóa/lease trong MySQL sẵn có; không cần dịch vụ hàng đợi mới.
- **Tác dụng cốt lõi:** Thiếu lease/token, worker cũ có thể ghi đè kết quả worker đã nhận lại job.
- **Ảnh hưởng đến code khác:** Outbox model/index; phụ thuộc dialect MySQL hỗ trợ skipLocked. Test đã mô phỏng lease hết hạn, chưa chạy kịch bản kill/restart nhiều tiến trình thực.

##### processNextEmail

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Gọi sendMail được inject khi test hoặc transport thật; cập nhật sent nếu không bị reject, lỗi thì pending/failed với mã an toàn.
- **Logic hoạt động như thế nào:** Claim → dựng thư/gửi ngoài transaction → nếu lỗi, hẹn now+60 giây×attempts²; attempt thứ ba failed → update với điều kiện id/lease_token. Thiếu job trả false cho worker nghỉ.
- **Mục đích:** Retry hữu hạn mà không đổi Order/kho hoặc lưu SMTP error chứa dữ liệu nhạy cảm.
- **Phục vụ chức năng:** Tình trạng email hiển thị cho quản trị và gửi lại tự động.
- **Tại sao chọn cách này:** Giới hạn ba lần chống retry vô hạn; chỉ lưu mã SMTP_DELIVERY_FAILED/DELIVERY_NOT_CONFIRMED.
- **Tác dụng cốt lõi:** Đã gửi SMTP khác với cập nhật Order. Mất ACK sau SMTP nhận có thể gửi trùng khi retry; messageId không bảo đảm exactly-once ở hộp thư.
- **Ảnh hưởng đến code khác:** Worker, transport và outbox. Test inject sendMail nên không chứng minh kết nối SMTP thật hoặc thư vào inbox.

### C.19. `BE/src/services/orderStatusService.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/services/orderStatusService.js`.
- **Vai trò:** Nguồn quy tắc chuyển/hủy đơn và transaction dùng chung.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** problem:9; loadActor:13; dataProblem:21; allowedActions:28; lockedOrder:40; advanceOrder:47; cancelOrder:69.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### STATUSES/NEXT/CANCELLABLE và problem

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Giữ sáu trạng thái đọc, nhưng NEXT chỉ có pending→confirmed→processing→shipping; hủy quản trị chỉ ba trạng thái trước Shipping; problem tạo Error có statusCode/code.
- **Logic hoạt động như thế nào:** Hàm mutation tra NEXT thay vì tin target client; Completed/Cancelled không có cạnh tiến. Lỗi nghiệp vụ đi qua controller/errorHandler với mã ổn định.
- **Mục đích:** Tách tập giá trị hợp lệ trong enum với các cạnh nghiệp vụ được phép.
- **Phục vụ chức năng:** Admin/Staff dừng ở Shipping, không bỏ bước/quay lùi.
- **Tại sao chọn cách này:** Một bảng chuyển nhỏ dễ đọc/kiểm thử hơn nhiều nhánh rải giữa các route; không thêm state machine tổng quát chưa cần.
- **Tác dụng cốt lõi:** DB enum cho phép lưu Completed không có nghĩa Admin có quyền chuyển tới Completed.
- **Ảnh hưởng đến code khác:** Validator dùng STATUSES, DTO dùng allowedActions, API status/bulk/hủy dùng các quy tắc này.

##### loadActor

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Đọc id/role/status từ users và chỉ chấp nhận tài khoản hoạt động; operator=true yêu cầu admin hoặc staff.
- **Logic hoạt động như thế nào:** Nhận actor ID từ session → findByPk → trả actor hoặc 403. Mutation gọi lại, middleware quản trị cũng dùng.
- **Mục đích:** Không tin role từ client/JWT cũ và khóa tài khoản đã bị vô hiệu hóa khỏi thao tác mới.
- **Phục vụ chức năng:** Quyền người vận hành và khách hủy đơn.
- **Tại sao chọn cách này:** Service tự bảo vệ dù được gọi ngoài router; read DB có thêm chi phí nhưng tránh chỉ dựa UI.
- **Tác dụng cốt lõi:** Không phân quyền bằng việc ẩn nút; trạng thái tài khoản hiện tại được xét trước mutation.
- **Ảnh hưởng đến code khác:** requireOrderOperator, advanceOrder/cancelOrder. Chưa có vai trò Shipper mới; quyền được nạp trước transaction Order, không khóa user cùng transaction.

##### dataProblem và allowedActions

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Xác định Order có status/payment_status/payment_method không nhận diện; tính needs_review, next_status, can_cancel và action_reason.
- **Logic hoạt động như thế nào:** Dữ liệu thiếu → không có next/cancel; dữ liệu đủ → tra NEXT; nếu bước Shipping là online chưa paid thì chặn next và trả lý do; can_cancel yêu cầu trước Shipping và chưa paid.
- **Mục đích:** Cho FE render đúng hành động và cảnh báo dữ liệu cũ.
- **Phục vụ chức năng:** Nút duyệt/hủy, legacy Cần kiểm tra, online phải trả tiền trước giao.
- **Tại sao chọn cách này:** Tính quyền từ dữ liệu BE giảm suy luận khác nhau giữa row và drawer. Mutation vẫn kiểm lại sau lock vì DTO có thể cũ.
- **Tác dụng cốt lõi:** Không suy null thành Pending/COD hoặc tự đánh dấu thanh toán.
- **Ảnh hưởng đến code khác:** serializeOrders và FE next_status/can_cancel; guard actor là trách nhiệm riêng, DTO này không tự thay thế quyền route.

##### lockedOrder và advanceOrder

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Khóa Order FOR UPDATE, đối chiếu expectedStatus, kiểm cạnh/phương thức/paid, rồi cập nhật Order + history + shipping outbox cùng transaction.
- **Logic hoạt động như thế nào:** Nạp actor có quyền → transaction → lock theo ID → so trạng thái đã xem → dataProblem → NEXT khớp target → online shipping phải paid → save trạng thái → history → chỉ shipping tạo email → commit.
- **Mục đích:** Giữ nhất quán khi hai nhân viên cùng duyệt hoặc khách hủy đồng thời.
- **Phục vụ chức năng:** Ba cạnh tiến hợp lệ và email Đang giao.
- **Tại sao chọn cách này:** Một transaction kết hợp row lock giải quyết race, không dựa việc nút FE disabled. Queue email là ghi DB; SMTP chạy sau bằng worker.
- **Tác dụng cốt lõi:** Hai request từ cùng trạng thái không thể cùng tiến hai bước; lỗi ghi history/outbox rollback mutation. COD sang Shipping không tự paid và không trừ kho lại.
- **Ảnh hưởng đến code khác:** Order, History, Outbox; HTTP status/bulk và FE refresh sau xung đột.

##### cancelOrder: fingerprint và replay

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Tạo SHA-256 từ expectedStatus/reason/operator; khóa Order trước khi tìm attempt cùng order/actor/request_id.
- **Logic hoạt động như thế nào:** Sau quyền/ownership, nếu attempt tồn tại thì so fingerprint: khớp trả response cũ, khác trả REQUEST_REUSED. Chỉ yêu cầu mới đi tiếp kiểm điều kiện và sửa kho.
- **Mục đích:** Định danh lần yêu cầu để retry mạng không biến thành một lần hủy mới.
- **Phục vụ chức năng:** Hủy an toàn khi double-click, retry hoặc mất phản hồi.
- **Tại sao chọn cách này:** Key scope theo Order/actor và unique index là hàng rào bền; một hash nội dung ràng buộc cùng key không dùng cho payload khác.
- **Tác dụng cốt lõi:** Không hoàn kho, tạo history hay email lặp với cùng request. Key mới là lần yêu cầu mới và có thể nhận email từ chối riêng.
- **Ảnh hưởng đến code khác:** Attempt model, request_id ở FE/Postman. request_id được validator bắt buộc; các lời gọi service nội bộ cần giữ contract này.

##### cancelOrder: kiểm nghiệp vụ, gom số lượng và hoàn kho

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Kiểm dữ liệu đủ, expectedStatus, chưa paid, phạm vi hủy theo operator; kiểm items, tổng quantity theo variant, sold_count và giới hạn int trước khi sửa.
- **Logic hoạt động như thế nào:** Đọc items → gom bằng Map để xử lý SKU lặp → khóa variants theo ID tăng → validate toàn bộ → increment stock và decrement sold_count → update Cancelled/reason/actor/time → history.
- **Mục đích:** Hủy đúng quyền và đảo lượng tồn kho đã ghi khi tạo đơn đúng một lần.
- **Phục vụ chức năng:** Hủy khách Pending hoặc quản trị Pending/Confirmed/Processing.
- **Tại sao chọn cách này:** Khóa theo thứ tự ổn định giảm deadlock; kiểm toàn bộ trước increment tránh quyết định từ chối sau khi mới hoàn một phần. SQL thay đổi vẫn nằm trong transaction.
- **Tác dụng cốt lõi:** Nếu thiếu kiểm quantity/sold_count/overflow thì dữ liệu cũ sai có thể làm âm số bán hoặc hỏng kho. Nếu hủy bị từ chối, không có cập nhật Order/kho/history.
- **Ảnh hưởng đến code khác:** OrderItem và ProductVariant hiện có; không sửa giá hoặc khâu trừ kho của createOrder. Lý do quản trị bắt buộc, khách tùy chọn.

##### cancelOrder: kết quả thất bại và email độc lập history

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Lưu response success hoặc CANCELLATION_REJECTED; tạo attempt rồi outbox cancel:<id> với cancelled/cancel_failed.
- **Logic hoạt động như thế nào:** Business rejection không throw trong callback transaction: commit attempt/outbox, sau đó mới chuyển outcome lỗi thành HTTP 409. Success commit cả Order/kho/history/attempt/outbox.
- **Mục đích:** Vẫn gửi được lý do hủy thất bại dù không có thay đổi trạng thái.
- **Phục vụ chức năng:** Thông báo kết quả hủy theo Q23 mới nhất.
- **Tại sao chọn cách này:** Throw ngay khi từ chối sẽ rollback cả dữ liệu cần để gửi thư; history không được dùng làm nơi ghi một chuyển trạng thái không xảy ra.
- **Tác dụng cốt lõi:** Phân biệt 'không hủy được đơn' với 'email chưa gửi được'; hai kết quả có vòng đời riêng.
- **Ảnh hưởng đến code khác:** Email payload lý do, errorHandler, UI notification và attempt replay.

##### cancelOrder: phục hồi sau lỗi kỹ thuật

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Nếu transaction lỗi hệ thống, mở transaction mới khóa Order/đọc lại attempt; đã có kết quả thì trả kết quả đó, chưa có thì ghi CANCELLATION_FAILED và outbox lý do công khai.
- **Logic hoạt động như thế nào:** Không bắt lỗi nghiệp vụ dưới 500 để ghi lại; lỗi kỹ thuật được xác định qua kết quả đã persist. Transaction phục hồi không hoàn kho hoặc tạo history; lỗi DB vẫn kéo dài có thể khiến bước ghi thất bại không thực hiện được.
- **Mục đích:** Không gửi email thất bại sai sau tình huống commit đã thành công nhưng client/server mất ACK.
- **Phục vụ chức năng:** Tính nhất quán cancellation/error notification.
- **Tại sao chọn cách này:** Đọc lại bản ghi bền có giá trị hơn suy từ timeout/exception; lỗi công khai không chứa SQL/stack.
- **Tác dụng cốt lõi:** Một kết quả success đã tồn tại phải được replay đúng; khi hạ tầng không lưu được, không thể hứa chắc thông báo được tạo.
- **Ảnh hưởng đến code khác:** Attempt/Outbox, code CANCELLATION_FAILED được errorHandler cho phép và FE dùng để bỏ key đã có kết luận.

### C.20. `BE/src/validators/adminOrderValidators.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/validators/adminOrderValidators.js`.
- **Vai trò:** Kiểm tra cấu trúc HTTP trước controller.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** idRule:4; statusRules:5; cancelRules:6; listRules:11; bulkRules:22; validate:27.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### idRule/statusRules/cancelRules

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** ID phải nguyên dương; expected_status thuộc sáu giá trị; target chỉ confirmed/processing/shipping; request_id chuỗi 8–64 theo pattern; reason quản trị trim 1–1000, khách tùy chọn tối đa 1000.
- **Logic hoạt động như thế nào:** Rules ghi kết quả validation/sanitize; validate trả 400/VALIDATION_ERROR nếu sai. Rules không quyết định Order hiện tại có được đổi hay actor có quyền.
- **Mục đích:** Chặn payload không có hợp đồng rõ ràng trước transaction.
- **Phục vụ chức năng:** Duyệt từng đơn và hủy chống lặp.
- **Tại sao chọn cách này:** Tách cấu trúc đầu vào khỏi kiểm tra trạng thái dưới lock, theo kiến trúc dự án; cùng factory hủy dùng cho hai loại caller.
- **Tác dụng cốt lõi:** Dữ liệu hợp lệ về kiểu vẫn phải qua service; không coi isIn là đủ để cho bỏ bước.
- **Ảnh hưởng đến code khác:** Hai router, controller và payload FE/Postman; API client cũ không body phải được cập nhật.

##### listRules/bulkRules/validate

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Query phải scalar; allowlist filter/sort, search tối đa 100, page/limit có giới hạn; bulk 1–8 phần tử không trùng ID và chỉ confirmed/processing.
- **Logic hoạt động như thế nào:** Query trùng tạo array bị chặn; bulk kiểm mỗi id/expected_status; lỗi tổng hợp trả thông điệp công khai thay vì exception DB.
- **Mục đích:** Ngăn query cấu trúc lạ, tải vô hạn hoặc một yêu cầu bulk lặp cùng ID.
- **Phục vụ chức năng:** Danh sách phân trang và bulk trong trang hiện tại.
- **Tại sao chọn cách này:** Giới hạn tám phù hợp UI đã chốt; allowlist sort ngăn client tùy ý chọn cột SQL.
- **Tác dụng cốt lõi:** Validator bảo vệ biên API kể cả khi gọi trực tiếp không qua FE.
- **Ảnh hưởng đến code khác:** getOrders/bulkAdvance, httpRequest error.payload; không gửi email cho payload lỗi chưa trở thành yêu cầu hủy đã tiếp nhận.

### C.21. `BE/src/workers/orderEmailWorker.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/src/workers/orderEmailWorker.js`.
- **Vai trò:** Entry point tiến trình nền gửi outbox.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** run dòng 9; xử lý signal dòng 5–7.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Vòng lặp xử lý và dừng có kiểm soát

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Nạp dotenv, authenticate DB, gọi processNextEmail liên tục khi có job; không có job/lỗi thì chờ hai giây; SIGINT/SIGTERM đặt stopping; kết thúc đóng Sequelize.
- **Logic hoạt động như thế nào:** Không gọi connectDB/sync nên không alter schema; lỗi vòng lặp chỉ log thông điệp chung rồi thử lại; lỗi khởi động đặt exitCode=1.
- **Mục đích:** Gửi thư ngoài request và ngoài transaction nghiệp vụ.
- **Phục vụ chức năng:** Retry tự động và tình trạng gửi bền.
- **Tại sao chọn cách này:** Worker riêng cho phép vận hành/khởi động lại độc lập HTTP server; queue DB không cần dependency mới.
- **Tác dụng cốt lõi:** Nếu chỉ chạy npm start mà không chạy worker thì job sẽ chờ, không thể gọi trạng thái pending là thư đã gửi.
- **Ảnh hưởng đến code khác:** BE/package.json worker:order-email, DB/SMTP hiện có, orderEmailService. Chưa có process supervisor/healthcheck mới; code signal mới được đọc, chưa kiểm kill/restart tiến trình thật.

### C.22. `BE/tests/orderBrowserFixture.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/tests/orderBrowserFixture.js`.
- **Vai trò:** Dữ liệu/API tạm để nghiệm thu UI thủ công.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** database dòng 6; stop:13; run:20.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Fixture cô lập và vòng đời server

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Sinh schema techstore_order_browser_<pid>, tạo hai tài khoản test cùng dữ liệu 12 Order, Product/Variant/Items, chạy app tại cổng 4317 và CORS FE 4318; không chạy worker.
- **Logic hoạt động như thế nào:** Assert prefix schema → CREATE DATABASE → sync → seed dữ liệu test bằng Sequelize → listen app. Signal dừng server/đóng pool rồi DROP đúng schema có tên do script sinh.
- **Mục đích:** Kiểm UI với router/service/DB thật nhưng không gửi thư hoặc sửa dữ liệu cửa hàng.
- **Phục vụ chức năng:** Nghiệm thu Staff, drawer, pagination và email pending.
- **Tại sao chọn cách này:** Tách fixture có thể tái tạo khỏi DB người dùng; sử dụng hash cho tài khoản test nhưng không ghi giá trị đăng nhập vào báo cáo.
- **Tác dụng cốt lõi:** Nếu dùng DB cửa hàng cho QA, thao tác hủy/giao có thể gây tác dụng thật; script chỉ được dùng cho nghiệm thu.
- **Ảnh hưởng đến code khác:** App và models được dùng như sản phẩm; tạo dữ liệu test riêng. File không khớp *.test.js nên npm test BE không tự khởi động server này.

### C.23. `BE/tests/orderStatusApproval.test.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `BE/tests/orderStatusApproval.test.js`.
- **Vai trò:** Test tích hợp HTTP/MySQL và outbox của chức năng.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** before/after dòng 29–57; 12 test dòng 59–239.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Test harness và dữ liệu cô lập

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Tạo schema techstore_order_test_<pid>, đặt DB_NAME trước require models, tạo app/HTTP port ngẫu nhiên, JWT test, fixture Order/Item/Variant; cleanup schema có prefix kiểm tra.
- **Logic hoạt động như thế nào:** before sync và gọi migrate hai lần → test gửi HTTP có cookie và body → assertions vào response/DB → after đóng server/Sequelize và xóa đúng schema tạm.
- **Mục đích:** Kiểm quy tắc tại ranh giới API thực, không chỉ mock helper nội bộ.
- **Phục vụ chức năng:** Bằng chứng cho validation/quyền/transaction/migration.
- **Tại sao chọn cách này:** Dùng DB thật để phát hiện race/rollback/association mà unit mock không chứng minh; không chạy test trên DB cửa hàng.
- **Tác dụng cốt lõi:** Biến DB_NAME được đặt trước import để không vô tình sync schema cấu hình sản phẩm.
- **Ảnh hưởng đến code khác:** Toàn router/model/service mới; test không thêm role Shipper hoặc gửi SMTP thực.

##### Các ca nghiệp vụ HTTP và tính nguyên tử

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Có test cạnh tiến và chặn Completed, paid/legacy/auth, hủy lặp đồng thời, từ chối hủy, ownership/privacy/time, duyệt cạnh tranh khách hủy, bulk/filter/sort, rollback khi ghi outbox lỗi.
- **Logic hoạt động như thế nào:** Mỗi test tạo Order phù hợp → gọi API hoặc Promise.all cho cạnh tranh → assert HTTP và dữ liệu cuối: stock/sold_count/history/attempt/outbox có đúng một kết quả.
- **Mục đích:** Chứng minh hành vi đã yêu cầu, nhất là lỗi chỉ lộ khi request đồng thời.
- **Phục vụ chức năng:** Duyệt/hủy/bulk an toàn và dữ liệu đúng.
- **Tại sao chọn cách này:** Đếm cả side effect DB giúp phát hiện response thành công nhưng hoàn kho/email trùng.
- **Tác dụng cốt lõi:** Test không chỉ kiểm status 200; có kiểm rollback và cấm truy cập đơn người khác.
- **Ảnh hưởng đến code khác:** Các hook kiểm lỗi trong test được tháo bằng finally; fixture được dọn sau file. Kết quả hiện có: 12 test chức năng mới cùng test cũ tạo tổng BE22/22.

##### Các ca email/recovery và dữ liệu lỗi

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Inject sendMail giả, kiểm ba lần retry, lease hết hạn, escape HTML, lý do thất bại; mô phỏng lỗi history để kiểm rollback rồi lưu email thất bại; kiểm quantity sai và recipient thiếu.
- **Logic hoạt động như thế nào:** Worker helper dùng thời gian test được truyền để đi qua backoff → đọc status/attempts của job; hook tạo lỗi SQL test không đi vào payload công khai.
- **Mục đích:** Kiểm tương tác email/nghiệp vụ mà không dùng SMTP hoặc email khách thật.
- **Phục vụ chức năng:** Q23/Q24, recovery/idempotency và dữ liệu cũ.
- **Tại sao chọn cách này:** Transport giả giữ test xác định và cho phép mô phỏng lỗi khó tái tạo an toàn trên SMTP thật.
- **Tác dụng cốt lõi:** Kết quả 'sent' ở test chỉ chứng minh logic cập nhật sau transport giả; không chứng minh deliverability.
- **Ảnh hưởng đến code khác:** processNextEmail, History hooks và errorHandler. Migration đã thử lặp trên schema mới, không đồng nghĩa nâng cấp schema cũ hoặc restart OS đã được nghiệm thu.

### C.24. `FE/my-app/src/components/admin/orders/orderCancelModal.jsx`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/components/admin/orders/orderCancelModal.jsx`.
- **Vai trò:** Form xác nhận lý do hủy của người vận hành.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** OrderCancelModal/handleSubmit; prop busy và textarea.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Khóa submit và giới hạn lý do tùy chỉnh

- **Trước khi sửa:** Modal chỉ chặn lý do trống, không nhận busy từ hook và textarea không có maxLength.
- **Đã thay đổi gì / sau khi sửa:** Thêm busy=false; handleSubmit dừng khi busy; nút submit disabled khi busy hoặc custom reason trống; textarea giới hạn 1000 ký tự.
- **Logic hoạt động như thế nào:** Người dùng chọn preset hoặc nhập lý do → trim custom reason → nếu hợp lệ và không busy gọi onConfirm(finalReason). Backend vẫn validate cùng giới hạn.
- **Mục đích:** Giảm gửi lặp từ thao tác liên tục và báo lỗi độ dài sớm ngay trên form.
- **Phục vụ chức năng:** Hủy quản trị bắt buộc lý do.
- **Tại sao chọn cách này:** Khóa UI hỗ trợ trải nghiệm; idempotency/transaction BE mới là bảo vệ quyết định nếu client cố gọi trực tiếp.
- **Tác dụng cốt lõi:** Không submit tiếp khi request đang chạy; không loại bỏ nội dung người dùng khi request lỗi.
- **Ảnh hưởng đến code khác:** Hook truyền busy, page nối onConfirm; modal không tự đổi Order hoặc hoàn kho.

### C.25. `FE/my-app/src/components/admin/orders/orderDetailDrawer.jsx`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/components/admin/orders/orderDetailDrawer.jsx`.
- **Vai trò:** Hiển thị chi tiết, hành động, history và tình trạng email quản trị.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** OrderDetailDrawer; nextStatus dòng 47; section history/email từ dòng 125.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Hành động theo DTO và điểm dừng Shipping

- **Trước khi sửa:** Tính next bằng index ORDER_STATUS_FLOW nên Shipping có thể hiện nút Completed; hủy chỉ chặn Completed; có nút tự đánh dấu paid.
- **Đã thay đổi gì / sau khi sửa:** Lấy nextStatus từ order.next_status; nút hủy phụ thuộc order.can_cancel; bỏ prop/nút updatePaymentStatus; hiện action_reason và thông báo dừng khi Shipping; nhãn unknown là Cần kiểm tra.
- **Logic hoạt động như thế nào:** DTO BE quyết định nút có được render → click gọi callback hook → API kiểm lại dưới lock. Vòng đời đọc vẫn có đủ sáu nhãn nhưng không phát sinh nút Completed.
- **Mục đích:** Làm giao diện khớp quyền và điều kiện payment hiện tại.
- **Phục vụ chức năng:** Admin/Staff chỉ đến Đang giao, online paid guard và legacy.
- **Tại sao chọn cách này:** Một nguồn quyết định ở BE tránh FE tự suy cạnh được phép từ enum đầy đủ.
- **Tác dụng cốt lõi:** Ẩn nút không thay thế kiểm quyền BE; code mới có cả hai lớp. Không có chức năng thu tiền COD trong drawer.
- **Ảnh hưởng đến code khác:** allowedActions/serializeOrders, useAdminOrders và page; không gọi endpoint chỉnh thanh toán.

##### History và email notifications

- **Trước khi sửa:** Chỉ có stepper suy từ current status và nội dung mẫu, không có lịch sử người thao tác hoặc tình trạng gửi.
- **Đã thay đổi gì / sau khi sửa:** Thêm section history hiển thị from/to, actor, thời điểm và reason; section email map event/status thành nhãn và hiển thị lý do/thời điểm; thiếu dữ liệu có thông báo riêng.
- **Logic hoạt động như thế nào:** Đọc arrays status_history/email_notifications từ getOrder; render thứ tự BE cung cấp; không tự tạo entry cũ. cancelled_by không còn render như một tên người giả, actor lấy từ history.
- **Mục đích:** Cho quản trị kiểm tra thay đổi thực tế và phân biệt hủy thất bại với SMTP chưa gửi.
- **Phục vụ chức năng:** Audit trạng thái và theo dõi email.
- **Tại sao chọn cách này:** Không suy lịch sử từ một giá trị status; không hiển thị raw last_error SMTP cho người dùng sản phẩm.
- **Tác dụng cốt lõi:** Email pending là Chờ gửi, không tuyên bố Đã gửi; hủy thất bại chỉ có event kết quả, không tô một bước Cancelled.
- **Ảnh hưởng đến code khác:** API detail và DTO history/outbox; các arrays nội bộ chỉ có ở endpoint quản trị.

##### Fallback lý do và hình ảnh

- **Trước khi sửa:** Không có lý do thì tự hiện 'Admin hủy theo yêu cầu'; ảnh lỗi trỏ URL ảnh bên ngoài.
- **Đã thay đổi gì / sau khi sửa:** Lý do vắng hiện Chưa có lý do được ghi nhận; onError dùng handleImageError nội bộ.
- **Logic hoạt động như thế nào:** Nếu cancellation_reason null thì render thông báo thiếu; khi ảnh tải lỗi thì helper đưa về ảnh mặc định đã có trong FE.
- **Mục đích:** Tránh tạo bằng chứng hủy không có trong dữ liệu và tránh phụ thuộc ảnh mẫu online.
- **Phục vụ chức năng:** Chi tiết đơn thật và dữ liệu legacy.
- **Tại sao chọn cách này:** Giữ dữ liệu gốc trung thực hơn chọn một lý do mẫu để lấp chỗ trống.
- **Tác dụng cốt lõi:** Không được dùng nội dung giao diện làm bằng chứng rằng Admin thực sự đã nhập lý do đó.
- **Ảnh hưởng đến code khác:** imageHelper có sẵn; câu chú thích hoàn kho trong drawer vẫn chưa phân biệt đơn Cancelled cũ thiếu history, là giới hạn hiển thị cần lưu ý ở mục E.

### C.26. `FE/my-app/src/components/admin/orders/orderManagementHeader.jsx`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/components/admin/orders/orderManagementHeader.jsx`.
- **Vai trò:** Header, tổng kết quả và thao tác tải lại/xuất dữ liệu.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** OrderManagementHeader; props và cụm nút.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Bỏ reset mock, thêm tải lại API

- **Trước khi sửa:** Có onResetData và nút nạp lại 16 đơn mẫu.
- **Đã thay đổi gì / sau khi sửa:** Bỏ prop/nút reset mock; thêm onRefresh và nút Tải lại; giữ totalOrders và onExportCsv.
- **Logic hoạt động như thế nào:** Tải lại gọi refreshOrders của hook để refetch list/detail; Xuất CSV dùng dữ liệu trang hiện tại qua callback.
- **Mục đích:** Loại thao tác không có ý nghĩa khi dữ liệu chuyển sang DB thật.
- **Phục vụ chức năng:** Vận hành danh sách và xem tình trạng gửi mới khi không có polling.
- **Tại sao chọn cách này:** Refresh chủ động phù hợp Q20; không âm thầm ghi dữ liệu mẫu hoặc thêm realtime.
- **Tác dụng cốt lõi:** Không còn nút khiến người vận hành tưởng có thể reset toàn bộ đơn thật.
- **Ảnh hưởng đến code khác:** Page quản trị phải truyền onRefresh; CSV vẫn là thao tác riêng, không gọi BE sửa dữ liệu.

### C.27. `FE/my-app/src/components/admin/orders/orderPrintModal.jsx`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/components/admin/orders/orderPrintModal.jsx`.
- **Vai trò:** Xem trước và in phiếu của một đơn.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** OrderPrintModal; style @media print dòng 22 và header/chữ ký.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Cô lập vùng in và loại thông tin giả

- **Trước khi sửa:** Phiếu có địa chỉ/hotline/site mẫu, barcode CSS cố định và tên ký mẫu; window.print có thể đưa cả trang quản trị vào bản in.
- **Đã thay đổi gì / sau khi sửa:** Thêm print CSS chỉ cho #print-slip và con hiển thị; bỏ địa chỉ/hotline/site, dải barcode cố định và hai tên ký giả; giữ mã đơn/dữ liệu người nhận/items thật.
- **Logic hoạt động như thế nào:** Mở modal với Order DTO → render phiếu → nút gọi window.print → media print ẩn nội dung khác, đặt vùng phiếu tại trang in. Không gọi API vận chuyển hoặc tạo barcode thật.
- **Mục đích:** Phiếu in phản ánh đơn được chọn thay vì thông tin mẫu hoặc toàn dashboard.
- **Phục vụ chức năng:** In phiếu từng đơn trong Q17.
- **Tại sao chọn cách này:** CSS print toàn cục cục bộ trong modal xử lý trạng thái media mà utility thông thường không đủ cô lập toàn body; không tự sáng tác thông tin cửa hàng thay thế.
- **Tác dụng cốt lõi:** Một hình barcode cố định không phải mã nhận diện đơn, nên được loại chứ không gọi là barcode đã tích hợp.
- **Ảnh hưởng đến code khác:** Ảnh hưởng render toàn body trong chế độ in khi modal có mặt; chưa nghiệm thu in nhiều trang. Label 'hóa đơn' sẵn có không chứng minh đã có nghiệp vụ hóa đơn thuế.

### C.28. `FE/my-app/src/components/admin/orders/orderTableRow.jsx`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/components/admin/orders/orderTableRow.jsx`.
- **Vai trò:** Một dòng Order trong bảng quản trị.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** OrderTableRow; statusConfig/paymentConfig, onError, nút xác nhận.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Nhãn review, quick action và ảnh fallback

- **Trước khi sửa:** Unknown status/payment có thể hiện trống; nút Xác nhận chỉ dựa order_status=pending; ảnh lỗi dùng ảnh mẫu ngoài.
- **Đã thay đổi gì / sau khi sửa:** Fallback nhãn Cần kiểm tra; order.needs_review ưu tiên nhãn cần rà soát; quick action chỉ khi next_status=confirmed; dùng handleImageError.
- **Logic hoạt động như thế nào:** DTO đầy đủ được render; chỉ hiện quick advance nếu BE tính đúng bước; click chuyển Order về hook để gửi expectedStatus.
- **Mục đích:** Không gợi ý thao tác trên đơn dữ liệu thiếu hoặc phải chặn theo nghiệp vụ.
- **Phục vụ chức năng:** Duyệt nhanh từng đơn và bảng dữ liệu thật.
- **Tại sao chọn cách này:** Dùng quyền từ DTO thay vì lặp điều kiện payment/legacy trong component row.
- **Tác dụng cốt lõi:** Một đơn Pending nhưng dữ liệu thiếu không tự được phép xác nhận chỉ vì status là Pending.
- **Ảnh hưởng đến code khác:** allowedActions, admin API normalize, hook.handleQuickAdvance và imageHelper.

### C.29. `FE/my-app/src/components/client/userProfile/OrderTrackingDrawer.jsx`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/components/client/userProfile/OrderTrackingDrawer.jsx`.
- **Vai trò:** Drawer theo dõi và hủy đơn của khách.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** OrderTrackingDrawer; status/payment fallback và canCancel dòng 64.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Hiển thị legacy và dùng quyền hủy chung

- **Trước khi sửa:** Thiếu phương thức bị suy ra COD; thiếu thanh toán hiện Chờ xử lý; canCancel chỉ dựa Pending, sau đó từng có điều kiện dài lặp với Card.
- **Đã thay đổi gì / sau khi sửa:** Dùng needsOrderReview/canCustomerCancelOrder; fallback status/method/payment đều Cần kiểm tra, không dựng COD hay trạng thái thanh toán.
- **Logic hoạt động như thế nào:** Helper kiểm đủ ba loại dữ liệu → canCancel chỉ Pending/chưa paid → render nút; nếu thiếu bất kỳ thông tin cần thiết thì nhãn review và không hủy.
- **Mục đích:** Khách nhìn thấy dữ liệu không chắc chắn thay vì bị hướng dẫn theo giả định sai.
- **Phục vụ chức năng:** Q18 dữ liệu cũ và Q12 chặn hủy paid phía khách.
- **Tại sao chọn cách này:** Helper dùng chung với Card tránh hai nơi thay quy tắc lệch nhau; BE vẫn kiểm lại quyền sở hữu.
- **Tác dụng cốt lõi:** Không thể hiển thị COD khi database chưa xác định phương thức; dữ liệu thiếu không được mở nút hủy.
- **Ảnh hưởng đến code khác:** constants/orderStatus, ProfileOrderCard, hook khách và OrderTrackingStepper; không công khai tên nhân viên hoặc outbox.

### C.30. `FE/my-app/src/components/client/userProfile/OrderTrackingStepper.jsx`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/components/client/userProfile/OrderTrackingStepper.jsx`.
- **Vai trò:** Tiến trình thu gọn/chi tiết phía khách.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** OrderTrackingStepper dòng 52; nhánh cancelled và timestamp hiện tại.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Unknown status và thời điểm có bằng chứng

- **Trước khi sửa:** Trạng thái không nhận diện vẫn dựng timeline; ngày hủy/bước hiện tại dùng updated_at hoặc created_at, có thể gán ngày tạo thành ngày giao.
- **Đã thay đổi gì / sau khi sửa:** Unknown status trả Cần kiểm tra; hủy dùng cancelled_at hoặc status_changed_at; bước hiện tại chỉ dùng status_changed_at; thiếu thời điểm có nhãn rõ.
- **Logic hoạt động như thế nào:** Kiểm status trước render → cancelled render riêng → với bước hiện tại lấy timestamp BE đã đối chiếu history. Ngày tạo vẫn chỉ dùng cho bước đặt đơn.
- **Mục đích:** Không tạo một lịch sử/thời gian mà DB chưa lưu.
- **Phục vụ chức năng:** Theo dõi đơn trung thực cho khách, Q18/Q19.
- **Tại sao chọn cách này:** updated_at còn đổi bởi dữ liệu khác; null không được thay bằng một ngày thuận tiện nhưng sai ý nghĩa.
- **Tác dụng cốt lõi:** Phân biệt vị trí trong tiến trình với bằng chứng thời điểm một lần chuyển.
- **Ảnh hưởng đến code khác:** getOrdersByUser.status_changed_at/cancelled_at; không tự tải history nội bộ.

##### Lý do hủy thay cho cam kết chung

- **Trước khi sửa:** Đoạn chi tiết tuyên bố đã hủy an toàn và kho đã hoàn cho mọi đơn Cancelled.
- **Đã thay đổi gì / sau khi sửa:** Hiển thị cancellation_reason nếu có; thiếu thì nói chưa có lý do được ghi nhận.
- **Logic hoạt động như thế nào:** Dùng dữ liệu API đã chọn lọc; React render text nên không chèn HTML từ reason.
- **Mục đích:** Cho khách biết lý do thực tế và không cam kết lại dữ liệu kho của đơn cũ không có chứng cứ.
- **Phục vụ chức năng:** Kết quả hủy và legacy.
- **Tại sao chọn cách này:** Dữ liệu thật quan trọng hơn một đoạn thông báo mẫu áp dụng cho mọi trường hợp.
- **Tác dụng cốt lõi:** Không dùng UI để tạo bằng chứng tác động kho chưa được xác minh.
- **Ảnh hưởng đến code khác:** OrderModel metadata và client service; quyền xem được giới hạn bởi API sở hữu.

### C.31. `FE/my-app/src/components/client/userProfile/ProfileOrderCard.jsx`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/components/client/userProfile/ProfileOrderCard.jsx`.
- **Vai trò:** Thẻ tóm tắt từng Order trên trang tài khoản.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** ProfileOrderCard; statusInfo và canCancel.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Quyền hủy và cảnh báo dữ liệu thiếu

- **Trước khi sửa:** Chỉ xét Pending để mở nút hủy; status không nhận diện có thể hiện nhãn trống.
- **Đã thay đổi gì / sau khi sửa:** Dùng needsOrderReview để ưu tiên nhãn Cần kiểm tra và canCustomerCancelOrder để quyết định nút; giữ điều kiện Reorder đang có.
- **Logic hoạt động như thế nào:** Order từ API → helper kiểm đủ status/payment/method → Pending/chưa paid mới có onCancel. Không tự chuyển payment failed thành paid/pending.
- **Mục đích:** Đồng nhất quyền hủy giữa thẻ và drawer, gồm cả đơn cũ.
- **Phục vụ chức năng:** Khách tự hủy đúng điều kiện và theo dõi danh sách.
- **Tại sao chọn cách này:** Một helper chung giải quyết phần lặp được phát hiện khi review; không mở rộng sang mua lại.
- **Tác dụng cốt lõi:** Đơn đã paid không còn gợi ý hủy chỉ vì chưa Confirmed.
- **Ảnh hưởng đến code khác:** constants/orderStatus, hook.handleCancelOrder, API khách. Test mới render Card legacy và kiểm không có nút hủy.

### C.32. `FE/my-app/src/constants/orderStatus.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/constants/orderStatus.js`.
- **Vai trò:** Nhãn trạng thái và helper nghiệp vụ hiển thị dùng chung FE.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** needsOrderReview dòng 109; canCustomerCancelOrder dòng 115.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### needsOrderReview và canCustomerCancelOrder

- **Trước khi sửa:** File chỉ có map nhãn và ORDER_STATUS_FLOW; Card/Drawer tự lặp điều kiện hủy hoặc dùng fallback không đúng.
- **Đã thay đổi gì / sau khi sửa:** Thêm needsOrderReview kiểm own key của ba map; canCustomerCancelOrder yêu cầu dữ liệu nhận diện được, Pending và payment_status khác paid. Không đổi sáu trạng thái đọc.
- **Logic hoạt động như thế nào:** Nhận Order → kiểm status/payment/method có trong map bằng Object.hasOwn → thiếu trả needsReview=true; chỉ khi đủ mới xét quyền hủy cho khách.
- **Mục đích:** Có một quy tắc hiển thị chung thay vì sửa hai component cùng lúc.
- **Phục vụ chức năng:** Cần kiểm tra với legacy và nút hủy khách thống nhất.
- **Tại sao chọn cách này:** Map hiện có chính là tập nhãn FE hỗ trợ; không thêm state machine phía FE để cạnh tranh với service BE.
- **Tác dụng cốt lõi:** Helper chỉ quyết định trải nghiệm UI, không cấp quyền server; dữ liệu null không được biến thành COD hoặc chưa thanh toán.
- **Ảnh hưởng đến code khác:** ProfileOrderCard/OrderTrackingDrawer; cấu trúc backend dataProblem vẫn độc lập vì khác runtime và phải bảo vệ API.

### C.33. `FE/my-app/src/hooks/admin/useAdminOrders.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/hooks/admin/useAdminOrders.js`.
- **Vai trò:** Điều phối state/query/chi tiết và mutation quản trị.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** useAdminOrders dòng 5; effects danh sách/chi tiết; mutate và các handler.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Filters, metadata, selection và URL tab

- **Trước khi sửa:** State rời cho từng filter; mock trả metadata; selection có thể giữ ID qua trang khác; đổi URL có thể giữ lựa chọn không mong muốn.
- **Đã thay đổi gì / sau khi sửa:** Gom filters gồm search/payment/date/sort/page; nhận result từ BE; changeFilter đưa page=1 và bỏ selection; handlePageChange bỏ chọn; selectionStatus xử lý cả Back/Forward.
- **Logic hoạt động như thế nào:** Event cập nhật state → effect query API; status vẫn đọc useSearchParams; khi activeStatus thay đổi ngoài handler, so selectionStatus để bỏ IDs cũ. Chọn tất cả chỉ lấy result.data trang đang xem.
- **Mục đích:** Không thao tác nhầm đơn đã bị ẩn khi thay tập kết quả.
- **Phục vụ chức năng:** Bulk trong trang hiện tại, bộ lọc và điều hướng tab.
- **Tại sao chọn cách này:** Chỉ giữ ID thuộc trang hiện tại đơn giản hơn chọn xuyên trang cần contract bulk khác; metadata BE là nguồn thật.
- **Tác dụng cốt lõi:** Tập đơn chọn không tồn tại độc lập với ngữ cảnh filter/page.
- **Ảnh hưởng đến code khác:** OrderTable/StatusTabs/BulkActionBar và API list. Chỉ status nằm trên URL; các filter khác vẫn là local state, không tuyên bố chia sẻ toàn bộ filter bằng URL.

##### Effect tải danh sách

- **Trước khi sửa:** Gọi mock và dùng ignore flag; dữ liệu không lấy từ DB.
- **Đã thay đổi gì / sau khi sửa:** Debounce 200ms, AbortController, gọi adminOrderService.getOrders; chỉ set result/error/loading nếu signal chưa aborted.
- **Logic hoạt động như thế nào:** Filters/status/reloadKey đổi → timer → loading và API query → nhận metadata/data → cập nhật state; cleanup clear timer và abort. Nếu transport vẫn trả response cũ, signal guard vẫn bỏ.
- **Mục đích:** Giảm query khi gõ nhanh và tránh response cũ ghi đè kết quả mới.
- **Phục vụ chức năng:** Tìm kiếm/lọc API thật, lỗi có Thử lại.
- **Tại sao chọn cách này:** Hủy request một mình không đủ nếu response đã về hoặc mock transport không tôn trọng abort, nên có cả kiểm trạng thái trước setState.
- **Tác dụng cốt lõi:** Không fallback về localStorage khi API lỗi.
- **Ảnh hưởng đến code khác:** Service hỗ trợ signal qua httpClient; page ẩn rows cũ khi error và giữ tiêu chí cho retry.

##### Effect chi tiết, handleOpenDetail/handleCloseDetail

- **Trước khi sửa:** selectedOrder là orders.find theo trang hiện tại; khi đơn rời filter, drawer có thể mất dữ liệu.
- **Đã thay đổi gì / sau khi sửa:** Lưu selectedOrderId/selectedOrder riêng, gọi GET detail khi mở/đổi ID/reloadKey; có detailLoading/detailError và abort.
- **Logic hoạt động như thế nào:** Mở drawer dùng row làm dữ liệu ban đầu → effect tải detail theo ID → chỉ ghi response còn hiệu lực. Refresh sau mutation làm mới detail mà không cần đơn nằm trong list; đóng bị chặn khi busy.
- **Mục đích:** Duy trì chi tiết của đúng đơn qua thay đổi trạng thái/phân trang.
- **Phục vụ chức năng:** Q20 giữ drawer mở, history/email và thử lại detail.
- **Tại sao chọn cách này:** Chi tiết là tài nguyên theo ID, không phải một phần tử luôn có mặt trong trang lọc.
- **Tác dụng cốt lõi:** Không mất drawer chỉ vì mutation thành công khiến đơn ra khỏi filter.
- **Ảnh hưởng đến code khác:** API detail và OrderDetailDrawer. Detail có vòng đời riêng, UI phải xem detailError thay vì coi row tạm là dữ liệu mới nhất.

##### mutate và các handler chuyển trạng thái

- **Trước khi sửa:** Nhiều handler gọi mock riêng, không khóa đồng thời ở hook và có updatePaymentStatus/reset mock.
- **Đã thay đổi gì / sau khi sửa:** mutate dùng busyRef khóa ngay trước await, busy cho fieldset, bắt lỗi/notification/refresh; handleUpdateStatus và QuickAdvance gửi expected_status từ Order đã xem. Gỡ handler paid/reset mẫu.
- **Logic hoạt động như thế nào:** Nếu đang gửi trả false → action → báo kết quả, bỏ selection, refresh list/detail → finally nhả khóa. Cả lỗi cũng refresh để nhận trạng thái mới sau conflict.
- **Mục đích:** Không tạo hai request trong cùng frame và chuẩn hóa vòng đời cập nhật.
- **Phục vụ chức năng:** Duyệt từng đơn, lỗi xung đột và cập nhật giao diện.
- **Tại sao chọn cách này:** React setState không đồng bộ ngay nên dùng ref cho mutex UI; BE row lock vẫn là bảo vệ thật.
- **Tác dụng cốt lõi:** Busy không phải phân quyền. Chỉ target được BE/DTO cho phép mới được giao diện gợi ý.
- **Ảnh hưởng đến code khác:** Page fieldset/notification, status service, header. Các cập nhật trạng thái không tự suy ra bước mới sau khi bị 409.

##### handleConfirmCancel và mã yêu cầu

- **Trước khi sửa:** Hủy mock không có request ID và không thể replay kết quả bền.
- **Đã thay đổi gì / sau khi sửa:** Lưu reason/request_id/expected_status trong ref; giữ khi mạng lỗi để retry cùng yêu cầu; đổi reason tạo key mới; lỗi có kết luận 4xx hoặc CANCELLATION_FAILED bỏ key; success đóng modal.
- **Logic hoạt động như thế nào:** Lấy Order đang xem → khởi tạo crypto.randomUUID nếu cần → gọi service.cancel → mutate báo/refresh → kết quả xác định thì giải phóng key để lần yêu cầu mới không replay nhầm.
- **Mục đích:** Kết nối idempotency của BE với hành động người dùng thực tế.
- **Phục vụ chức năng:** Hủy không hoàn kho/email lặp khi mất phản hồi.
- **Tại sao chọn cách này:** Mỗi click retry do timeout không nên trở thành ý định mới; nhưng thay nội dung không được dùng key cũ.
- **Tác dụng cốt lõi:** Nếu luôn sinh ID mới trước mỗi retry, unique attempt BE không còn ngăn duplicate sự kiện như mong muốn.
- **Ảnh hưởng đến code khác:** cancelRules, Attempt fingerprint, modal reason và HTTP error.payload.

##### handleBulkAdvance, kết quả bền trên UI và CSV

- **Trước khi sửa:** Bulk mock chỉ trả số lượng; từng đơn không hợp lệ có thể bị gán trực tiếp; CSV/reset cùng mock.
- **Đã thay đổi gì / sau khi sửa:** Chỉ lấy rows hiện tại thuộc selected IDs, gọi bulkStatus, lưu bulkResult từng đơn, báo tổng; export dùng exportOrdersCsv với result.data khi không loading/error; bỏ reset.
- **Logic hoạt động như thế nào:** Không có đơn chọn thì dừng → mutate gửi tập order/expected_status → lưu results → page render từng ID/lý do ngay cả sau toast; export không gọi mutation.
- **Mục đích:** Báo thành công một phần minh bạch và xuất đúng dữ liệu người dùng đang xem.
- **Phục vụ chức năng:** Q7/Q9/Q16 và CSV trang hiện tại.
- **Tại sao chọn cách này:** Lưu kết quả riêng giúp developer/người vận hành không phải dựa toast tự biến mất để biết đơn lỗi.
- **Tác dụng cốt lõi:** Một HTTP 200 của bulk không đồng nghĩa mọi phần tử thành công.
- **Ảnh hưởng đến code khác:** bulkAdvance BE, bảng bulkResult trong page và service CSV; raw result không tự sửa trạng thái local nếu chưa tải API.

### C.34. `FE/my-app/src/hooks/client/useUserProfile.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/hooks/client/useUserProfile.js`.
- **Vai trò:** Điều phối trang tài khoản, danh sách và yêu cầu hủy khách.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** cancelRequests/cancelBusy; executeCancelOrder từ dòng 97.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Khóa và giữ request_id qua retry

- **Trước khi sửa:** executeCancelOrder chỉ đặt cancellingId rồi gọi PUT không body; double-click/retry không có định danh bền.
- **Đã thay đổi gì / sau khi sửa:** Thêm ref Map request ID theo Order và ref cancelBusy; chặn thực thi lặp; sinh key khi cần, chuyển xuống API; bỏ key khi success hoặc lỗi có kết luận, giữ khi kết quả mạng chưa biết.
- **Logic hoạt động như thế nào:** Mở xác nhận vẫn dùng pendingCancelId → submit khóa ref → gửi cùng key → success fetchOrders → finally nhả busy/reset state; lỗi transport không tự kết luận đơn chưa hủy.
- **Mục đích:** Bảo toàn một lần yêu cầu của khách giữa các lần gửi lại.
- **Phục vụ chức năng:** Khách hủy đơn với idempotency BE.
- **Tại sao chọn cách này:** Map sống qua render trong hook nhưng không phải kho dữ liệu đơn; quyền sở hữu/paid vẫn do BE quyết định.
- **Tác dụng cốt lõi:** Không tạo một email hoặc lần hoàn kho mới chỉ vì request trước mất response.
- **Ảnh hưởng đến code khác:** Client orderService.cancelOrder, controller/validator và Attempt model. Mã không persist qua reload trình duyệt; request mới sau reload có thể là lần yêu cầu mới theo contract.

##### Refetch sau HTTP 409 và giữ lý do từ chối

- **Trước khi sửa:** Sau từ chối hủy chỉ set ordersError, nên đơn vừa được Staff duyệt vẫn có thể hiện Pending và nút Hủy.
- **Đã thay đổi gì / sau khi sửa:** Trong catch, nếu status=409 thì await fetchOrders trước, sau đó set lại lý do từ response.
- **Logic hoạt động như thế nào:** 409 → GET my-orders → thay dữ liệu/list loading → đặt lại ordersError gốc để fetchOrders không vô tình xóa thông báo từ chối.
- **Mục đích:** Cho khách nhận trạng thái hiện tại cùng lý do thao tác bị từ chối.
- **Phục vụ chức năng:** Q10 dữ liệu stale và trải nghiệm hủy thất bại.
- **Tại sao chọn cách này:** Thứ tự fetch rồi setError quan trọng vì fetchOrders khởi đầu bằng xóa lỗi.
- **Tác dụng cốt lõi:** Không để giao diện gợi ý tiếp hành động trên status đã lỗi thời sau khi BE báo conflict.
- **Ảnh hưởng đến code khác:** Card/Drawer canCancel tính lại theo data mới; test hồi quy mới assert cả confirmed và message. Các luồng profile/reorder ngoài đoạn này giữ nguyên.

### C.35. `FE/my-app/src/layouts/adminLayout.jsx`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/layouts/adminLayout.jsx`.
- **Vai trò:** Layout cha của các trang quản trị.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** AdminLayoutInner effect và Outlet, dòng 58–92.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Giữ Outlet mounted và tách query khỏi loading toàn trang

- **Trước khi sửa:** Effect phụ thuộc pathname/search; shouldShow khiến Outlet bị gỡ tạm. Chỉ đổi tab đơn qua query đã làm mất state filter/drawer và phát sinh fetch lại.
- **Đã thay đổi gì / sau khi sửa:** Effect loading chỉ phụ thuộc pathname; luôn render Outlet dưới overlay, bỏ gateOutlet.
- **Logic hoạt động như thế nào:** Điều hướng path vẫn có Loading overlay; đổi status query do màn quản trị xử lý loading tại danh sách, component không bị remount bởi gate.
- **Mục đích:** Bảo toàn state khi cập nhật tiêu chí và tránh mất drawer do loading của layout.
- **Phục vụ chức năng:** Giữ filter/detail theo Q20 và thao tác tab.
- **Tại sao chọn cách này:** Sửa đúng lifecycle của layout thay vì thêm localStorage để vá state bị unmount.
- **Tác dụng cốt lõi:** Hook tốt vẫn mất dữ liệu nếu ancestor chủ động gỡ nó; sửa hook một mình không giải quyết lỗi này.
- **Ảnh hưởng đến code khác:** Mọi trang dưới AdminLayout, không chỉ đơn hàng. Desktop đã thao tác thực tế sau sửa; chưa nghiệm thu hồi quy từng trang quản trị khác.

### C.36. `FE/my-app/src/pages/admin/orders/orderManagement.jsx`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/pages/admin/orders/orderManagement.jsx`.
- **Vai trò:** Composition của trang quản trị đơn, nối hook vào component.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** OrderManagement dòng 12; fieldset/error/bulkResult/detail status.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Nối dữ liệu thật, trạng thái lỗi/busy và partial bulk

- **Trước khi sửa:** Page nhận callback mock/reset/paid; không có error retry, detail loading hoặc bảng kết quả từng đơn.
- **Đã thay đổi gì / sau khi sửa:** Nhận error/detailLoading/detailError/refreshOrders/busy/bulkResult; bọc control bằng fieldset disabled; hiện error và Thử lại; ẩn rows cũ khi list lỗi; hiện từng kết quả bulk.
- **Logic hoạt động như thế nào:** Hook cung cấp state → page truyền props → thao tác quay lại hook. Khi busy, control form bị disabled; khi error, message ở vùng bảng và callback retry giữ tiêu chí.
- **Mục đích:** Thể hiện trạng thái API và kết quả một phần rõ ràng thay vì chỉ toast thành công chung.
- **Phục vụ chức năng:** Danh sách thật, lỗi có phục hồi và bulk đúng Q9.
- **Tại sao chọn cách này:** Page điều phối UI, không tự query DB hoặc áp quy tắc hủy ngoài hook/BE.
- **Tác dụng cốt lõi:** Partial bulk phải nhìn thấy lý do từng đơn; không được render dữ liệu cũ như thể request mới đã thành công.
- **Ảnh hưởng đến code khác:** Các component trong admin/orders và Notification; lỗi/detail dùng lớp hiển thị riêng.

##### Bỏ wiring mock/payment, nối refresh và modal busy

- **Trước khi sửa:** Truyền onResetData và onUpdatePaymentStatus xuống header/drawer.
- **Đã thay đổi gì / sau khi sửa:** Bỏ hai callback; header nhận onRefresh; CancelModal nhận busy; drawer lấy selectedOrder độc lập.
- **Logic hoạt động như thế nào:** Nút Tải lại tăng reloadKey; modal bị khóa lúc gửi; không còn event UI đánh dấu paid/Completed.
- **Mục đích:** Không để component gọi chức năng đã nằm ngoài phạm vi.
- **Phục vụ chức năng:** Điểm dừng Shipping và gửi email worker độc lập.
- **Tại sao chọn cách này:** Gỡ wiring và nút thật tốt hơn giữ nút nhưng báo không làm gì.
- **Tác dụng cốt lõi:** Không phát sinh side effect thanh toán qua giao diện quản trị trong bản này.
- **Ảnh hưởng đến code khác:** Hook return API, header/drawer/modal phải đồng bộ props; BE vẫn chặn direct request ngoài ma trận.

### C.37. `FE/my-app/src/services/api/admin/orderService.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/services/api/admin/orderService.js`.
- **Vai trò:** Adapter HTTP/DTO quản trị và tiện ích xuất CSV hiện đặt cùng file.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** normalize:4; adminOrderService:5; exportOrdersCsv:28.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### normalize và các method HTTP

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Thêm getOrders/getOrder/updateStatus/cancel/bulkStatus dùng httpRequest; normalize ảnh items bằng imageHelper.
- **Logic hoạt động như thế nào:** getOrders tạo query và truyền signal; getOrder trả data đã normalize; updateStatus gửi expected/target; cancel chuyển payload có key/reason; bulk chuyển Order thành id/expected_status và lấy result.data.
- **Mục đích:** Đưa mock caller sang native Fetch API đúng hợp đồng BE.
- **Phục vụ chức năng:** Tất cả thao tác đọc/ghi quản trị.
- **Tại sao chọn cách này:** Dùng httpClient giữ credentials/error.status/error.payload, không hardcode host trong component hay dùng Axios.
- **Tác dụng cốt lõi:** Adapter chỉ chuyển shape/URL ảnh; không quyết định cạnh chuyển, tính kho hoặc gán paid.
- **Ảnh hưởng đến code khác:** useAdminOrders, constants/api.VITE_API_URL, httpClient và BE routes. Không fallback mock khi API lỗi.

##### exportOrdersCsv

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Tạo CSV từ trang Order đã có; escape dấu nháy, bọc ô, thêm BOM UTF-8; ô bắt đầu bằng khoảng trắng rồi =/+/@/- có tiền tố nháy đơn; tạo Blob/download và revoke URL sau một giây.
- **Logic hoạt động như thế nào:** Nhận mảng hiện tại → dựng header/rows → chuẩn hóa từng ô → Blob → thẻ a.download → click → thu hồi object URL.
- **Mục đích:** Xuất dữ liệu thật đọc được tiếng Việt và giảm nguy cơ spreadsheet diễn giải nội dung khách nhập thành công thức.
- **Phục vụ chức năng:** CSV của trang hiện tại theo Q17.
- **Tại sao chọn cách này:** Không gọi API export toàn bộ vì phạm vi chỉ tám đơn đang xem; escape CSV và chống formula injection giải quyết hai rủi ro khác nhau.
- **Tác dụng cốt lõi:** CSV quote đúng cú pháp vẫn có thể là công thức khi mở trong Excel; tiền tố bảo vệ là phần riêng cần giữ.
- **Ảnh hưởng đến code khác:** Hook export callback và môi trường trình duyệt. Việc đặt DOM download trong API service là điểm thiết kế còn có thể tách utility; chưa kiểm file CSV bằng ứng dụng bảng tính thật.

### C.38. `FE/my-app/src/services/api/client/orderService.js`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/src/services/api/client/orderService.js`.
- **Vai trò:** Adapter API đơn hàng của khách.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** orderService.cancelOrder dòng 15.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Payload hủy mới

- **Trước khi sửa:** cancelOrder nhận mỗi orderId và gửi PUT không body.
- **Đã thay đổi gì / sau khi sửa:** Nhận thêm requestId và gửi JSON {expected_status:'pending',request_id:requestId}. Các method tạo/lấy đơn giữ nguyên.
- **Logic hoạt động như thế nào:** Hook giữ mã theo lần yêu cầu → service thêm hai trường → httpRequest gắn JSON/credentials → route khách validate rồi xử lý.
- **Mục đích:** Làm caller hiện có tương thích yêu cầu chống replay của API.
- **Phục vụ chức năng:** Khách chỉ tự hủy từ Pending.
- **Tại sao chọn cách này:** Trạng thái nguồn cố định Pending phù hợp quyền khách; không cho caller tự khai operator hoặc role.
- **Tác dụng cốt lõi:** Nếu thiếu payload này, route mới trả 400 trước khi hủy; đây là thay đổi contract cần cập nhật đồng thời.
- **Ảnh hưởng đến code khác:** useUserProfile.executeCancelOrder, client controller/validator và request Postman. Định dạng lỗi vẫn do httpClient chuẩn hóa.

### C.39. `FE/my-app/tests/orderManagement.test.mjs`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `FE/my-app/tests/orderManagement.test.mjs`.
- **Vai trò:** Test hook/HTTP boundary và render UI khách bằng Node, Vite SSR, jsdom.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** Harness/mount dòng 10–37; sáu test dòng 39–150.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Harness, pending HTTP và cleanup

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Tải module thật bằng Vite SSR với HMR=false; mock tại global fetch thành hàng đợi request có thể resolve theo thứ tự tùy ý; dùng MemoryRouter/React act; cleanup root/fetch/Vite/jsdom.
- **Logic hoạt động như thế nào:** Render hook thật → quan sát request URL/body/signal → trả Response giả → assert state/markup quan sát được. AuthProvider thật dùng response me giả cho test khách.
- **Mục đích:** Đo hành vi hook khi API chậm/lỗi mà không mock implementation riêng của hook.
- **Phục vụ chức năng:** Độ đúng của điều hướng, async state và gửi mutation FE.
- **Tại sao chọn cách này:** Điều khiển biên HTTP tái tạo response đảo thứ tự dễ hơn E2E mạng thật; async act bao các cập nhật render.
- **Tác dụng cốt lõi:** Test có thể chứng minh guard response cũ kể cả khi transport giả vẫn trả sau abort.
- **Ảnh hưởng đến code khác:** Module/hook/service thật chạy dưới SSR. Không chứng minh pixel/mobile, browser download hay SMTP.

##### Sáu ca hồi quy người dùng quan sát được

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Kiểm bỏ selection khi đổi page/filter/tab; lỗi retry giữ search; response cũ không ghi đè; drawer còn mở khi đơn rời filter; bulk có lỗi từng đơn và chặn click lặp; khách409 refetch; render legacy không giả COD.
- **Logic hoạt động như thế nào:** Bốn test đầu tập trung quản trị; test409 trả auth/me rồi list, gửi cancel409 và resolve list confirmed mới; test cuối render Card/Drawer từ dữ liệu null và kiểm cảnh báo/nút hủy.
- **Mục đích:** Bắt các lỗi spec được review phát hiện và các lỗi async không thể thấy bằng build.
- **Phục vụ chức năng:** Q9/Q10/Q18/Q20 và regression cho lần sửa review.
- **Tại sao chọn cách này:** Assert state, payload và markup, không viết test chỉ lặp lại câu điều kiện helper.
- **Tác dụng cốt lõi:** Một lint/build xanh không đủ chứng minh conflict tải dữ liệu mới hoặc điều kiện legacy hiển thị đúng.
- **Ảnh hưởng đến code khác:** Hai hook, constants, component khách và admin API service. Sáu ca mới đã pass; cùng test cũ FE tổng 25/25.

### C.40. `postman/collections/TechStore API/Admin - Orders/advanceOrder.request.yaml`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `postman/collections/TechStore API/Admin - Orders/advanceOrder.request.yaml`.
- **Vai trò:** Request mẫu duyệt từng đơn bằng tài khoản quản trị.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** PATCH URL, JSON body và script afterResponse.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Lệnh Pending → Confirmed có trạng thái nguồn

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Định nghĩa PATCH /api/admin/orders/{{order_id}}/status với expected_status=pending và target_status=confirmed; script chấp nhận 200 hoặc 409.
- **Logic hoạt động như thế nào:** Sau khi đăng nhập Admin/Staff bằng cookie jar, thay order_id → gửi payload → kiểm response thành công hoặc xung đột dữ liệu cũ.
- **Mục đích:** Cho developer tái hiện contract advance mà không tự đoán tên trường.
- **Phục vụ chức năng:** API duyệt tuần tự và phát hiện stale state.
- **Tại sao chọn cách này:** 200/409 là hai kết quả nghiệp vụ hợp lệ khi request được gửi lại hoặc đơn đã đổi; không cố định mọi lần gửi phải thành công.
- **Tác dụng cốt lõi:** Mẫu phải có expected_status vì chỉ target không chứng minh trạng thái người dùng đã xem.
- **Ảnh hưởng đến code khác:** statusRules và orderController.advanceOrder. Đây là request/script đã viết, chưa được chạy bằng Postman trong lượt này.

### C.41. `postman/collections/TechStore API/Admin - Orders/bulkAdvance.request.yaml`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `postman/collections/TechStore API/Admin - Orders/bulkAdvance.request.yaml`.
- **Vai trò:** Request mẫu duyệt hàng loạt và kiểm kết quả từng phần tử.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** POST bulk-status, orders array và script afterResponse.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Payload từng Order và kết quả bulk

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Thêm target_status=confirmed, orders chứa id/expected_status; afterResponse yêu cầu HTTP200 và data.results là array.
- **Logic hoạt động như thế nào:** Biến order_id được thay bằng ID test → gửi danh sách → BE xử lý riêng mỗi đơn → script kiểm container kết quả, developer đọc success/message từng ID.
- **Mục đích:** Mô tả chính xác shape bulk thay cho mảng ID trần của mock cũ.
- **Phục vụ chức năng:** Duyệt nhiều đơn thành công một phần.
- **Tại sao chọn cách này:** Mỗi đơn có expected_status riêng để API có thể kiểm xung đột đúng nguồn; HTTP200 không được hiểu là mọi phần tử success.
- **Tác dụng cốt lõi:** Người kiểm thử phải xem results và totals thay vì chỉ status HTTP.
- **Ảnh hưởng đến code khác:** bulkRules/bulkAdvance; mẫu có một phần tử và có thể bổ sung tối đa tám ID không trùng. Chưa chạy collection hoặc khẳng định assertion đã thực thi.

### C.42. `postman/collections/TechStore API/Admin - Orders/cancelOrder.request.yaml`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `postman/collections/TechStore API/Admin - Orders/cancelOrder.request.yaml`.
- **Vai trò:** Request mẫu hủy quản trị với lý do và replay key.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** PUT cancel, beforeRequest và afterResponse.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Giữ cancel_request_id và kiểm kết quả công khai

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Body có request_id từ collection variable, expected_status và reason. Script trước request chỉ sinh GUID khi biến chưa tồn tại; script sau chấp nhận200/409 và kiểm message với409.
- **Logic hoạt động như thế nào:** Lần đầu tạo key → gửi hủy → gửi lại giữ key để kiểm replay. Muốn một Cancellation Attempt mới thì xóa/đổi biến; đổi reason với key cũ có thể bị REQUEST_REUSED.
- **Mục đích:** Cho developer kiểm hủy có lý do và không hoàn kho/email lần nữa khi retry cùng ý định.
- **Phục vụ chức năng:** Hủy Admin/Staff và idempotency.
- **Tại sao chọn cách này:** Không dùng GUID mới cho mỗi lần bấm Send vì như vậy không kiểm được replay mà service cần bảo vệ.
- **Tác dụng cốt lõi:** Key là danh tính yêu cầu, không phải mã đơn; giữ key và nội dung phải đồng nhất.
- **Ảnh hưởng đến code khác:** cancelRules(true), Attempt fingerprint và outbox. Request cần cookie Admin/Staff; chưa chạy Postman, không đưa thông tin đăng nhập vào mẫu/báo cáo.

### C.43. `postman/collections/TechStore API/Admin - Orders/getOrderDetail.request.yaml`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `postman/collections/TechStore API/Admin - Orders/getOrderDetail.request.yaml`.
- **Vai trò:** Request mẫu xem chi tiết quản trị theo ID.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** GET /api/admin/orders/{{order_id}} và afterResponse.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Kiểm cấu trúc history/email

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Thêm GET detail và assertion200, status_history/email_notifications là arrays.
- **Logic hoạt động như thế nào:** Đăng nhập đúng role → thay order_id → API trả DTO chi tiết → script kiểm phần dữ liệu mới tồn tại.
- **Mục đích:** Giúp review trực tiếp tài nguyên drawer độc lập với trang list.
- **Phục vụ chức năng:** Lịch sử người thao tác và tình trạng thông báo.
- **Tại sao chọn cách này:** Dùng endpoint chi tiết mới thay vì mong list phân trang luôn có đầy đủ lịch sử.
- **Tác dụng cốt lõi:** Array rỗng vẫn hợp lệ cho đơn cũ, không bắt phải có history giả.
- **Ảnh hưởng đến code khác:** Controller.detail/getOrder/OrderDetailDrawer. File request tồn tại không chứng minh endpoint đã được collection runner kiểm qua.

### C.44. `postman/collections/TechStore API/Admin - Orders/getOrders.request.yaml`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `postman/collections/TechStore API/Admin - Orders/getOrders.request.yaml`.
- **Vai trò:** Request mẫu truy vấn danh sách quản trị.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** GET query và afterResponse.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Phân trang/metadata danh sách

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Thêm query page=1,limit=8,status=all,sortBy=newest; script yêu cầu200, tối đa tám data và có countsByStatus.
- **Logic hoạt động như thế nào:** Cookie Admin/Staff → API validate query → trả danh sách/metadata → script kiểm giới hạn trang và badge container.
- **Mục đích:** Cho developer dùng được API dữ liệu thật theo shape FE đọc.
- **Phục vụ chức năng:** Danh sách phân trang BE và số đếm.
- **Tại sao chọn cách này:** Không dùng endpoint khách vì endpoint khách chỉ trả đơn của một user và không có quyền truy vấn toàn bộ đơn.
- **Tác dụng cốt lõi:** Phân biệt total đã lọc với countsByStatus toàn cục; không kéo toàn bộ DB về FE.
- **Ảnh hưởng đến code khác:** listRules/getOrders/useAdminOrders. Script kiểm shape tối thiểu, chưa kiểm hết sort/filter hoặc chạy thực tế trong Postman.

### C.45. `postman/collections/TechStore API/Orders/cancelOrderAuthenticated.request.yaml`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `postman/collections/TechStore API/Orders/cancelOrderAuthenticated.request.yaml`.
- **Vai trò:** Request mẫu khách hủy Order của mình.
- **Trạng thái:** Tạo mới.
- **Vị trí đối chiếu:** PUT client cancel, body và hai script.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### request_id khách và expected_status

- **Trước khi sửa:** Chưa có thành phần này trong phiên bản HEAD đối chiếu.
- **Đã thay đổi gì / sau khi sửa:** Thêm body expected_status=pending và customer_cancel_request_id; script trước request sinh key nếu thiếu, sau request chấp nhận200/409.
- **Logic hoạt động như thế nào:** Đăng nhập khách sở hữu đơn → thay order_id → gửi hủy → giữ key để retry cùng ý định; đổi biến cho lần yêu cầu mới.
- **Mục đích:** Cập nhật contract client cancel mà route mới đang bắt buộc.
- **Phục vụ chức năng:** Khách tự hủy Pending/chưa paid và đọc lý do từ chối.
- **Tại sao chọn cách này:** Biến riêng với quản trị tránh trộn key thử nghiệm giữa hai luồng; actor vẫn lấy từ cookie, không gửi role trong body.
- **Tác dụng cốt lõi:** Không có hai trường này, request cũ bị400 trước khi tới nghiệp vụ hủy.
- **Ảnh hưởng đến code khác:** Client cancelRules/controller/service và useUserProfile. Chưa chạy file bằng Postman; API tương ứng đã có test HTTP/MySQL ở BE.

### C.46. `postman/collections/TechStore API/Orders/Cancel Order - Not Found.request.yaml`

#### 1. Thông tin file

- **Đường dẫn từ gốc TechStore:** `postman/collections/TechStore API/Orders/Cancel Order - Not Found.request.yaml`.
- **Vai trò:** Request âm kiểm truy cập ID đơn không tồn tại.
- **Trạng thái:** Sửa.
- **Vị trí đối chiếu:** Headers/body thêm trước scripts.

#### 2. Nội dung code đã thêm hoặc chỉnh sửa

##### Payload hợp lệ để test đi tới bước 404

- **Trước khi sửa:** Mẫu PUT không có body; sau validator mới sẽ trả400, làm test401/404 sai mục tiêu.
- **Đã thay đổi gì / sau khi sửa:** Thêm Content-Type JSON, GUID request_id và expected_status=pending; giữ ID mẫu/expect401 hoặc404.
- **Logic hoạt động như thế nào:** Chưa đăng nhập trả401; đã đăng nhập và ID không tồn tại, payload qua validation rồi service tìm Order trả404; không tạo email do không xác định đơn hợp lệ.
- **Mục đích:** Giữ ca kiểm thử âm đúng tầng đang muốn kiểm.
- **Phục vụ chức năng:** Không lộ đơn và xử lý NOT_FOUND của hủy khách.
- **Tại sao chọn cách này:** Test tìm-không-thấy phải có input cấu trúc hợp lệ; lỗi payload không thay thế bằng chứng404.
- **Tác dụng cốt lõi:** Không tạo email cho một ID không xác định hoặc không thuộc khách.
- **Ảnh hưởng đến code khác:** Route validator/lockedOrder và collection cũ. Tên có khoảng trắng là tên file đã tồn tại, không đổi trong tác vụ; request chưa được chạy trong Postman.

## D. Giải thích luồng xử lý tổng thể

### D.1. Đọc danh sách và chi tiết quản trị

`OrderManagement → useAdminOrders → adminOrderService → httpClient (tái sử dụng) → /api/admin/orders → requireAuth → requireOrderOperator → validator → controller → services/admin/orderService → Sequelize → MySQL`.

1. Component chỉ nhận props/callback. Hook giữ tiêu chí, trạng thái tải/lỗi và lựa chọn của trang.
2. API service chuyển query/payload và chuẩn hóa ảnh; `httpClient` giữ cookie, parse JSON và cung cấp `error.status/error.payload`.
3. JWT xác định actor; `requireOrderOperator` đọc lại tài khoản đang hoạt động và role Admin/Staff. Không lấy role từ request body.
4. Validator giới hạn kiểu/filter/sort/page. Controller chuyển tiếp dữ liệu, không chứa query hoặc logic kho.
5. `getOrders` count trên Order trước join, lọc/sort trước limit; badge dùng toàn bộ đơn và header dùng tổng đã lọc. `serializeOrders` chuẩn hóa items và quyền thao tác.
6. `getOrder(id)` truy vấn chi tiết độc lập với trang/filter và bổ sung history/email chỉ cho quản trị.
7. Hook bỏ response không còn hiệu lực khi query đổi. Sau mutation, danh sách và detail tải lại riêng; việc đơn ra khỏi filter không đóng drawer.

**Điểm lỗi:** payload sai trả 400, thiếu phiên trả 401, sai quyền trả 403, không tìm thấy tài nguyên phù hợp trả 404. Danh sách lỗi có Thử lại và không dùng localStorage để che lỗi API.

### D.2. Chuyển trạng thái từng đơn và bulk

`status route → statusRules → orderController.advanceOrder → orderStatusService.advanceOrder → Order/History/Outbox trong transaction → commit → response`.

- `advanceOrder` nạp actor, khóa Order, so `expected_status`, kiểm dữ liệu và tra `NEXT`. Đây là nơi chứa nghiệp vụ chính.
- `NEXT` không có cạnh bắt đầu từ Shipping. Không có controller/route cho phép Admin/Staff hoàn tất hoặc thu tiền COD.
- Online chỉ được Processing → Shipping khi paid. COD sang Shipping giữ nguyên payment_status và stock.
- Thành công ghi Order cùng history; chỉ Shipping thêm job email. Không gọi Nodemailer khi đang giữ transaction Order.
- Nếu ghi DB/history/outbox lỗi thì transaction không hoàn tất. Điều này khác lỗi SMTP sau commit: lỗi SMTP không rollback Order.
- Bulk gọi cùng service cho từng Order riêng. Một HTTP 200 bulk chứa nhiều `results`, trong đó có thể có cả success và failure. UI lưu bảng kết quả từng ID.

Ví dụ thao tác hợp lệ theo code:

```js
const NEXT = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipping",
};
```

Đây là bảng chuyển quyền thao tác, không phải thay đổi danh sách sáu giá trị enum trong DB.

### D.3. Hủy thành công, hủy bị từ chối và replay

**Cổng quản trị:** reason bắt buộc, operator=true. **Cổng khách:** operator=false, tìm Order kèm user_id và chỉ tự hủy từ Pending. Cả hai đi vào cùng `orderStatusService.cancelOrder`.

1. Khóa Order trước, rồi đọc attempt theo Order/actor/request_id.
2. Attempt cùng fingerprint đã tồn tại: trả response đã lưu. Payload khác cùng key: trả REQUEST_REUSED. Không đi tiếp hoàn kho hoặc tạo email.
3. Với yêu cầu mới, kiểm trạng thái nguồn, dữ liệu thanh toán, mốc hủy và paid.
4. Nếu hợp lệ, đọc items, gom lượng theo variant, khóa variants theo thứ tự ID. Kiểm hết quantity/sold_count/overflow trước khi increment.
5. Hủy thành công cập nhật kho + Order metadata + history + attempt + outbox trong cùng transaction.
6. Hủy bị từ chối nghiệp vụ chỉ ghi attempt và email lý do; Order/kho/history không đổi. Trả 409 **sau khi** transaction ghi kết quả từ chối đã commit.
7. Lỗi kỹ thuật được xử lý bằng transaction phục hồi: đọc lại attempt trước khi kết luận. Nếu transaction trước đã commit nhưng mất phản hồi, trả kết quả thật; nếu chưa có, ghi lỗi công khai và outbox thất bại khi DB cho phép.

Khác biệt quan trọng với một mẫu “throw lỗi ngay” thông thường:

```js
// Callback transaction trả outcome để lưu được kết quả hủy bị từ chối.
if (!outcome.success) {
  throw problem(outcome.message, outcome.statusCode, outcome.code);
}
```

Đoạn trên nằm sau transaction chính/phục hồi. Nếu throw ngay trong nhánh từ chối của transaction chính, bản ghi email hủy thất bại cũng bị rollback.

FE khách nhận 409 sẽ tải lại Order rồi giữ lý do từ chối; Admin hook cũng refresh khi mutation lỗi. Lỗi mạng chưa có kết luận giữ request_id cho retry. Một yêu cầu chưa đến BE, không xác thực hoặc không tìm được Order thuộc quyền không tạo thông báo tới người nhận suy đoán.

### D.4. Email sau commit

`queueOrderEmail → order_email_outbox → orderEmailWorker.run → processNextEmail → claimEmail → Nodemailer → cập nhật tình trạng outbox`.

- Recipient snapshot ưu tiên email trên Order; nếu trống dùng email tài khoản. Thiếu địa chỉ hợp lệ tạo skipped, không chặn nghiệp vụ.
- Worker chỉ authenticate DB, không sync/alter schema. Claim job có khóa và lease; SMTP chạy sau khi giao dịch claim đã xong.
- Thử lần đầu lỗi: hẹn lại sau 60 giây. Lần hai lỗi: hẹn sau 240 giây. Lần thứ ba lỗi: failed, không chọn lại như một pending job.
- Worker nhận lại sending đã hết lease khi tiến trình cũ bỏ dở. Update cuối phải khớp lease_token, hạn chế worker cũ ghi đè job đã được nhận lại.
- Template hiện có đúng ba event: shipping, cancelled, cancel_failed. Không có thông báo Confirmed/Processing. Không có sự kiện giao thành công mới vì phần Shipper chưa được triển khai.
- Email không chứa actor/history nội bộ. HTML được escape; raw SMTP exception không lưu vào last_error hoặc đưa vào response.
- Outbox sent chỉ là kết quả transport được chấp nhận theo code, không phải bằng chứng thư vào inbox. SMTP mất ACK có thể dẫn tới thư trùng khi retry.

**Vận hành code đã có:** trong BE dùng `npm run migrate:orders` để chuẩn bị cấu trúc và `npm run worker:order-email` để chạy gửi thư, bên cạnh HTTP server. Các lệnh này đã được thêm vào package; báo cáo không khẳng định migration đã chạy trên DB cửa hàng hoặc worker đang gửi email thật.

### D.5. Dữ liệu khách và lifecycle giao diện

API khách lọc user_id và chỉ xuất metadata hủy/thời điểm từ history cần cho người mua, không xuất actor hoặc outbox. `needsOrderReview/canCustomerCancelOrder` được dùng chung bởi Card/Drawer; timeline không dùng ngày tạo thay ngày giao/hủy.

Layout Admin giữ Outlet mounted và chỉ bật loading theo pathname. Đổi query tab dùng loading của màn đơn hàng, tránh gỡ hook làm mất filter/drawer. Mutation dùng busyRef để khóa ngay và fieldset disabled để phản hồi UI; transaction BE vẫn là tầng bảo vệ thật khi nhiều client đồng thời.

## E. Đánh giá phương án triển khai

### E.1. Quy tắc tập trung, transaction và idempotency

**Lựa chọn:** một service trạng thái dùng chung cho hai API hủy, Order row lock, expected_status và attempt có unique key/fingerprint.

**Lý do:** UI không thể bảo vệ trước hai người khác nhau; chỉ đọc status rồi save như code cũ có cửa sổ race. Khóa Order tuần tự hóa thao tác trên cùng đơn; expected_status kiểm ý định từ dữ liệu người dùng đã xem. Attempt giúp trả kết quả sau retry thay vì thực hiện lại.

**Đánh đổi:** transaction và bảng attempt tăng truy vấn/lưu trữ; `loadActor` được gọi lại ở mutation và từng đơn bulk. Với giới hạn tám đơn, code tuần tự dễ hiểu hơn parallel bulk có nhiều lỗi khóa. Không xây state machine tổng quát, message bus hoặc kiểu domain phức tạp chưa cần.

**Điểm chưa giải quyết toàn hệ thống:** khâu tạo đơn/trừ kho cũ không được viết lại trong tác vụ. Các test concurrency mới chứng minh duyệt/hủy và hủy lặp, không chứng minh mọi tình huống checkout đồng thời của toàn hệ thống đã hết race.

### E.2. Outbox thay vì gửi SMTP trong request

**Lựa chọn:** ghi sự kiện bền cùng transaction nghiệp vụ, worker riêng retry có giới hạn.

**Lý do:** gửi đồng bộ đơn giản hơn nhưng lỗi SMTP có thể kéo dài request hoặc khiến người dùng retry hành động đã thành công. Chỉ gọi sendMail sau response mà không lưu job thì dễ mất thư khi process dừng. Outbox dùng MySQL đang có nên không thêm dependency hay dịch vụ queue.

**Đánh đổi/giới hạn:** phải chạy và giám sát worker riêng; chưa thêm supervisor hoặc dashboard worker. Có thể không gửi được nếu thiếu cấu hình SMTP, không có recipient hoặc transport liên tục lỗi. Unique event ngăn tạo nhiều job do replay, không bảo đảm exactly-once ở SMTP. Lease hết hạn đã được mô phỏng trong test, chưa kiểm kill/restart thật nhiều worker.

### E.3. Kiến trúc TechStore và khả năng đơn giản hóa

Code tuân theo Route → Validator → Controller → Service → Model. Controller không giữ transaction/kho; FE đi qua hook và httpClient Fetch. Middleware riêng cho đơn giữ requireAdmin hiện có cho các chức năng khác.

Ba dữ liệu history/attempt/outbox có trách nhiệm khác nhau: trạng thái thực sự thay đổi, kết quả yêu cầu và kết quả gửi thư. Gộp chúng vào một bảng log sẽ làm khó phân biệt hủy thất bại với chuyển Cancelled, hoặc gửi email lại với thực hiện nghiệp vụ lại.

Các điểm có thể đơn giản hóa mà chưa cần đổi hành vi:

- `exportOrdersCsv` đang nằm cùng API service và thao tác DOM; có thể tách utility khi cần tái sử dụng/export định dạng khác.
- `getOrdersByUser` đang tìm history bằng find trong mỗi Order; có thể dựng Map nếu lượng lịch sử lớn, nhưng chưa có benchmark để tuyên bố cần tối ưu ngay.
- Một số DTO/service vẫn viết ngắn trong một dòng; có thể định dạng lại cho dễ review, không coi đó là sửa lỗi nghiệp vụ. Controller quản trị đơn đã được chuẩn hóa theo Category ngày 18/11.
- Helper quyền hủy khách trước đó bị lặp đã được gom vào constants/orderStatus; đây là refactor đã thực hiện, không phải đề xuất còn bỏ ngỏ.

### E.4. Ảnh hưởng hệ thống và rủi ro cụ thể

| Khu vực | Ảnh hưởng/rủi ro thực tế | Phạm vi đã xử lý hoặc giới hạn |
| --- | --- | --- |
| Contract hủy khách | Caller cũ không có request_id/expected_status bị 400 | FE và các mẫu hủy được cập nhật; client bên ngoài repository chưa được kiểm |
| DB | Thêm ba cột orders và ba bảng history/attempt/outbox | Không đổi users.role, enum hiện có hoặc backfill; migration cần chạy trước trên môi trường sử dụng |
| Runtime schema | db.js vẫn sync({alter:true}) | Tác vụ không bỏ cơ chế này; cần tính tới khi triển khai, không gọi migration là thay thế toàn bộ quản lý schema |
| ErrorHandler chung | Thông điệp 500 của mọi API thành thông điệp an toàn | Không chỉ đơn hàng bị ảnh hưởng; chưa nghiệm thu thủ công mọi module cũ |
| Transport dùng chung OTP | Bật verify TLS, secure theo port và timeout | Tăng ràng buộc kết nối; SMTP tự ký có thể bị từ chối; chưa kiểm OTP qua SMTP thật |
| Dữ liệu mô tả sản phẩm | Tên/SKU/thuộc tính đọc từ quan hệ hiện tại | Giá/số lượng lấy OrderItem; chưa có snapshot tên mới để bảo toàn tên tại thời điểm mua |
| Hiệu năng danh sách | LIKE nhiều cột, count/group và include items | Giới hạn số Order mỗi trang; chưa đo với dữ liệu lớn, không cam kết thời gian cụ thể |
| Dữ liệu email | Recipient/payload tồn tại trong outbox | Không có credentials trong payload, không trả cho khách; chưa thêm retention policy |
| Email hủy thất bại | Key mới là một Cancellation Attempt mới | Chống replay cùng key không phải cơ chế chống mọi trường hợp gửi nhiều yêu cầu khác key; chưa thêm limiter riêng endpoint |
| Layout Admin | Giữ Outlet ảnh hưởng mọi trang quản trị | Đã kiểm màn đơn hàng, chưa nghiệm thu riêng từng màn khác |
| In | CSS print tác động body khi modal tồn tại | Chưa kiểm nhiều trang/driver máy in; không tuyên bố phiếu là hóa đơn pháp lý |
| Legacy Cancelled ở drawer quản trị | Câu “kho đã được tự động hoàn trả” kế thừa vẫn hiển thị mà không xét history | Không dùng câu UI này làm bằng chứng kho của đơn cũ; nội dung này còn cần chỉnh/kiểm riêng |

Không thêm dependency hoặc biến môi trường mới trong diff của chức năng. Các thư viện được cài từ lockfile để kiểm tra; không tính đó thành thay đổi version dependency. Dòng xóa sẵn ở package-lock.json gốc được loại khỏi công việc Agent.

### E.5. Standards — kết quả đối chiếu quy tắc dự án

Nguồn: AGENTS.md, .agentrules.md, ADR0001, glossary và ADR0004. DESIGN.md/skills-lock.json ở worktree bị gitignore nên đã đọc bản tương ứng tại checkout TechStore gốc.

- Chưa phát hiện vi phạm cứng mới về phân tầng, native Fetch/cookie, Sequelize hoặc validation riêng.
- Điều kiện hủy trùng giữa Card/Drawer đã được chuyển sang helper chung.
- Sáu file Postman mới đã đổi phần tên file sang camelCase; trường name trong YAML vẫn là tên dễ đọc. Tên PascalCase của các component khách và tên mẫu 404 là file có sẵn.
- **Possible Divergent Change** còn cần cân nhắc: API service FE chứa cả HTTP/normalize và Blob/DOM download CSV. Đây là heuristic thiết kế, chưa phải lỗi chức năng và chưa được tách trong code.
- CSS print toàn cục có mục đích cô lập bản in; không tự động coi là vi phạm Tailwind vì utility không đủ cho thao tác toàn body.

**Tổng Standards sau sửa review:** 0 vi phạm cứng mới còn được xác định; 1 heuristic còn lại, đáng lưu ý là trách nhiệm CSV trong API service.

### E.6. Spec — kết quả đối chiếu yêu cầu đã chốt

Ba thiếu sót xác định qua review đã được khắc phục:

1. Khách hủy bị 409 hiện đã refetch dữ liệu rồi giữ lý do lỗi; có test hồi quy.
2. Legacy thiếu status/payment/method hiện Cần kiểm tra, không giả COD và không mở nút hủy; helper chung và test render đã có.
3. Postman có năm request quản trị, một request hủy khách và sửa mẫu 404 để gửi payload hợp lệ. Đây là bàn giao file, chưa phải collection đã chạy thành công.

Chưa thấy mở quyền Completed/Shipper hoặc email Confirmed/Processing trái phạm vi. Email giao thành công chỉ được ghi là yêu cầu cho nâng cấp sau; chưa có trigger/endpoint tương ứng trong code mới.

**Tồn tại được người viết báo cáo ghi thêm:** câu thông báo hoàn kho trong drawer quản trị chưa phân biệt Cancelled legacy thiếu history. Đây là hạn chế hiển thị còn hiện diện, không được mô tả là đã giải quyết chỉ vì backend hủy mới có transaction đúng.

**Tổng Spec:** 3 thiếu sót đã sửa; còn 1 điểm hiển thị legacy cần xử lý/kiểm chứng trước khi coi nghiệm thu toàn bộ hoàn tất. SMTP thật, mobile, in nhiều trang và nâng cấp schema cũ là giới hạn kiểm chứng riêng, không phải tính năng đã triển khai thành công.

## F. Kiểm thử và nghiệm thu

### F.1. Lệnh đã thực hiện và phạm vi bằng chứng

| Lệnh/hoạt động | Thư mục/môi trường | Kết quả thực tế | Không được suy ra thêm |
| --- | --- | --- | --- |
| npm ci --no-audit --no-fund | BE và FE/my-app | Cài dependency theo lockfile để chạy kiểm tra | Không phải thay version dependency trong source |
| npm test | BE, MySQL 8.4.3 tạm cổng 33317, DB_HOST=127.0.0.1 | **22/22 pass**, gồm 12 test đơn hàng mới, 6 product search và 4 banner | Không chạy trên DB cửa hàng hoặc gửi email khách |
| node --test tests/orderStatusApproval.test.js | BE, schema techstore_order_test_<pid> | Bộ test mới đã chạy thành công sau sửa; lần full suite cuối xác nhận 12 ca mới | Không chứng minh schema cũ/DB thật đã migrate |
| node --check src/services/orderStatusService.js; node --check src/services/admin/orderService.js | BE | Kiểm cú pháp các module được chỉ định thành công | Không phải lint toàn bộ backend; BE chưa có npm lint riêng trong diff |
| node --test tests/orderManagement.test.mjs | FE/my-app | **6/6 pass** sau bổ sung hồi quy 409/legacy | Không phải browser/mobile E2E |
| npm test | FE/my-app, lần chạy cuối | **25/25 pass** | Có cảnh báo HMR port 24678 đã được dùng bởi môi trường Vite khác; test không fail |
| npm run lint | FE/my-app sau các sửa FE cuối | Thành công | Không khẳng định mọi vấn đề kiến trúc bị lint phát hiện |
| npm run build | FE/my-app sau các sửa FE cuối | Thành công; có cảnh báo bundle JS hơn 500 kB sau minify | Chưa làm code splitting hoặc tối ưu bundle trong tác vụ |
| orca-cli: login fixture, mở /admin/orders, lọc Processing, mở QA-4, chuyển Shipping, đọc DOM và screenshot | Vite 4318/API 4317, schema browser riêng, worker tắt | Staff thao tác được, đơn ra khỏi filter nhưng drawer còn mở; history và email Chờ gửi hiện; không có nút Completed | Không có email được gửi thật; chưa kiểm mobile hoặc mọi luồng bằng browser |

Cấu hình DB test được cấp qua môi trường của tiến trình, tên schema do test tự sinh và có prefix kiểm tra. Không ghi giá trị mật khẩu/JWT/SMTP vào báo cáo. MySQL tại cấu hình mặc định ban đầu không kết nối được; kết quả pass nêu trên thuộc instance tạm riêng, không thuộc DB cửa hàng.

### F.2. Ma trận kiểm chứng chức năng quan trọng

| Trường hợp | Kết quả mong đợi theo yêu cầu | Kết quả thực tế/bằng chứng |
| --- | --- | --- |
| Admin/Staff tiến tuần tự | Chỉ Pending → Confirmed → Processing → Shipping; không trừ kho lại, không tự paid COD | Pass test HTTP/DB: status/history, stock và payment_status được assert; browser Staff Shipping đã kiểm |
| Bỏ bước, state cũ hoặc Completed | Từ chối, không tạo một cạnh thành công khác | Pass test 409 cho nguồn/đích không hợp lệ; target Completed bị validator 400 |
| Quyền, khóa tài khoản, ownership | Khách không gọi quản trị, Staff bị khóa không thao tác, người khác không hủy đơn | Pass các test 401/403/404; unauthorized không tạo thêm email |
| Online giao trước thanh toán | pending/failed chưa giao, paid mới được Shipping | Pass test pending bị PAYMENT_REQUIRED rồi paid được chuyển |
| Legacy thiếu dữ liệu | BE chặn mutation, FE Cần kiểm tra và không tự gán COD | Pass NEEDS_REVIEW và test render Card/Drawer null; stepper có nhánh unknown |
| Hủy lặp đồng thời cùng key | Hai response replay phù hợp nhưng chỉ một hoàn kho/history/attempt/job | Pass Promise.all; stock +quantity, sold_count -quantity và count bản ghi đúng một |
| Dùng lại key khác payload | Từ chối REQUEST_REUSED | Pass test HTTP |
| Paid không được hủy | Giữ Order/kho; email thất bại có lý do; không history Cancelled | Pass DB assertions và payload cancel_failed |
| Khách hủy Pending | Thành công, fallback email tài khoản khi email Order trống; API khách không lộ actor/outbox | Pass recipient, cancelled_at/status_changed_at và trường bị loại |
| Staff duyệt cạnh tranh khách hủy | Chỉ một thao tác hợp trạng thái nguồn được commit | Pass một HTTP200/một409 và một history |
| Bulk có đơn hợp lệ/lỗi | Thành công một phần, giữ kết quả từng ID | Pass HTTP updatedCount/failedCount và FE bulkResult; click lặp không thêm request |
| Filter/sort/page/mã dự phòng | Filter/sort trước limit, total đúng, vượt trang clamp, TS-ID tìm được | Pass test HTTP và metadata/query FE |
| Outbox ghi lỗi khi chuyển Shipping | Rollback cả Order và history | Pass hook DB gây lỗi; status vẫn Processing, history rỗng |
| Lỗi kỹ thuật khi hủy | Rollback kho/status; sau phục hồi ghi attempt/email thất bại, không lộ lỗi SQL | Pass test history hook lỗi, stock/status/history/outbox và replay kết quả |
| Quantity sai/recipient thiếu | Không hoàn kho một phần; thiếu địa chỉ không chặn nghiệp vụ hợp lệ | Pass test quantity âm và status skipped/MISSING_VALID_RECIPIENT |
| SMTP lỗi/retry/lease | Tối đa ba lần, không rollback đơn; job hết lease có thể nhận lại | Pass với sendMail giả và now test; chưa kiểm SMTP thật hoặc kill worker OS |
| Nội dung email | Có lý do thất bại và escape HTML; không tạo email Confirmed/Processing | Pass payload và escape test; test chuyển ba bước chỉ tạo một job Shipping |
| Search response về muộn | Kết quả query cũ không ghi đè query mới | Pass test HTTP boundary với request cũ vẫn resolve sau abort |
| Đổi page/filter/tab | Bỏ selection, retry giữ tiêu chí | Pass test hook/MemoryRouter |
| Drawer khi đơn rời filter | Giữ mở, đọc detail riêng | Pass test hook và thao tác browser thật |
| Khách hủy nhận409 | Refetch Order mới, giữ message từ chối | Pass test mới: GET my-orders, status confirmed và lỗi vẫn hiện |
| Migration gọi lại | Không lỗi khi cấu trúc mới đã tồn tại | before test đã gọi migrate hai lần sau sync; chưa kiểm nhánh addColumn trên schema cũ |
| CSV/phiếu in | CSV trang hiện tại, dữ liệu thật và không barcode/thông tin mẫu | Đã đọc code; chưa mở CSV bằng spreadsheet hoặc nghiệm thu bản in nhiều trang |
| Request Postman | Payload/URL khớp API mới | Đã đối chiếu source/validator; chưa thực thi collection |

### F.3. Những phần chưa nghiệm thu hoặc chưa triển khai

- Chưa chạy migration trên DB cửa hàng, chưa thử bản sao schema cũ thiếu ba cột bằng một test nâng cấp riêng.
- Chưa gửi email qua SMTP thật, chưa kiểm nhận inbox/OTP thật sau đổi TLS và timeout.
- Chưa chạy worker nhiều tiến trình hoặc kill/restart OS; hiện chỉ có test giả lập lease hết hạn/retry.
- Chưa chạy collection Postman, chưa nghiệm thu CSV trong ứng dụng bảng tính, bản in nhiều trang hoặc UI mobile/keyboard đầy đủ.
- Chưa có Shipper/Completed, giao thành công mới/COD thu tiền, hoàn tiền, trả hàng hoặc gateway online. Đây là phần ngoài phạm vi đã chốt, không được ghi thành đã làm.
- Câu “hoàn kho” cho Cancelled legacy trong drawer quản trị còn cần điều chỉnh hoặc kiểm bằng chứng.
- Chưa có benchmark dữ liệu lớn, retention outbox hoặc process supervisor; không tuyên bố đáp ứng ngưỡng hiệu năng/vận hành chưa đo.

### F.4. Đối chiếu báo cáo với code

Báo cáo đã thay nội dung nhật ký/kế hoạch cũ bằng phân tích mã nguồn. Phần B có 46 file, phần C có 46 mục riêng; mỗi khối quan trọng trả lời đủ bảy câu hỏi và có so sánh trước/sau phù hợp.

Việc kiểm tra cuối của lượt sửa tài liệu gồm so khớp danh sách Git (tracked + untracked, staged riêng), kiểm tra đường dẫn/link, đủ mục A–F, đủ nhãn phân tích và git diff --check. Kết quả kiểm tra tài liệu được ghi sau khi thực sự chạy; không tính các kiểm tra cấu trúc Markdown là test chức năng sản phẩm.

**Kết quả kiểm tra tài liệu đã chạy:** khớp 46/46 file với danh sách Git, gồm 22 tạo mới và 24 sửa; bảng B có 46 dòng và phần C có 46 mục không trùng. Có 79 khối phân tích, mỗi khối đủ bảy câu trả lời cùng phần trước/sau. Cả 46 liên kết file đều tồn tại; đủ A–F và hai mục con bắt buộc của từng file; không còn placeholder biên soạn. Không có file staged; git diff --check thành công, chỉ có cảnh báo LF/CRLF của Git.

**Checklist chất lượng báo cáo:**

- [x] Đã phân biệt thay đổi Agent với package-lock.json gốc có sẵn.
- [x] Đã liệt kê đủ file code/cấu hình/request tạo mới hoặc sửa, không có file code bị xóa.
- [x] Đã phân tích riêng từng file và xác định function/khối logic liên quan.
- [x] Đã giải thích đầu vào, điều kiện kiểm tra, bước xử lý và kết quả.
- [x] Đã nêu mục đích, chức năng, lý do lựa chọn và tác dụng cốt lõi.
- [x] Đã so sánh trước/sau với phần sửa và chỉ rõ ảnh hưởng qua các tầng.
- [x] Đã đánh giá phương án, rủi ro và hạn chế còn hiện diện, không gọi chúng là đã giải quyết.
- [x] Đã tách kết quả test thật với checklist chưa chạy và phần nâng cấp sau.
- [x] Đã kiểm đường dẫn, số lượng mục phân tích và tính đầy đủ so với diff.
- [x] Phân biệt lần biên soạn báo cáo với lần sửa code; tác vụ chuẩn hóa controller ngày 18/11 có báo cáo riêng, không dùng kiểm Markdown để tuyên bố nghiệm thu chức năng chưa chạy.


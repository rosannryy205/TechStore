# Kế hoạch triển khai duyệt trạng thái đơn hàng

Trạng thái: bản tổng hợp sau phỏng vấn, chờ xác nhận cách hiểu trước khi triển khai. Các file, API, schema và bài kiểm thử dưới đây là kế hoạch, chưa được tạo hoặc chạy như chức năng hoàn chỉnh.

Căn cứ: [quyết định Q1–Q24](./orderStatusApprovalInterview.md), [GLOSSARY.md](../GLOSSARY.md), [ADR0004](./adr/0004-order-shipping-role-boundary.md) và [nhật ký thay đổi](./2026-11-14-duyet-trang-thai-don-hang.md). Khi có khác biệt với đề xuất cũ, dùng bản chốt hiện hành trong tài liệu này và lời nhắn mới nhất của người dùng.

## 1. Phạm vi bàn giao

Kết nối màn quản trị hiện có với đơn hàng thật, triển khai API quản trị, quy tắc duyệt/hủy, lịch sử, chống xử lý lặp và thông báo email. Giữ tìm kiếm, lọc, sắp xếp, phân trang 8 đơn, CSV trang hiện tại và in phiếu từng đơn; bỏ thao tác/dữ liệu mẫu.

Admin và Staff có cùng quyền với chức năng đơn hàng, chỉ chuyển tuần tự đến Shipping. Không mở quyền Staff cho các chức năng quản trị khác. Shipping chưa phải trạng thái kết thúc vòng đời Order, nhưng là điểm dừng thao tác của hai vai trò này trong bản hiện tại.

Không triển khai account/role/giao diện/endpoint Shipper, Shipping → Completed, xác nhận COD đã thu tiền, hoàn tiền, trả hàng, giao thất bại, tích hợp hãng vận chuyển, mã vận đơn bắt buộc, cổng VNPAY/MoMo, polling hoặc realtime. Dữ liệu Completed đã có vẫn xem được. Email giao thành công là yêu cầu dành cho nâng cấp Shipper, không tạo quyền hoàn tất tạm cho Admin/Staff.

## 2. Ma trận chuyển trạng thái và điều kiện

| Thao tác | Người thực hiện | Điều kiện | Kết quả trong bản hiện tại |
| --- | --- | --- | --- |
| Pending → Confirmed | Admin/Staff | Trạng thái nguồn còn khớp dữ liệu đã xem, dữ liệu cần thiết hợp lệ | Cập nhật trạng thái, ghi lịch sử; không email |
| Confirmed → Processing | Admin/Staff | Như trên | Cập nhật trạng thái, ghi lịch sử; không email |
| Processing → Shipping, COD | Admin/Staff, từng đơn | Kiểm tra trạng thái và dữ liệu hợp lệ | Ghi lịch sử, tạo thông báo Đang giao; không tự đổi payment_status sang paid |
| Processing → Shipping, VNPAY/MoMo | Admin/Staff, từng đơn | Thêm payment_status=paid | Như trên; pending/failed bị chặn giao |
| Pending/Confirmed/Processing → Cancelled | Admin/Staff | Chưa paid, trạng thái còn khớp, lý do hủy bắt buộc | Hủy, hoàn kho một lần, ghi lịch sử và kết quả yêu cầu, tạo email hủy thành công |
| Pending → Cancelled | Chủ đơn | Chưa paid và đơn vẫn Pending | Cùng quy tắc nguyên tử/hoàn kho/email; không tự bắt buộc thêm lý do từ khách |
| Hủy bị từ chối | Người có quyền gửi yêu cầu hợp lệ cho đúng đơn | Ví dụ đã paid, đã Shipping, trạng thái thay đổi hoặc đơn đã kết thúc | Giữ nguyên đơn/kho, ghi kết quả yêu cầu thất bại và lý do công khai, tạo email hủy thất bại |
| Shipping → Completed hoặc cạnh khác ngoài ma trận | Admin/Staff | Không được cấp quyền | BE từ chối, FE không có thao tác hoàn tất |

Không bỏ bước, quay lùi hoặc mở lại đơn Cancelled/Completed. Hủy không được dùng để thay thế luồng giao thất bại/trả hàng.

Giữ thời điểm trừ stock/tăng sold_count khi tạo đơn. Duyệt không trừ kho lại; hủy đảo đúng lượng đã ghi nhận một lần. Không sửa giá chốt hoặc số lượng Order Item trong chức năng này. Không coi hủy đơn là bằng chứng thanh toán thất bại và không giả lập kết quả thanh toán.

Đơn cũ có order_status/payment_status/payment_method thiếu hoặc không nhận diện được phải hiển thị Cần kiểm tra; chặn thao tác phụ thuộc vào dữ liệu thiếu. Không tự đoán hoặc backfill trạng thái/lịch sử. Thiếu order_code dùng nhãn hiển thị TS-{id}, không ghi đè mã đã tồn tại.

## 3. Thông báo email theo Q23 mới nhất

| Sự kiện | Có email? | Phạm vi |
| --- | --- | --- |
| Tạo đơn, Confirmed, Processing | Không | Không phát thông báo ở các bước này |
| Chuyển thành công sang Shipping | Có | Bản hiện tại |
| Hủy thành công bởi khách/Admin/Staff | Có | Bản hiện tại, có lý do hủy nếu được cung cấp |
| Hủy thất bại sau khi xác định đúng người/đúng đơn và có kết luận xử lý | Có | Bản hiện tại, bắt buộc nêu lý do thất bại dễ hiểu |
| Giao thành công/Completed | Có, trong nâng cấp sau | Chưa có sự kiện này từ chức năng mới vì Shipper chưa triển khai |

Ưu tiên receiver_email khách cung cấp trên đơn; nếu bỏ trống dùng email tài khoản đặt đơn. Nếu không có địa chỉ hợp lệ, nghiệp vụ vẫn thực hiện và ghi nhận không gửi được vì thiếu địa chỉ. Chốt người nhận tại thời điểm tạo thông báo; không sửa Order chỉ để đổi địa chỉ email.

Email tiếng Việt gồm mã đơn/nhãn dự phòng, kết quả hoặc trạng thái mới, thời điểm và lý do liên quan. Không đưa tên nhân viên, lịch sử nội bộ, SQL, stack trace, token hoặc thông tin bí mật vào email. Escape dữ liệu người dùng khi tạo HTML; có bản text. Tái sử dụng cấu hình SMTP/MAIL_FROM hiện có, giữ luồng OTP hoạt động.

Phân biệt hủy thất bại với gửi email thất bại. Nếu yêu cầu hủy bị từ chối, thông báo nói rõ nguyên nhân như đã thanh toán/đang giao/trạng thái đã thay đổi. Nếu lỗi hệ thống đã xác định khiến hủy không thực hiện được, dùng lý do công khai phù hợp thay vì lỗi nội bộ, ghi thông báo khi kênh lưu trữ đã hoạt động. Không tuyên bố hủy thất bại chỉ vì client bị timeout hoặc SMTP lỗi: cần kiểm tra kết quả thực tế trước để tránh báo sai khi đơn đã hủy.

Request chưa đến BE hoặc chưa xác thực/chưa xác định được đúng quyền đối với đơn không phải một Cancellation Attempt đã được hệ thống xử lý; không gửi thông tin đơn cho địa chỉ suy đoán. Lỗi nhập liệu được trả để sửa trước khi tiếp nhận xử lý. Nếu cả DB/kênh ghi nhận đều không hoạt động, không cam kết lưu hoặc gửi được thông báo; đây là giới hạn hạ tầng cần phản ánh khi nghiệm thu.

## 4. Dữ liệu và luồng xử lý dự kiến

| Thành phần dự kiến | Dữ liệu chính và trách nhiệm |
| --- | --- |
| orders | Bổ sung lý do/người/thời điểm hủy cần cho hiển thị, giữ nguyên enum hiện có; không thêm shipper vào users ở đợt này |
| order_status_history | Order, actor, trạng thái trước/sau, thời điểm, lý do nếu có; chỉ lưu chuyển trạng thái thực sự thành công |
| order_cancellation_attempts | Order, actor, mã yêu cầu duy nhất, dấu nhận diện payload, kết quả thành công/thất bại, lý do công khai và thời điểm; tách yêu cầu thất bại khỏi lịch sử trạng thái |
| order_email_outbox | Sự kiện/kết quả yêu cầu, địa chỉ nhận, dữ liệu email tối thiểu, trạng thái gửi, số lần thử, lần thử tiếp và lỗi đã làm sạch; khóa duy nhất ngăn tạo nhiều job cho cùng sự kiện |

Các tên bảng/cột sẽ đối chiếu quy ước Sequelize khi triển khai; không lưu mật khẩu SMTP trong dữ liệu thông báo. Không trả outbox, địa chỉ người dùng khác hoặc lịch sử nhân viên cho API khách hàng.

Luồng cập nhật thành công: xác thực và validation → nạp quyền hiện tại → transaction/khóa Order → đối chiếu trạng thái người dùng đã xem và kiểm tra điều kiện → cập nhật Order, kho nếu hủy, history, kết quả yêu cầu và outbox liên quan → commit → trả kết quả → worker gửi email. Không gọi SMTP trong transaction cập nhật đơn.

Luồng hủy bị từ chối nghiệp vụ: kiểm tra quyền trước → ghi kết quả Cancellation Attempt cùng lý do và outbox thất bại → commit kết quả từ chối mà không sửa Order/kho hoặc tạo history chuyển trạng thái → trả lỗi nghiệp vụ phù hợp. Không throw để rollback mất luôn thông báo từ chối cần gửi. Lỗi kỹ thuật phải rollback thay đổi nghiệp vụ; chỉ ghi kết quả thất bại sau khi xác định được kết quả thực tế.

Mỗi yêu cầu hủy có mã chống xử lý lặp. Gửi lại cùng mã và cùng payload trả kết quả đã ghi; không hoàn kho, tạo history hoặc email thêm. Dùng lại mã với payload khác bị từ chối. UI giữ mã khi retry cùng một lần yêu cầu; một lần yêu cầu mới sau khi tải lại có mã mới.

Chuyển trạng thái cũng đối chiếu expected_status trong transaction và khóa bản ghi để chống hai người cùng duyệt hoặc khách hủy đồng thời. Chỉ một kết quả phù hợp trạng thái nguồn được commit; người còn lại nhận xung đột và dữ liệu mới. Không tự tiến thêm bước để chiều theo nút bấm cũ.

Outbox được lưu bền trong DB; worker riêng dùng lại Nodemailer, nhận việc có khóa/lease và khôi phục công việc sau restart. Mặc định kỹ thuật dự kiến tối đa 3 lần gửi với khoảng chờ tăng dần; thiếu địa chỉ không retry vô ích. Sau giới hạn vẫn giữ trạng thái lỗi để quản trị nhìn thấy. Không cần thêm Redis hoặc dịch vụ queue trong phạm vi này. Khóa sự kiện ngăn tạo nhiều job do request lặp; SMTP mất phản hồi sau khi nhận thư vẫn có thể gây gửi trùng khi retry, không cam kết tuyệt đối một thư ở hộp nhận.

Chuẩn bị migration có thể chạy lại để thêm cấu trúc cần thiết; kiểm thử trước trên schema riêng. Dự án hiện sync({alter:true}) khi khởi động, vì vậy cần đối chiếu migration/model với hành vi sync để không phát sinh alter ngoài dự kiến. Không seed/reset dữ liệu cửa hàng hoặc tự thay đổi enum trạng thái/role để phục vụ tính năng.

## 5. Hợp đồng API dự kiến

| API | Trách nhiệm |
| --- | --- |
| GET /api/admin/orders | Tìm/lọc/sort trước phân trang; trả data, metadata và số đếm đúng quy ước hiện có |
| GET /api/admin/orders/:id | Chi tiết độc lập với trang/filter; lịch sử trạng thái và tình trạng email dành cho quản trị |
| PATCH /api/admin/orders/:id/status | Chỉ cạnh tiến đến Shipping; nhận target_status và expected_status, BE tự quyết quyền và điều kiện |
| POST /api/admin/orders/bulk-status | Danh sách ID cùng trạng thái nguồn đã xem, đích Confirmed hoặc Processing; từng đơn là một kết quả độc lập |
| PUT /api/admin/orders/:id/cancel | Lý do, expected_status và mã yêu cầu; hủy hoặc trả kết quả từ chối có lý do |
| PUT /api/orders/:id/cancel | Giữ route khách hiện có; bổ sung chống lặp/khóa/điều kiện paid, lịch sử và email cho chủ đơn |
| GET /api/orders/my-orders | Giữ dữ liệu caller hiện tại; bổ sung lý do hủy và thời điểm có bằng chứng, không công khai lịch sử nội bộ |

Giữ cấu trúc success/data/message nhất quán dự án; lỗi có mã nghiệp vụ cần cho UI phân biệt dữ liệu cũ, thanh toán và giới hạn quyền. HTTP 400 cho payload, 401/403 cho xác thực/quyền, 404 cho đơn không truy cập được, 409 cho xung đột trạng thái, 500 cho lỗi hệ thống không công khai chi tiết. Kết quả bulk gồm tổng thành công/thất bại và từng ID với kết quả/lý do; không trả thành công chung rồi che lỗi từng đơn.

Validation dùng express-validator: ID/số trang/limit, trạng thái đích từ allowlist, trạng thái nguồn, mã yêu cầu, danh sách ID không trùng và tối đa 8 đơn tương ứng trang hiện tại, reason trim và giới hạn độ dài, query filter/sort từ allowlist. Không nhận actor/role/tồn kho hoặc kết quả thanh toán do client tự khai.

Tìm theo mã đơn/nhãn TS-{id}, người nhận, điện thoại và email. Lọc phương thức, trạng thái thanh toán, khoảng ngày, tab trạng thái; sort mới/cũ/giá cao/thấp. Truy vấn BE tính total/sort/filter trước limit/offset; Order xuất hiện một lần dù có nhiều items/history. Badge tab giữ đếm toàn bộ đơn như hiện tại, header dùng tổng sau lọc. Khi trang rỗng sau cập nhật, điều chỉnh trang và tải lại; không xóa filter/sort.

## 6. Danh sách file dự kiến theo tầng

Đây là danh sách triển khai dự kiến, không phải nhật ký file mã nguồn đã thay đổi. File hỗ trợ/test thực tế phát sinh sẽ được ghi chính xác trong báo cáo khi hoàn thành.

| Nhóm | File dự kiến | Nội dung |
| --- | --- | --- |
| Quyền và validation BE | `BE/src/middleware/requireOrderOperator.js`, `BE/src/validators/adminOrderValidators.js`, `BE/src/validators/orderValidators.js` | Quyền Admin/Staff riêng cho đơn hàng; validation quản trị và khách |
| HTTP quản trị | `BE/src/app.js`, `BE/src/routes/admin/orderRoutes.js`, `BE/src/controllers/admin/orderController.js` | Mount API; controller chỉ nhận request, gọi service và trả kết quả/try-catch |
| Service nghiệp vụ | `BE/src/services/orderStatusService.js`, `BE/src/services/admin/orderService.js`, `BE/src/services/client/orderService.js` | Quy tắc dùng chung, query/dto, bulk từng đơn, khóa/trừ hoàn kho/lịch sử/kết quả hủy |
| Dữ liệu | `BE/src/models/orderModel.js`, `BE/src/models/orderStatusHistoryModel.js`, `BE/src/models/orderCancellationAttemptModel.js`, `BE/src/models/orderEmailOutboxModel.js`, `BE/src/models/index.js` | Model và associations, phân biệt trạng thái đơn/kết quả yêu cầu/tình trạng gửi |
| Schema | `BE/src/migrations/addOrderStatusApproval.js` | Thêm cấu trúc an toàn, chạy lại không phá dữ liệu; không sửa role Shipper |
| Email/worker | `BE/src/services/client/emailService.js`, `BE/src/services/orderEmailService.js`, `BE/src/workers/orderEmailWorker.js`, `BE/package.json` | Tái sử dụng SMTP, template tiếng Việt, retry bền và lệnh chạy worker; giữ API OTP |
| FE quản trị API/hook | `FE/my-app/src/services/api/admin/orderService.js`, `FE/my-app/src/hooks/admin/useAdminOrders.js` | Bỏ phụ thuộc mock của luồng này, native Fetch qua httpClient, bỏ response cũ, partial bulk, chi tiết độc lập, selection trang hiện tại |
| FE quản trị UI | `FE/my-app/src/pages/admin/orders/orderManagement.jsx`, các file trong `FE/my-app/src/components/admin/orders/` | Quyền dừng Shipping, hủy đúng điều kiện, history/tình trạng email, loading/lỗi/rỗng, CSV/in, bỏ reset dữ liệu mẫu và nút paid thủ công |
| FE khách | `FE/my-app/src/services/api/client/orderService.js`, `FE/my-app/src/hooks/client/useUserProfile.js`, các file theo dõi đơn trong `FE/my-app/src/components/client/userProfile/` | Mã yêu cầu hủy, điều kiện paid, lý do kết quả và thời gian thật; không công khai actor/history nội bộ |
| Hằng số | `FE/my-app/src/constants/orderStatus.js` và hằng số BE cần thiết | Giữ đủ nhãn sáu trạng thái để đọc dữ liệu, tách quyền thao tác đến Shipping khỏi tập trạng thái |
| Test và Postman | `BE/tests/orderStatusApproval.test.js`, `BE/tests/orderEmail.test.js`, test FE theo convention Node/jsdom, `postman/collections/TechStore API/Orders/` và thư mục quản trị tương ứng | Kiểm chứng API/DB/SMTP giả/hook và request mẫu theo hợp đồng cuối |
| Tài liệu | Tài liệu phỏng vấn, kế hoạch, `GLOSSARY.md`, ADR liên quan và `docs/YYYY-MM-DD-ten-tac-vu.md` | Cập nhật theo diff thực tế, giải thích lý do và kiểm chứng, không mô tả kế hoạch thành chức năng đã có |

Không mặc định xóa mockOrderService nếu còn caller khác; kiểm tra tham chiếu rồi chỉ gỡ phần không còn dùng. Chưa dự kiến thêm dependency mới; nếu triển khai cần biến môi trường hoặc dependency thì cập nhật `.env.example`, lockfile và báo cáo chính xác, không ghi bí mật.

## 7. Hành vi FE và dữ liệu cũ

Trang quản trị giữ thiết kế/quy tắc hiện có trong DESIGN.md và ADR0001: component → hook → service → httpClient Fetch. Service/BE là nguồn dữ liệu thật, không fallback localStorage khi API lỗi. Loading tại vùng danh sách, empty có thông báo phù hợp, error có Thử lại và giữ tiêu chí; hủy request hoặc bỏ response cũ khi query thay đổi.

Sau cập nhật, refresh danh sách/số đếm và chi tiết bằng ID, giữ drawer mở ngay cả khi đơn rời filter. Chuyển filter/page bỏ selection; gửi yêu cầu thì khóa nút liên quan. Bulk chỉ Duyệt/Chuẩn bị và có bảng/tóm tắt lỗi từng đơn. Không có nút Completed, tự đánh dấu paid hoặc reset mock.

CSV xuất dữ liệu trang đang hiển thị, escape ô và xử lý dữ liệu có thể bị ứng dụng bảng tính hiểu là công thức. In phiếu từ dữ liệu thật; bỏ barcode cố định và thông tin cửa hàng giả, không tự sáng tác thông tin thay thế.

Khách chỉ xem đơn của mình, trạng thái/lý do hủy/thời điểm thực tế. Không dùng created_at làm thời điểm giao/hủy. Đơn thiếu lịch sử hiện rõ chưa có dữ liệu; timeline có thể thể hiện thứ tự bước nhưng không gán thời gian giả. Không thêm realtime; khách tải lại/mở lại theo luồng hiện có.

## 8. Trình tự triển khai và tiêu chí nghiệm thu

| Bước | Kết quả phải có | Kiểm chứng cần thực hiện |
| --- | --- | --- |
| 1. Schema và model | Migration/model/history/attempt/outbox nhất quán; không sửa dữ liệu cũ hoặc role Shipper | Chạy trên schema test riêng, chạy lại migration, đối chiếu model và associations |
| 2. Nghiệp vụ dùng chung | Ma trận cạnh chuyển, quyền, điều kiện paid, khóa và chống lặp, hủy nguyên tử | API tích hợp với DB thật trong schema test; cạnh tranh duyệt/hủy, kho/lịch sử/outbox đúng một kết quả |
| 3. API quản trị và khách | Danh sách/chi tiết/bulk/hủy đúng hợp đồng và phân quyền; client cũ được cập nhật tương thích | Filter/sort/count trước phân trang, IDOR/quyền Staff chỉ đúng chức năng, dữ liệu cũ, HTTP error codes |
| 4. Email | Trigger đúng shipping/kết quả hủy, lý do thất bại; OTP giữ hoạt động; retry bền và không rollback đơn | Transport SMTP giả/local capture, không gửi email khách thật; kiểm lỗi/khởi động lại/recipient/idempotency |
| 5. FE quản trị và khách | Dữ liệu thật, selection đúng, drawer giữ mở, lịch sử/quyền/email đúng; CSV/in không dữ liệu mẫu | Test hook và trình duyệt với API thật, mobile/keyboard/loading/race/lỗi một phần |
| 6. Nghiệm thu và tài liệu | Test/lint/build phù hợp, Postman, báo cáo đủ sáu mục và toàn bộ file thực tế | Đối chiếu diff, đường dẫn/vị trí, hành vi trước/sau và kết quả thật; ghi phần chưa kiểm được |

Các ca bắt buộc gồm:

- Admin/Staff có thể thực hiện ba cạnh tiến đến Shipping; khách không thể gọi API quản trị, Staff không tự được thêm quyền ngoài đơn hàng.
- Chặn bỏ bước/quay lùi/Completed kể cả request trực tiếp; đơn Shipping dừng, COD không tự paid.
- Online pending/failed chưa giao; paid được giao nhưng không hủy. Không có nút thay đổi thanh toán thủ công.
- Hủy đúng mốc/quyền/lý do; từ chối paid, shipping, completed, cancelled hoặc dữ liệu cũ với lý do công khai phù hợp; không đổi Order/kho/history khi từ chối.
- Hai request duyệt/hủy hoặc hai lần hủy đồng thời: chỉ một kết quả nghiệp vụ được áp dụng; hoàn kho và đảo sold_count đúng một lần.
- Retry cùng mã yêu cầu trả kết quả trước; mã cũ/payload khác bị từ chối; không tạo thêm email/job do replay.
- Bulk có cả đơn hợp lệ/không hợp lệ, mỗi ID có kết quả riêng, không rollback các đơn đã hợp lệ.
- Email chỉ shipping/cancel success/cancel failure, có lý do hủy thất bại; không confirmed/processing/completed trong bản này. Recipient fallback đúng, không hợp lệ được ghi rõ, HTML an toàn.
- SMTP lỗi không rollback trạng thái/kho; retry hữu hạn, khôi phục sau restart; không gọi SMTP trong transaction. Kết quả hủy và tình trạng email hiển thị riêng.
- Không dựng lịch sử/giả ngày cho đơn cũ; khách không nhận tên nhân viên, lịch sử/outbox nội bộ hoặc dữ liệu đơn của người khác.
- Search/filter/sort/count/8 đơn một trang đúng; CSV trang hiện tại và phiếu in dùng dữ liệu thật; drawer/selection/error/retry đúng hành vi đã chốt.

Lệnh kiểm tra dự kiến, chưa chạy trong giai đoạn lập kế hoạch:

| Thư mục | Lệnh | Mục đích |
| --- | --- | --- |
| BE | `npm test` | Test Node hiện có và test API/DB/email mới; chỉ dùng schema test riêng |
| BE | `node --check <file-da-sua.js>` | Kiểm cú pháp các file BE sửa/thêm phù hợp |
| FE/my-app | `npm test` | Test Node/jsdom cho API/hook/UI liên quan |
| FE/my-app | `npm run lint` | Kiểm ESLint toàn FE |
| FE/my-app | `npm run build` | Kiểm build production |
| Gốc repo | `git diff --check` | Kiểm định dạng patch và đối chiếu file/tài liệu |

Nghiệm thu trình duyệt trong Orca dùng skill orca-cli theo môi trường dự án. Phân biệt thao tác đã thực hiện với checklist; không ghi “đã gửi email/đã chạy DB test” nếu chỉ đọc source hoặc mock transport. Không chạy migration/test phá dữ liệu trên DB cửa hàng.

## 9. Kết quả bàn giao và giới hạn

Phần bàn giao sau triển khai phải gồm code FE/BE, schema thay đổi cần thiết, worker/lệnh chạy, request Postman, kiểm chứng phù hợp và báo cáo `docs/YYYY-MM-DD-ten-tac-vu.md` đủ sáu mục. Báo cáo liệt kê chính xác mọi file tạo/sửa/xóa và lý do validation, phân quyền, transaction, khóa, chống lặp, retry và xử lý lỗi.

Giới hạn đã chốt: chưa có Shipper/Completed/COD thu tiền, online chưa có cổng thanh toán nên đơn chưa paid dừng trước giao, chưa hoàn tiền/trả hàng/tích hợp vận chuyển/realtime. SMTP không đảm bảo tuyệt đối thư đến hộp nhận hoặc không trùng khi mất ACK; ghi trạng thái gửi và hạn chế retry thay vì cam kết vượt khả năng transport.

Tài liệu này hoàn thành phần lập kế hoạch. Chỉ cập nhật sang “đang triển khai/đã triển khai” khi thực sự bắt đầu/hoàn thành code và kiểm chứng. Xác nhận cách hiểu cuối cùng theo skill grilling trước khi chuyển sang triển khai.

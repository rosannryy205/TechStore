# Phỏng vấn chức năng duyệt trạng thái đơn hàng

Trạng thái: đã ghi nhận các quyết định Q1–Q24 và hoàn thành [kế hoạch triển khai](./orderStatusApprovalPlan.md), chờ xác nhận cách hiểu cuối cùng. Chưa bắt đầu triển khai mã nguồn.

## Mục tiêu và cách làm

Làm rõ ý nghĩa của “duyệt”, phạm vi vòng đời Order và quy tắc nghiệp vụ trước khi lập kế hoạch triển khai theo từng tầng. Phỏng vấn theo cây quyết định: mỗi vòng chỉ hỏi những quyết định có đủ tiền đề; câu trả lời của người dùng mở các nhánh tiếp theo. Các đề xuất bên dưới chưa phải yêu cầu được chấp nhận.

Ghi quyết định ngay khi được xác nhận. Cập nhật [GLOSSARY.md](../GLOSSARY.md) khi thuật ngữ được thống nhất; chỉ ghi ADR cho quyết định khó đảo ngược, cần giải thích bối cảnh và có đánh đổi thực sự. Khi hết câu hỏi, trình kế hoạch cùng tiêu chí nghiệm thu để người dùng xác nhận cách hiểu trước khi triển khai, theo skill [grilling](../.agents/skills/grilling/SKILL.md).

## Hiện trạng đã khảo sát

Các quan sát hành vi dưới đây dựa trên mã nguồn, chưa chạy ứng dụng. Riêng cấu trúc trạng thái đã kiểm chứng bằng SELECT trên INFORMATION_SCHEMA của DB thực tế: `orders.order_status` là enum gồm `pending`, `confirmed`, `processing`, `shipping`, `completed`, `cancelled`; không có bảng cấu hình trạng thái hoặc cạnh chuyển trong 19 bảng hiện có. DB xác định tập giá trị hợp lệ, chưa định nghĩa được chuyển từ trạng thái nào sang trạng thái nào. Không thay đổi schema hoặc dữ liệu trong lần kiểm chứng này.

| Khu vực | Bằng chứng | Hiện trạng |
| --- | --- | --- |
| Ngôn ngữ nghiệp vụ | `GLOSSARY.md`, mục Order và Cancellation Reason | Vòng đời Pending → Confirmed → Processing → Shipping → Completed, hoặc Cancelled. Khách hàng chỉ tự hủy Pending; từ Confirmed quyền chuyển trạng thái thuộc Admin/Staff. Admin/Staff hủy phải có lý do. |
| Quy ước FE | `docs/adr/0001-frontend-architecture-and-conventions.md` | Component → hook → API service → Fetch; guard Admin cho phép admin/staff. |
| Trang quản trị đơn hàng | `FE/my-app/src/hooks/admin/useAdminOrders.js`, `FE/my-app/src/services/api/admin/mockOrderService.js` | Hook đang gọi service dữ liệu mẫu lưu localStorage; chưa phải thao tác đơn hàng thật ở BE. |
| API đơn hàng | `BE/src/routes/client/orderRoutes.js` | Có tạo đơn, xem đơn của khách và khách tự hủy; chưa có route quản trị đơn hàng. |
| Trạng thái lưu trữ | `BE/src/models/orderModel.js` | Có đủ sáu trạng thái Order; trạng thái thanh toán riêng gồm pending/paid/failed. |
| Kiểm soát chuyển trạng thái | `FE/my-app/src/constants/orderStatus.js`, `FE/my-app/src/services/api/admin/mockOrderService.js` | Giao diện có luồng bước kế tiếp; service mẫu vẫn gán trực tiếp trạng thái cho thao tác đơn lẻ/hàng loạt, chưa bảo vệ chuyển trạng thái hợp lệ. |
| Quyền Staff | `FE/my-app/src/App.jsx`, `BE/src/middleware/requireAdmin.js` | Guard FE cho admin/staff, nhưng middleware requireAdmin của BE chỉ cho admin; cần chốt quyền rồi đồng bộ. |
| Tồn kho | `BE/src/services/client/orderService.js` | Khi tạo đã trừ stock và tăng sold_count; khi hủy thì hoàn lại. Chuyển sang Confirmed không được vô tình trừ kho thêm lần nữa. |
| Hủy và thanh toán | `FE/my-app/src/services/api/admin/mockOrderService.js`, `BE/src/services/client/orderService.js` | Service mẫu đổi payment pending thành failed khi hủy, còn BE hủy chỉ đổi order_status. Đây là khác biệt cần chốt, không xem hành vi mẫu là đặc tả. |
| Dữ liệu truy vết | `BE/src/models/orderModel.js` | Chưa có trường lý do/người hủy hoặc lịch sử chuyển trạng thái. |

## Cây quyết định

Ba quyết định gốc được hỏi trong vòng 1, độc lập với nhau:

1. **Ý nghĩa duyệt** → người thao tác, quyền đề xuất/phê duyệt, lịch sử và xử lý từ chối nếu có.
2. **Phạm vi vòng đời** → ma trận chuyển trạng thái, điều kiện từng bước, hủy và các trạng thái kết thúc.
3. **Phạm vi bàn giao** → tích hợp màn hình/API/dữ liệu thật, danh sách/chi tiết và các thao tác cần hỗ trợ.

Sau khi các tiền đề tương ứng được chốt, tiếp tục mở các nhánh:

- Quyền Admin/Staff/khách hàng và các tình huống xung đột quyền.
- Điều kiện tồn kho, thanh toán và dữ liệu giao hàng liên quan đến từng chuyển trạng thái.
- Hai người cập nhật cùng lúc, bấm lặp/gửi lại và cạnh tranh giữa duyệt với khách tự hủy.
- Thao tác hàng loạt: chọn đơn, điều kiện hợp lệ và kết quả khi một phần thất bại.
- Lịch sử, lý do hủy, thông báo và dữ liệu khách hàng được nhìn thấy.
- Tìm kiếm/lọc/phân trang, trạng thái tải/lỗi/rỗng và hành vi sau cập nhật.
- Hợp đồng API, tương thích dữ liệu hiện tại, các ca kiểm chứng và tiêu chí nghiệm thu.

Các nhánh là lịch phỏng vấn dự kiến; không mặc định mọi tính năng đều nằm trong phạm vi triển khai.

## Vòng 1 — Đã trả lời

| Câu | Quyết định | Kết quả |
| --- | --- | --- |
| Q1 | Ý nghĩa “duyệt” | Đã đồng ý: người có quyền trực tiếp chuyển trạng thái đơn hàng; không thêm quy trình một người đề xuất, người khác phê duyệt. |
| Q2 | Phạm vi vòng đời | Người dùng điều chỉnh: “duyệt theo trạng thái đã được cấu hình sẵn trong database”. Dùng các trạng thái sẵn có làm căn cứ; không tự thêm trạng thái. Cần phân biệt tập giá trị trạng thái với các cạnh chuyển được phép. |
| Q3 | Phạm vi bàn giao | Đã đồng ý: tích hợp FE và BE, dùng lại màn quản trị hiện có và thay thao tác dữ liệu mẫu bằng API trên đơn hàng thật. |

## Quyết định đã chốt trong phiên

- **Q1:** Duyệt là thao tác chuyển trạng thái trực tiếp của người có quyền, không có tầng đề xuất/phê duyệt riêng. Bổ sung thuật ngữ Order Status Approval vào glossary.
- **Q2:** Bám các trạng thái đã cấu hình trong database theo yêu cầu người dùng. Đã kiểm chứng enum thực tế khớp sáu trạng thái trong model; không có bảng cấu hình cạnh chuyển. Quy tắc chuyển được hỏi tại Q4/Q6, không suy ra từ thứ tự giá trị enum.
- **Q3:** Phạm vi FE và BE, tái sử dụng màn quản trị và tích hợp dữ liệu thật.
- **Q4 (đã điều chỉnh tại Q21):** Vòng đời đầy đủ vẫn Pending → Confirmed → Processing → Shipping → Completed, không bỏ bước/quay lùi; Completed và Cancelled là trạng thái kết thúc. Đợt này chỉ triển khai cạnh tiến đến Shipping, không triển khai Shipping → Completed.
- **Q5 (đã giới hạn tại Q21):** Admin và Staff có cùng quyền xem, duyệt và chuyển trạng thái đến Shipping. Không được chuyển tiếp từ Shipping, kể cả gọi API trực tiếp. Quyền quản trị các chức năng khác không được suy ra từ quyết định này.
- **Q6:** Admin/Staff được hủy tại Pending/Confirmed/Processing, bắt buộc lý do; chặn từ Shipping. Khách chỉ tự hủy Pending. Điều kiện thanh toán bổ sung tại Q12: chặn hủy đơn paid.
- **Q7:** Hỗ trợ duyệt từng đơn và duyệt nhiều đơn cùng lúc. Phạm vi hai thao tác bulk, lựa chọn trong trang và kết quả một phần đã được chốt tiếp tại Q9/Q16.
- **Q8:** Lưu lịch sử người thao tác, thời điểm, trạng thái trước/sau và lý do hủy, hiển thị trong chi tiết đơn ở trang quản trị.
- **Q9:** Duyệt hàng loạt xử lý độc lập từng đơn; trả kết quả thành công/thất bại và lý do cho từng đơn, không hủy kết quả các đơn hợp lệ vì một đơn không hợp lệ.
- **Q10:** Từ chối cập nhật dựa trên trạng thái cũ khi đơn đã thay đổi; không tự tiến thêm bước hoặc ghi lịch sử/hoàn kho trùng khi gửi lặp. Bao gồm cạnh tranh với khách tự hủy.
- **Q11:** Giữ trừ kho và tăng sold_count khi tạo đơn; không trừ lại khi duyệt/chuyển tiếp; hủy thành công hoàn kho và đảo sold_count đúng một lần.
- **Q12:** Chưa hỗ trợ hoàn tiền trong đợt này; chặn hủy đơn có payment_status=paid kể cả khi trạng thái Order còn trong mốc được hủy. Áp dụng thống nhất cả thao tác khách hàng và người vận hành.
- **Q13 (hoãn theo Q21):** Quy tắc COD hoàn tất đồng thời paid thuộc bước xác nhận giao thành công, để nâng cấp Shipper sau này. Đợt này không triển khai completed hoặc tự đổi COD sang paid khi chuyển Shipping; không thêm nút đánh dấu đã thu tiền để vượt phạm vi đã chốt.
- **Q14:** Thanh toán VNPAY/MoMo chỉ đọc trạng thái hiện có trong DB; không tích hợp cổng thanh toán hoặc cho người vận hành đánh dấu đã thanh toán trực tuyến bằng tay trong đợt này.
- **Q15:** VNPAY/MoMo chỉ được Processing → Shipping nếu paid; pending/failed có thể xác nhận/chuẩn bị nhưng chưa được giao. Chờ nguồn thanh toán hợp lệ ở tác vụ tích hợp riêng theo Q14.
- **Q16 (điều chỉnh theo Q21):** Bulk gồm Duyệt đơn và Chuẩn bị hàng, chọn trên trang hiện tại và bỏ chọn khi đổi trang/bộ lọc. Chuyển Shipping xử lý từng đơn; không có thao tác hoàn tất trong đợt này.
- **Q17:** Giữ search/filter/sort, 8 đơn/trang, cách đếm badge/header, CSV trang hiện tại và in phiếu từng đơn; dùng dữ liệu thật và bỏ dữ liệu/nút mẫu.
- **Q18:** Không dựng lịch sử hoặc đoán trạng thái cho đơn cũ. Thiếu dữ liệu cần thiết thì hiện Cần kiểm tra và chặn thao tác liên quan; thiếu mã hiển thị TS-{id}, thiếu lịch sử hiện Chưa có lịch sử.
- **Q19:** Khách xem trạng thái và lý do hủy, không xem lịch sử nội bộ/tên nhân viên; không suy ra ngày chuyển trạng thái từ ngày tạo đơn.
- **Q20 (bổ sung theo người dùng):** Cập nhật danh sách/số đếm/chi tiết sau thao tác, giữ drawer mở, giữ tiêu chí khi thử lại và chặn bấm lặp. Chưa polling/realtime. Có thông báo email theo Q22–Q24 và điều chỉnh Q23 mới nhất.
- **Q21 (thay thế phạm vi trước):** Admin/Staff chỉ duyệt đến Shipping rồi dừng. Từ Shipping trở đi dành cho account role shipper trên giao diện riêng ở đợt nâng cấp sau; đợt này không thêm role/schema tài khoản, account, giao diện, endpoint hoặc thao tác Shipper. Đơn Completed đã có vẫn được xem nhưng không thể sửa trạng thái.
- **Q22:** Ưu tiên email trên Order; nếu bỏ trống dùng email tài khoản đặt đơn. Thiếu địa chỉ hợp lệ thì không chặn nghiệp vụ, ghi rõ thông báo không gửi được vì thiếu email.
- **Q23 (theo lời nhắn mới nhất, thay thế đề xuất cũ):** Gửi khi chuyển Shipping, khi giao thành công, khi hủy thành công và khi hủy thất bại; hủy thất bại phải kèm lý do. Không gửi ở Confirmed/Processing. Email giao thành công gắn với Completed của Shipper trong nâng cấp sau, không mở quyền Completed cho Admin/Staff hoặc tạo một luồng hoàn tất trong bản hiện tại. Email tiếng Việt, mã đơn và thông tin kết quả, không công khai tên nhân viên/lịch sử nội bộ.
- **Q24:** Lỗi gửi email không rollback Order hoặc tồn kho. Lưu tình trạng gửi riêng, tự retry có giới hạn và cho quản trị thấy tình trạng chưa gửi được. Không chuyển trạng thái Order lần nữa chỉ để gửi email.
- **Nhật ký bàn giao:** Áp dụng quy tắc Change Documentation người dùng bổ sung. Tài liệu của tác vụ này là [2026-11-14-duyet-trang-thai-don-hang.md](./2026-11-14-duyet-trang-thai-don-hang.md). Ghi vị trí và kết quả kiểm chứng thực tế; không ghi thay đổi dự kiến thành đã thực hiện.

## Quy tắc bắt buộc: Change Documentation

Sau mỗi tác vụ sửa mã nguồn, tự động tạo hoặc cập nhật tài liệu riêng tại `docs/YYYY-MM-DD-ten-tac-vu.md` ở gốc dự án; tạo thư mục nếu thiếu và không ghi đè tài liệu tác vụ khác. Tác vụ chỉ đọc, phân tích hoặc tư vấn không bắt buộc tạo báo cáo thay đổi code.

Tài liệu phải viết tiếng Việt, Markdown rõ ràng và có đủ sáu mục:

1. Tổng quan thay đổi: mục tiêu, yêu cầu ban đầu và kết quả thực hiện.
2. Danh sách file thay đổi: chính xác đường dẫn mọi file tạo mới, sửa hoặc xóa, kèm mục đích.
3. Chi tiết nội dung thay đổi: function/component/API/service/model/logic được thêm, sửa hoặc bỏ; hành vi trước và sau nếu có.
4. Giải thích logic và lý do thiết kế: luồng dữ liệu, validation, phân quyền, bảo mật, cập nhật DB, xử lý lỗi và lý do cho các điều kiện quan trọng; giải thích đơn giản để developer review.
5. Ảnh hưởng đến hệ thống: chức năng/API/database/component liên quan; ghi rõ thay đổi dependency hoặc biến môi trường nếu có.
6. Kiểm thử và nghiệm thu: ca cần kiểm tra, lệnh đã chạy, kết quả thực tế và vấn đề chưa giải quyết; tách biệt đề xuất kiểm thử với kiểm thử đã thực hiện.

Tài liệu phải phản ánh đúng code thực tế, không mô tả chức năng chưa triển khai như đã có; không sao chép toàn bộ source code, chỉ trích đoạn cần thiết. Không đưa mật khẩu, token, API key hoặc dữ liệu nhạy cảm vào tài liệu.

Quy trình hoàn thành: triển khai → kiểm tra diff và kiểm thử phù hợp → tạo/cập nhật tài liệu → đối chiếu tài liệu với toàn bộ file và logic đã đổi → phản hồi cuối có đường dẫn tài liệu, thay đổi chính và kết quả kiểm thử. Không coi tác vụ sửa code hoàn tất trước khi tài liệu tương ứng được cập nhật.

## Kết quả phỏng vấn — Sau vòng 5

- Q1–Q24 đã có câu trả lời; các quyết định cũ về hoàn tất COD/quyền sau Shipping được thay thế hoặc hoãn như ghi ở trên.
- Q23 dùng lời nhắn cuối cùng, có cả thông báo giao thành công thuộc nâng cấp Shipper sau này. Không dùng bản tin đã bị người dùng thay thế thiếu sự kiện giao thành công.
- Các lựa chọn triển khai API, transaction, khóa dữ liệu, migration và cách kiểm thử được lập kế hoạch dựa trên quyết định đã chốt, không yêu cầu người dùng chọn chi tiết kỹ thuật thường lệ.

Không còn câu hỏi nghiệp vụ mở trong cây phỏng vấn hiện tại. Bước tiếp theo là đối chiếu [kế hoạch triển khai](./orderStatusApprovalPlan.md) và xác nhận cách hiểu trước khi sửa code, theo skill grilling.

## Vòng 2 — Đã chốt toàn bộ

Các câu dưới đây làm rõ quy tắc áp dụng trên các trạng thái sẵn có, không đề xuất thêm trạng thái mới.

| Câu | Quyết định | Kết quả đã được xác nhận |
| --- | --- | --- |
| Q4 | Cạnh chuyển trạng thái | Chỉ tiến lần lượt Pending → Confirmed → Processing → Shipping → Completed; không bỏ bước, không quay lùi; Completed/Cancelled là kết thúc. Nhánh hủy xét riêng ở Q6. |
| Q5 | Quyền người vận hành | Admin và Staff cùng được xem và chuyển trạng thái đơn hàng theo cùng quy tắc, phù hợp glossary và ADR hiện có. |
| Q6 | Mốc hủy | Cho phép người vận hành hủy khi Pending/Confirmed/Processing, bắt buộc lý do; chặn hủy Shipping/Completed. Khách vẫn chỉ tự hủy Pending. Điều kiện thanh toán/hoàn tiền sẽ xét tiếp sau khi chốt mốc này. |
| Q7 | Thao tác hàng loạt | Đã đồng ý: bao gồm duyệt từng đơn và duyệt nhiều đơn cùng lúc. Cách xử lý tập đơn khác trạng thái và lỗi một phần hỏi sau. |
| Q8 | Lịch sử trạng thái | Lưu người thao tác, thời điểm, trạng thái trước/sau và lý do hủy; hiển thị lịch sử trong chi tiết đơn ở trang quản trị. |

Người dùng đã đồng ý Q4/Q5/Q6/Q8 sau khi Q7 được giải thích và xác nhận riêng, đồng thời bổ sung yêu cầu nhật ký bàn giao.

## Vòng 3 — Đã chốt toàn bộ

| Câu | Quyết định | Kết quả đã được xác nhận |
| --- | --- | --- |
| Q9 | Duyệt hàng loạt có đơn không hợp lệ | Xử lý riêng từng đơn: đơn hợp lệ được chuyển; đơn không hợp lệ giữ nguyên. Trả kết quả từng đơn, tổng thành công/thất bại và lý do. Ví dụ chọn 8 Pending + 2 Cancelled rồi Duyệt: 8 thành công, 2 bị từ chối. |
| Q10 | Hai người cập nhật cùng một đơn | Chỉ chấp nhận thao tác còn khớp trạng thái đã xem; người thao tác trên dữ liệu cũ nhận thông báo và dữ liệu mới, không tự chuyển thêm một bước. Áp dụng cả khi cạnh tranh với khách tự hủy. Không lặp lịch sử hoặc hoàn kho khi gửi lặp. |
| Q11 | Thời điểm trừ/hoàn kho | Giữ cách trừ kho khi tạo đơn; duyệt/chuyển tiếp không trừ thêm. Hủy thành công hoàn số lượng và đảo sold_count đúng một lần. |
| Q12 | Hủy đơn đã thanh toán | Đợt này chưa làm hoàn tiền; tạm chặn hủy đơn có payment_status=paid, kể cả khi trạng thái đơn còn trong mốc được hủy tại Q6. |
| Q13 | COD khi hoàn tất | Khi người vận hành xác nhận giao thành công đơn COD, đồng thời ghi thanh toán paid; đây là xác nhận đã giao và thu tiền. |
| Q14 | Phạm vi thanh toán trực tuyến | VNPAY/MoMo chỉ đọc trạng thái thanh toán hiện có trong DB; đợt này không tích hợp cổng thanh toán và không cho nút thủ công đánh dấu đã thanh toán trực tuyến. Điều kiện cho chuyển sang giao hàng sẽ hỏi sau khi chốt phạm vi này. |

Người dùng đã đồng ý toàn bộ Q9–Q14 và bổ sung quy tắc bắt buộc Change Documentation. Những nhánh hiển thị, dữ liệu cũ, danh sách/tìm kiếm và tiêu chí nghiệm thu sẽ tiếp tục sau các quyết định liên quan.

**Điều chỉnh sau vòng 4:** Q13 là quy tắc tương lai, không triển khai trong đợt này vì Admin/Staff dừng ở Shipping và phần Shipper để nâng cấp sau. Không tự thu tiền COD khi chỉ bàn giao vận chuyển.

## Khảo sát bổ sung để chốt phạm vi

- `useAdminOrders.js`/`mockOrderService.js`: tìm theo mã đơn, người nhận, điện thoại, email; lọc phương thức/trạng thái thanh toán/thời gian; sort thời gian/giá; 8 đơn/trang. Badge tab hiện đếm toàn bộ đơn, header đếm theo kết quả lọc.
- CSV hiện xuất trang đang hiển thị. Bulk có hai thao tác Duyệt đơn → Confirmed và Chuẩn bị hàng → Processing. Chọn tất cả áp dụng trang hiện tại nhưng hook đang giữ lựa chọn qua trang khác.
- `orderPrintModal.jsx` dùng window.print, có thông tin cửa hàng/barcode mẫu; cần tránh đưa dữ liệu giả vào phiếu thật. Header có nút đặt lại dữ liệu mẫu không phù hợp khi nối DB thật.
- Drawer quản trị lấy đơn từ trang hiện tại: đơn rời filter sau cập nhật có thể làm chi tiết mất dữ liệu.
- Phía khách đã đọc API thật; fetch khi mount/đổi tab/sau hủy, chưa có polling. Stepper suy diễn từ trạng thái hiện tại, chưa có history; API chưa trả updated_at nên giao diện có thể lấy nhầm ngày tạo làm ngày bước hiện tại.
- `order_status` và `payment_status` nullable; dữ liệu cũ không tự được sửa chỉ vì có default. Chưa có lịch sử trước khi triển khai hoặc quy tắc backfill được xác nhận.

Các quan sát bổ sung là kết quả đọc mã nguồn, chưa phải kiểm thử ứng dụng.

## Vòng 4 — Đã chốt, Q20/Q21 có điều chỉnh

| Câu | Quyết định | Kết quả đã xác nhận |
| --- | --- | --- |
| Q15 | Điều kiện giao đơn thanh toán trực tuyến | VNPAY/MoMo chỉ được Processing → Shipping nếu payment_status=paid; pending/failed vẫn được xác nhận/chuẩn bị nhưng bị chặn giao. Do Q14 chưa tích hợp thanh toán, đơn online chưa paid sẽ phải chờ nguồn thanh toán hợp lệ cập nhật trong một tác vụ riêng, không dùng nút giả hoặc sửa DB như luồng vận hành. |
| Q16 | Phạm vi bulk và lựa chọn | Giữ hai thao tác hàng loạt hiện có: Duyệt đơn và Chuẩn bị hàng. Mỗi lần chỉ chọn đơn trên trang đang xem; đổi trang/bộ lọc thì bỏ chọn để tránh thao tác đơn bị ẩn. Chuyển Shipping xử lý từng đơn; Completed hoãn theo Q21. |
| Q17 | Tiện ích danh sách | Giữ search/filter/sort, 8 đơn/trang và cách đếm badge/header hiện có; thực hiện truy vấn/phân trang tại BE. Giữ CSV cho trang hiện tại và in phiếu từng đơn bằng dữ liệu thật; loại nút đặt lại dữ liệu mẫu, barcode cố định và thông tin cửa hàng giả, không tự thêm thông tin chưa được cung cấp. |
| Q18 | Đơn cũ và dữ liệu thiếu | Không dựng lịch sử trước triển khai hoặc tự đoán trạng thái. Đơn thiếu/không rõ order_status, payment_status hoặc payment_method hiện Cần kiểm tra và chặn thao tác có liên quan thay vì tự suy ra. Đơn chưa có order_code dùng nhãn hiển thị TS-{id}, không đổi mã đã tồn tại. Lịch sử thiếu hiện Chưa có lịch sử. |
| Q19 | Phía khách hàng | Giữ luồng theo dõi trạng thái hiện có, bổ sung lý do hủy nếu có và đồng bộ điều kiện hủy; không công khai tên nhân viên/lịch sử nội bộ. Không dùng ngày tạo làm ngày chuyển trạng thái nếu thiếu bằng chứng lịch sử thực tế. |
| Q20 | Phản hồi, cập nhật giao diện và email | Sau thao tác tải lại danh sách/số đếm, giữ drawer mở với dữ liệu mới dù đơn rời bộ lọc. Giữ filter/sort khi thử lại, có thông báo kết quả/lỗi và chặn bấm lặp trong khi gửi. Chưa polling/realtime; bổ sung email theo email khách cung cấp. |
| Q21 | Điểm dừng của người vận hành | Admin/Staff chỉ chuyển đến Shipping rồi dừng. Từ Shipping trở đi giao cho role Shipper/giao diện riêng trong nâng cấp sau. Không làm hoàn tất, giao thất bại, trả hàng, hãng vận chuyển/mã vận đơn hoặc tích hợp vận chuyển trong đợt này. |

Người dùng đồng ý Q15–Q21 với hai điều chỉnh rõ ràng: Q20 thêm email và Q21 giới hạn Admin/Staff đến Shipping, hoãn Shipper. Phạm vi cập nhật email được hỏi tiếp, không suy đoán từ cụm “email của khách hàng đã cung cấp”.

## Khảo sát email hiện có

- `BE/src/services/client/emailService.js` chỉ có sendVerificationEmail, dùng Nodemailer với cấu hình SMTP và MAIL_FROM; chưa có queue/retry/outbox.
- Email checkout là tùy chọn, khởi tạo rỗng và không tự lấy email tài khoản; Order lưu receiver_email hoặc null. Email tài khoản là email đăng ký đã qua xác minh OTP.
- Luồng đăng ký hiện chờ gửi email và propagate lỗi; không mặc định áp dụng cách xử lý đó cho chuyển trạng thái Order.

Đây là khảo sát mã nguồn, không gửi email thực tế hoặc đọc/in giá trị cấu hình bí mật.

## Vòng 5 — Đã chốt, Q23 có điều chỉnh

| Câu | Quyết định | Kết quả đã xác nhận |
| --- | --- | --- |
| Q22 | Email nhận thông báo | Ưu tiên receiver_email khách nhập khi đặt đơn; nếu bỏ trống dùng email tài khoản đặt đơn. Nếu cả hai thiếu/không hợp lệ, vẫn chuyển trạng thái nhưng ghi nhận không gửi được vì thiếu địa chỉ; không tự gửi cho địa chỉ khác. |
| Q23 | Thời điểm và nội dung email | Người dùng điều chỉnh: chỉ thông báo Shipping, giao thành công, hủy thành công hoặc hủy thất bại kèm lý do hủy thất bại. Không gửi Confirmed/Processing. Giao thành công thuộc nâng cấp Shipper sau. Đơn hủy thất bại vẫn có thông báo kết quả yêu cầu, không phải lịch sử chuyển trạng thái. Request lặp cùng một lần xử lý không tạo lại sự kiện email. |
| Q24 | Gửi email thất bại | Trạng thái đơn đã cập nhật vẫn giữ nguyên, không rollback đơn hoặc kho vì lỗi SMTP. Lưu tình trạng gửi riêng để tự thử lại có giới hạn, quản trị thấy trạng thái gửi lỗi nếu chưa gửi được; không yêu cầu chuyển trạng thái Order lại để gửi email. Chi tiết retry/transport là lựa chọn kỹ thuật khi lập kế hoạch. |

Đã chốt Q22–Q24. Phân biệt hai tình huống: hủy thất bại là kết quả yêu cầu hủy và cần email có lý do; gửi email thất bại là lỗi kênh thông báo, không thay đổi kết quả hủy. [Kế hoạch triển khai](./orderStatusApprovalPlan.md) xử lý riêng hai loại kết quả này, ghi rõ giới hạn khi yêu cầu chưa tới BE hoặc hạ tầng chưa ghi nhận được kết quả, không coi client timeout là bằng chứng đơn chưa hủy.

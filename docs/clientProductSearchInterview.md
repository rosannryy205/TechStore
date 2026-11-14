# Kế hoạch tìm kiếm sản phẩm phía Client

Trạng thái: đã triển khai FE/BE theo yêu cầu người dùng gọi skill implement; test, lint và build đạt. Đang hoàn tất review code và bàn giao. Nhật ký file/vị trí thực tế và kết quả kiểm tra nằm trong clientProductSearchChangeLog.md.

## Mục tiêu

Triển khai tìm kiếm sản phẩm dành cho người mua theo source hiện tại và yêu cầu đã thống nhất. Phân biệt Product, Variant, Product Search và Product Filter theo [GLOSSARY.md](../GLOSSARY.md). Nhật ký vị trí file, công dụng và lý do thay đổi nằm tại [clientProductSearchChangeLog.md](./clientProductSearchChangeLog.md).

## Bản tổng hợp đã thống nhất

- **Tìm trực tiếp:** hộp thoại Header cập nhật Product thật khi nhập, dùng Fetch và debounce khoảng 300 ms; hỗ trợ gõ tiếng Việt, hủy request cũ và bỏ phản hồi cũ. Tìm từ một ký tự hợp lệ trên toàn cửa hàng. Tải 12 Product mỗi đợt, cuộn/tải thêm tới hết kết quả.
- **Điều hướng:** bấm Product mở chi tiết; Enter hoặc Xem tất cả mở `/products?q=...`. Từ khóa đang gõ trong hộp thoại không tạo URL/lịch sử sau từng phím. Trang `/products` giữ bộ lọc khi sửa từ khóa tại trang.
- **Khớp từ khóa:** tên Product, tên Brand hoặc tên Category; mọi từ phải khớp, có thể qua nhiều trường/khác thứ tự, cho phép khớp một phần từ, không phân biệt dấu/hoa thường/đ-d. Không tìm mô tả, SKU, Attribute Option hoặc tự sửa chính tả.
- **Đầu vào:** chữ cái Unicode, chữ số và khoảng trắng; trim/gộp khoảng trắng, tối đa 100 ký tự sau chuẩn hóa. Từ khóa có dấu câu/ký hiệu/emoji được giữ trong ô nhập để sửa nhưng phải hiện “Không tìm thấy sản phẩm phù hợp”; BE cũng trả tập rỗng. Không tự loại ký tự để tìm query khác. Bộ gõ đang ghép dấu chưa bị kết luận là sai.
- **Query rỗng:** hộp thoại không gọi API lấy toàn cửa hàng, không giữ kết quả query cũ và Header không submit rỗng. Submit rỗng tại trang kết quả xóa q, giữ bộ lọc và về trang 1. Query quá dài hiện lỗi rõ thay vì âm thầm cắt.
- **Trách nhiệm BE:** tìm kiếm, visibility, Starting Price, khuyến mãi, toàn bộ filter/sort/count/phân trang; FE hiển thị dữ liệu một trang và metadata, không filter/sort/slice lại tập kết quả. Mỗi Product chỉ xuất hiện một lần.
- **Sản phẩm được hiện:** Product/Brand/Category đang hoạt động, có ít nhất một Variant đang hoạt động. Hết hàng vẫn hiện nhãn Hết hàng và nút Xem chi tiết. Bộ lọc chỉ hiện Category/Brand đang hoạt động nhưng không ẩn lựa chọn chỉ vì query hiện tại không có kết quả.
- **Giá:** giá bán thấp nhất của Variant đang hoạt động/còn hàng; nếu tất cả hết hàng thì lấy trong các Variant đang hoạt động. Giá bán dùng sale_price khi lớn hơn 0 và thấp hơn price; nếu không dùng price. Giá thẻ/lọc/sort dùng cùng giá đã tính tại BE.
- **Khuyến mãi (Q16, phương án A):** chỉ xét Variant đang hoạt động, kể cả Variant hết hàng. Vì vậy một Product có thể thuộc nhóm ưu đãi dù giá thấp nhất còn mua được không giảm; giá gạch ngang chỉ áp dụng khi Variant đại diện cho Starting Price thực sự giảm giá.
- **Bộ lọc và lịch sử:** giữ q khi đổi/xóa filter; xóa q giữ filter. Đổi q/filter/sort về trang 1. Back/Forward, refresh và chia sẻ URL giữ tiêu chí đã submit; trang vượt giới hạn về trang cuối, tập rỗng ở trang 1. Giữ các khoảng giá và bốn lựa chọn sort hiện có; Mới nhất dựa vào thời điểm tạo, dùng ID để ổn định khi trùng khóa sort.
- **Trạng thái:** loading ở vùng kết quả, giữ ô nhập/filter; lỗi có Thử lại giữ tiêu chí; rỗng có thao tác bỏ riêng q/filter. Hộp thoại có nhãn truy cập, Tab bên trong, Escape và phục hồi focus khi đóng.
- **Review:** code mới/sửa có comment tiếng Việt giải thích nghiệp vụ, lý do và trường hợp biên. Cập nhật một nhật ký trong docs với tên file, vị trí, công dụng, lý do và kết quả kiểm tra.

Phạm vi code là Header/hộp tìm kiếm, trang `/products`, API danh sách Client và phần dùng chung trực tiếp cần thiết. Không tự mở rộng sang Admin, giỏ hàng/checkout, sửa giá trang chủ/chi tiết hoặc các endpoint home/related.

## Hiện trạng trước triển khai

Bảng này ghi kết quả khảo sát trước khi sửa code tại commit `f3e41c232f96cf0e6bf76e990f77bc2a2ecd8a82`; số dòng trong bảng thuộc mốc đó. Các chức năng còn thiếu đã được thực hiện theo nhật ký, không dùng bảng này để mô tả code sau triển khai.

| Khu vực | Bằng chứng | Hành vi hiện tại |
| --- | --- | --- |
| Nhập từ khóa | `FE/my-app/src/components/header.jsx:146–150` | Submit từ khóa đã trim sẽ điều hướng tới `/products?q=...`; từ khóa rỗng không submit. |
| Gợi ý | `FE/my-app/src/components/header.jsx:207–217` | Danh sách từ khóa viết sẵn, liên kết tới `/products?q=...`; chưa phải gợi ý từ dữ liệu tìm kiếm. |
| Đọc URL | `FE/my-app/src/hooks/client/useProducts.js:27–32` | Đọc danh mục, thương hiệu, khoảng giá, khuyến mãi, sắp xếp và trang; chưa đọc `q`. |
| Gọi API | `FE/my-app/src/services/api/client/productService.js:19–26` | Chỉ gửi `category` và `brand`. |
| Nhận query | `BE/src/controllers/client/productController.js:10–14` | Chỉ nhận `category` và `brand`, trả `{ success: true, data: products }`. |
| Truy vấn danh sách | `BE/src/services/client/productService.js:24–64` | Lọc danh mục/thương hiệu, lấy toàn bộ kết quả theo `created_at DESC`; chưa tìm theo từ khóa, chưa phân trang danh sách tại BE. |
| Điều kiện hiển thị | `BE/src/services/client/productService.js:26–61` | Truy vấn danh sách chưa đặt điều kiện trạng thái sản phẩm, trạng thái biến thể hoặc tồn kho. |
| Bộ lọc và phân trang | `FE/my-app/src/hooks/client/useProducts.js:152–193` | FE lọc giá/khuyến mãi, sắp xếp và chia 12 sản phẩm/trang. |
| Xóa bộ lọc | `FE/my-app/src/hooks/client/useProducts.js:252–255` | Xóa toàn bộ query parameters, sẽ xóa cả `q` nếu có. |
| Loading và lỗi | `FE/my-app/src/pages/client/products.jsx:32–69` | Có màn tải và màn lỗi với nút tải lại trang. |
| Chuyển URL | `FE/my-app/src/layouts/mainLayout.jsx:26–70` | Đổi pathname hoặc query kích hoạt loading và tạm gỡ Outlet; cần tính tới khi chọn tìm ngay lúc gõ. |

Kết luận: luồng hiện tại đưa từ khóa lên URL nhưng chưa dùng từ khóa để xác định kết quả. Chỉ thêm `q` ở FE service sẽ chưa đủ vì BE hiện bỏ qua tham số này. Nếu giới hạn thay đổi ở FE thì cần thiết kế tìm kiếm trên dữ liệu đã tải và chấp nhận giới hạn tương ứng.

Các quan sát trong bảng được ghi từ source tại thời điểm khảo sát; kết quả kiểm thử trên MySQL và trình duyệt sau triển khai được ghi riêng trong nhật ký.

## Cây quyết định và thứ tự phỏng vấn

Các vòng dưới đây ghi các quyết định đã được hỏi và thống nhất. Những dòng còn dùng từ “đề xuất” là cách đặt câu hỏi trong phiên; tất cả đã được người dùng xác nhận, trừ quyết định cũ được ghi rõ là đã thay thế.

### Vòng 1 — Đã chốt

1. **Phạm vi thay đổi:** chức năng dành cho Client có được mở rộng API BE hay phải giới hạn thay đổi ở FE? Đề xuất: cho phép FE và BE, để truy vấn tìm kiếm thực hiện tại BE.
2. **Đơn vị kết quả:** một kết quả là Product hay Variant? Đề xuất: mỗi Product xuất hiện một lần; người mua chọn Variant ở trang chi tiết.
3. **Cách kích hoạt — đã cập nhật:** người dùng yêu cầu hộp thoại hiển thị sản phẩm và thu hẹp kết quả trong quá trình gõ. Thay thế quyết định cũ chỉ tìm sau submit; vai trò Enter/nút tìm kiếm đã chốt tại Q24.
4. **Ngữ cảnh tìm từ Header:** tìm toàn cửa hàng hay kế thừa danh mục/bộ lọc đang xem? Đề xuất: tìm mới từ Header trên toàn cửa hàng, bắt đầu lại trang 1.

Người dùng trả lời “đồng ý” cho toàn bộ bốn đề xuất trên.

### Vòng 2 — Đã chốt

5. **Trường được tìm:** tìm theo tên Product, tên thương hiệu và tên danh mục; chưa tìm trong mô tả, SKU hoặc Attribute Option.
6. **Tiếng Việt và lỗi gõ:** đề xuất không phân biệt hoa/thường hoặc dấu tiếng Việt (bao gồm đ/d); chưa tự sửa lỗi chính tả hay hỗ trợ từ đồng nghĩa.
7. **Điều kiện xuất hiện:** đề xuất Product, thương hiệu, danh mục đều đang hoạt động và Product có ít nhất một Variant đang hoạt động; vẫn hiện Product khi mọi Variant đang hoạt động đều hết hàng, kèm nhãn “Hết hàng”. Không đưa Product không có Variant đang hoạt động vào kết quả.
8. **Trang kết quả:** đề xuất tái sử dụng `/products?q=...`, hiển thị từ khóa và tổng kết quả, có ô sửa từ khóa và thao tác xóa từ khóa.
9. **Gợi ý — đã cập nhật:** bỏ danh sách viết sẵn đang gắn nhãn “phổ biến”; người dùng bổ sung kết quả sản phẩm thật thay đổi theo nội dung đang gõ. Lịch sử tìm kiếm vẫn chưa thuộc phạm vi.

Người dùng đồng ý toàn bộ Q5–Q9 và bổ sung yêu cầu comment giải thích rõ để dễ review code.

### Vòng 3 — Đã chốt

10. **Khớp nhiều từ:** đề xuất mọi từ đều phải xuất hiện trong ít nhất một trong ba trường đã chốt; cho phép nằm ở các trường khác nhau, không bắt buộc đúng thứ tự và cho phép khớp một phần từ. Ví dụ “Apple iPhone” có thể khớp thương hiệu Apple và tên iPhone.
11. **Kết hợp bộ lọc:** đề xuất giữ từ khóa khi đổi filter/sort; “Xóa bộ lọc” giữ từ khóa; “Xóa từ khóa” giữ các bộ lọc; sửa từ khóa tại trang kết quả giữ bộ lọc. Thay từ khóa/filter/sort đều về trang 1. Tìm mới từ Header vẫn xóa bộ lọc theo Q4.
12. **Thứ tự kết quả:** đề xuất mặc định Mới nhất theo thời điểm tạo và dùng ID để ổn định khi cùng thời điểm; tiếp tục hỗ trợ giá tăng, giá giảm, bán chạy; chưa thêm xếp hạng độ liên quan.
13. **Starting Price:** lấy giá bán thấp nhất (sale_price hợp lệ, nếu không thì price) của Variant đang hoạt động và còn hàng; nếu tất cả Variant đang hoạt động đều hết hàng thì lấy giá bán thấp nhất trong các Variant đang hoạt động. Dùng cùng quy tắc cho giá trên thẻ, lọc và sort giá. Người dùng đã chốt thay đổi này; cập nhật định nghĩa trong glossary. Việc đổi định nghĩa không tự mở rộng phạm vi sửa code sang trang chủ/chi tiết.
14. **Phạm vi quy tắc hiển thị:** đề xuất áp dụng quy tắc Q7 nhất quán trên trang `/products` cả khi không có từ khóa; các trang/endpoint khác chưa thuộc phạm vi thay đổi này.
15. **Phân trang:** người dùng chọn chuyển toàn bộ tìm kiếm, bộ lọc, sắp xếp và phân trang sang BE ngay trong bản đầu. FE gửi tiêu chí, nhận dữ liệu một trang và metadata; không tự lọc/sắp xếp/chia trang trên dữ liệu trả về.

Người dùng đồng ý Q10–Q14, yêu cầu làm rõ đánh đổi Q15, sau đó quyết định “chuyển sang BE”. Đề xuất cũ giữ lọc giá/sắp xếp/phân trang tại FE không còn được áp dụng.

**Giải thích đánh đổi Q15:** phân trang FE hiện chỉ giới hạn số Product hiển thị, không giới hạn số Product tải về. BE còn trả kèm Variant, thuộc tính và ảnh nên chi phí truyền dữ liệu, parse JSON, bộ nhớ và lọc/sort tại trình duyệt tăng theo tập kết quả. Phân trang BE có thể giảm dữ liệu mỗi request xuống một trang và trả kèm tổng kết quả sau lọc; không tự bảo đảm truy vấn nhanh nếu chưa thiết kế truy vấn/chỉ mục phù hợp. Phải áp dụng toàn bộ điều kiện lọc và sắp xếp trước khi phân trang; chỉ trả một trang từ BE rồi lọc giá/khuyến mãi tại FE sẽ cho kết quả thiếu và tổng số sai. Quyết định cần dựa trên quy mô và đo đạc, không có ngưỡng số lượng bắt buộc đã được xác minh cho dự án này.

### Vòng 4 — Đã chốt

16. **Khuyến mãi:** đề xuất chỉ Variant đang hoạt động được làm Product khớp bộ lọc khuyến mãi; một Variant đang hoạt động có sale_price hợp lệ vẫn được tính dù hết hàng. Variant bị ẩn không được tạo nhãn ưu đãi hoặc ảnh hưởng lọc khuyến mãi.
17. **Đầu vào — đã chốt:** từ khóa có ký tự đặc biệt phải hiện “Không tìm thấy sản phẩm phù hợp”; tập ký tự và cách xử lý ô nhập theo Q22. Trim/gộp khoảng trắng, tối đa 100 ký tự sau chuẩn hóa; quá dài báo lỗi. Header rỗng không tìm; submit rỗng tại trang kết quả xóa q, giữ bộ lọc.
18. **Trạng thái giao diện:** đề xuất loading chỉ ở vùng kết quả, giữ ô nhập/bộ lọc; không có kết quả hiển thị từ khóa và các thao tác xóa riêng từ khóa/bộ lọc; lỗi có nút Thử lại giữ tiêu chí. Overlay hỗ trợ nhãn truy cập, Tab trong hộp thoại, Escape và trả focus về nút mở khi đóng; request cũ không được ghi đè kết quả mới.
19. **URL và lịch sử:** đề xuất Back/Forward khôi phục từ khóa, filter, sort và trang; refresh/chia sẻ giữ cùng tiêu chí. Thao tác chủ động tạo lịch sử; chuẩn hóa URL dùng replace. Trang vượt giới hạn về trang cuối có dữ liệu, tập rỗng ở trang 1; tham số URL không hợp lệ được chuẩn hóa về mặc định, API trực tiếp có query sai định dạng trả 400.
20. **Thao tác khi hết hàng:** đề xuất trên thẻ hết hàng đổi “Mua ngay” thành “Xem chi tiết”; vẫn cho mở trang chi tiết. Không mở rộng task sang sửa luồng giỏ hàng/checkout.
21. **Lựa chọn bộ lọc:** đề xuất chỉ hiện danh mục/thương hiệu đang hoạt động trong bộ lọc trang `/products`; không ẩn lựa chọn chỉ vì tổ hợp tìm kiếm hiện tại chưa có kết quả. Endpoint danh mục hiện trả cả đối tượng bị tắt; cần xử lý phạm vi bộ lọc mà không tự thay đổi các trang khác.

Người dùng xác nhận “đồng ý tất cả” cho Q16 và nhóm Q17–Q21 còn lại. Q16 dùng phương án đề xuất ban đầu: tính cả Variant đang hoạt động đã hết hàng.

### Vòng bổ sung — Tìm kiếm ngay khi nhập

Yêu cầu đã chốt trực tiếp từ người dùng: từ khóa có ký tự đặc biệt hiện thông báo không có sản phẩm phù hợp; hộp thoại phải hiển thị sản phẩm thật và cập nhật theo từ khóa đang nhập, ví dụ “iphone” rồi “iphone 16 pro”. Các quy tắc BE, Product duy nhất, giá và điều kiện xuất hiện đã chốt vẫn áp dụng.

22. **Ký tự hợp lệ và cách thông báo — đã chốt:** chỉ chấp nhận chữ cái Unicode (bao gồm tiếng Việt có dấu), chữ số và khoảng trắng; dấu câu, ký hiệu và emoji bị coi là không hợp lệ. Ví dụ `iPhone 16` hợp lệ; `iPhone%`, `USB-C`, `S24+`, `10.9` không hợp lệ. Giữ nguyên nội dung người dùng gõ/dán nhưng chuyển vùng kết quả sang “Không tìm thấy sản phẩm phù hợp”; không âm thầm bỏ ký tự rồi tìm một từ khóa khác. Với dấu tổ hợp Unicode do bộ gõ tạo ra, chuẩn hóa đúng và không kết luận không hợp lệ giữa lúc đang soạn chữ.
23. **Tất cả kết quả trong hộp thoại — đã chốt:** tải theo đợt 12 Product; cuộn hoặc tải thêm cho tới khi hết kết quả, có tổng số và nút Xem tất cả. Mọi Product khớp đều có thể xem, không tải toàn bộ tập khớp trong một request. Mỗi khi từ khóa thay đổi thì bắt đầu lại từ đợt đầu, không nối kết quả khác từ khóa.
24. **Vai trò hộp thoại và trang kết quả — đã chốt:** gõ để xem trực tiếp trong hộp thoại; bấm Product mở trang chi tiết; Enter/nút Xem tất cả mở `/products?q=...` để dùng bộ lọc, sort và phân trang. Từ khóa nháp trong hộp thoại không ghi URL hay lịch sử sau từng phím; trang kết quả vẫn áp dụng tiêu chí đã submit, sửa từ khóa tại đó giữ bộ lọc như Q11.

Người dùng đồng ý Q22–Q24 và bổ sung yêu cầu lưu một file Markdown trong docs ghi tên file, vị trí sửa/thêm, công dụng và lý do. Nhật ký được lưu tại [clientProductSearchChangeLog.md](./clientProductSearchChangeLog.md).

**Cách thực hiện:** dùng native Fetch hiện có để gọi API không tải lại trang (cách gọi bất đồng bộ thường gọi là AJAX); debounce khoảng 300 ms sau khi dừng gõ, bắt đầu từ một ký tự hợp lệ; không yêu cầu thư viện mới hoặc WebSocket. Hủy request bằng AbortController và dùng định danh từ khóa/lượt request để bỏ phản hồi cũ, kể cả khi hủy không kịp. Không gọi API lúc IME đang composition; khi composition kết thúc mới kiểm tra/gửi từ khóa hoàn chỉnh. Khi query rỗng, không hợp lệ hoặc đóng hộp thoại: hủy timer/request và loại kết quả cũ; query mới đang chờ không hiển thị kết quả query cũ như thể đang khớp. Debounce 300 ms là cấu hình khởi đầu để kiểm tra, không phải kết quả đo đạc tối ưu đã chứng minh.

## Kế hoạch kỹ thuật

Các quyết định nghiệp vụ đã được thống nhất. Phần dưới lưu kế hoạch đã dùng để triển khai; đối chiếu kết quả và vị trí code thực tế trong nhật ký. Truy vấn đã kiểm chứng trên MySQL 8.4.3: dùng utf8mb4_unicode_ci và thay đ/Đ thành d/D riêng, qua SQL có tham số của Sequelize rồi hydrate một trang bằng ORM; xem ADR-0003.

### Backend

1. Bổ sung validation query tại validators và gắn vào route danh sách. Giữ Controller nhận dữ liệu đã validate, gọi Service và trả response; logic tìm kiếm không nằm trong Controller.
   Với từ khóa chứa ký tự bị cấm trong giới hạn độ dài, BE trả tập kết quả rỗng/tổng bằng 0, không âm thầm bỏ ký tự để tìm. Áp dụng cả gọi API trực tiếp hoặc URL nhập tay; không truy vấn tìm kiếm DB cho query này. Query quá dài hoặc tham số cấu trúc sai trả 400 với thông báo rõ; lỗi mạng/server tách khỏi kết quả không khớp.
2. Mở rộng GET `/api/products` nhận `q`, `category`, `brand`, `price`, `sale`, `sort`, `page`, `limit`. FE gửi 12 Product/trang; giới hạn page size phía BE để request không vô hạn. Danh sách giá/sort hợp lệ được kiểm soát, không dùng trực tiếp tên trường do client gửi làm ORDER BY.
3. Bổ sung association Product–Category đang thiếu nếu dùng ORM include để tìm tên danh mục/kiểm tra trạng thái. Xây dựng điều kiện mỗi từ khóa khớp ít nhất một trong ba trường; mọi từ khóa phải khớp. Xác minh cách so khớp MySQL bằng ca tiếng Việt có dấu/không dấu, đ/d và Unicode tổ hợp; không giả định collation mặc định đã đáp ứng.
4. Tính Starting Price, giá gốc tương ứng, hết hàng và khuyến mãi tại BE theo Variant đang hoạt động. Khi nhiều Variant có cùng giá thấp nhất, dùng ID Variant tăng dần để chọn giá gốc đi kèm ổn định. Lọc giá/khuyến mãi và sắp xếp trên tập Product đã tính toán, trước limit/offset. Không lấy toàn bộ tập khớp về Node rồi mới filter/slice.
5. Tổng số phải là số Product sau toàn bộ điều kiện, không bị nhân lên bởi nhiều Variant/ảnh. Phân trang trên Product trước khi nạp các quan hệ một-nhiều cho trang đó; dùng tiêu chí phụ ID để thứ tự ổn định.
6. Giữ `success` và `data` dạng mảng; thêm `total`, `page`, `limit`, `totalPages`. Trả các giá trị tính sẵn cho thẻ, lọc và phân trang. Giữ dữ liệu Variant mà collection Postman hiện cần hoặc cập nhật các request phụ thuộc đồng bộ nếu điều chỉnh payload.

### Frontend

1. `services/api/client/productService.js`: gửi toàn bộ tiêu chí và signal; trả cả dữ liệu trang và metadata thay vì chỉ mảng.
2. `hooks/client/useProducts.js`: URL là nguồn tiêu chí đã submit; gọi API khi tiêu chí thay đổi, hủy/bỏ request cũ, đọc count/page từ BE. Bỏ tính giá, lọc, sort và slice sản phẩm tại FE; giữ constants phục vụ nhãn giao diện.
3. `components/header.jsx`: bỏ gợi ý hardcode, thêm danh sách Product thật cập nhật khi gõ; tách hook/component phục vụ debounce, request, loading/error/empty và kết quả trong hộp thoại theo các quyết định bổ sung. Tìm từ Header luôn trên toàn cửa hàng. Giữ bộ lọc của trang đang xem tách khỏi từ khóa nháp của hộp thoại.
4. Trang products và các component header/grid/card/pagination: ô tìm kiếm tại trang, từ khóa, tổng kết quả, reset riêng từng nhóm tiêu chí, trạng thái tải/lỗi/rỗng và nhãn hết hàng. Đọc giá/khuyến mãi từ BE.
5. `layouts/mainLayout.jsx`: xử lý việc đổi query của trang `/products` đang kích hoạt loading toàn trang/gỡ Outlet; tránh request lặp và mất ô nhập khi đổi trang/filter.

### Kiểm tra dự kiến

- Khớp một/nhiều từ qua các trường; có/không dấu, hoa/thường, đ/d, Unicode tổ hợp; query chứa ký tự bị cấm phải cho tập rỗng và đúng thông báo, không bị lọc bỏ ký tự để tìm query khác. Kiểm cả nhập, dán, URL và API trực tiếp.
- Điều kiện Product/Brand/Category/Variant; nhiều Variant và ảnh không làm trùng Product hoặc sai total.
- Giá sale hợp lệ, Variant bị ẩn, Variant hết hàng và fallback giá; biên các khoảng giá hiện có; khuyến mãi theo Q16, bao gồm ca chỉ Variant hết hàng được giảm giá.
- Kết hợp q + category + brand + giá + khuyến mãi + sort trước phân trang. Tạo dữ liệu nhiều hơn một trang và đặt Product phù hợp ngoài trang đầu để phát hiện lỗi lọc sau phân trang.
- total/totalPages/page đúng; cùng giá/thời điểm tạo vẫn có thứ tự ổn định; trang vượt giới hạn theo Q19.
- URL, reset, lịch sử, request về muộn, lỗi/thử lại và mobile/keyboard; kiểm tra comment tiếng Việt dễ review.
- Tìm trực tiếp: gõ nhanh, IME tiếng Việt, sửa/xóa/dán từ khóa, đóng/mở hộp thoại khi request đang chạy; query mới không bị kết quả query cũ ghi đè. Kiểm tải thêm theo query, không trùng Product, không nối trang của query cũ và dừng khi đủ total.
- Chạy test phù hợp, FE lint/build, cập nhật Postman cho metadata mới. Đo phản hồi với dữ liệu đủ nhiều trang; xác minh response chỉ có dữ liệu một trang và truy vấn BE có giới hạn, không cam kết thời gian khi chưa đo.

## Hợp đồng API để triển khai

Endpoint: `GET /api/products`. Giữ API danh sách duy nhất cho trang kết quả và hộp thoại; hộp thoại gọi theo q/page/limit, trang kết quả gửi thêm filter/sort. Không cần endpoint riêng chỉ để autocomplete.

| Query | Quy tắc |
| --- | --- |
| `q` | Tùy chọn; Unicode NFC, trim/gộp khoảng trắng; tối đa 100 ký tự; ký tự bị cấm trả tập rỗng. Không có q là danh sách thường, vẫn áp dụng visibility/filter. |
| `category`, `brand` | Slug; slug không tồn tại cho kết quả rỗng như hành vi hiện có. UI tiếp tục đọc cate/cat từ URL và chuyển thành category khi gọi API. |
| `price` | Giữ các mã khoảng giá hiện có: all, under-10m, 10m-20m, 20m-30m, above-30m. Dùng cận dưới bao gồm, cận trên không bao gồm như source; above-30m từ 30 triệu trở lên. |
| `sale` | Boolean dạng query true/false; true chỉ lấy Promotional Product. |
| `sort` | newest (mặc định), price_asc, price_desc, popular; khóa sort chỉ từ allowlist. |
| `page` | Số nguyên dương, mặc định 1; vượt tổng trang thì trả trang cuối có dữ liệu. |
| `limit` | Mặc định 12; giới hạn kỹ thuật dự kiến 1–100. FE/hộp thoại dùng 12, không cho request vô hạn. |

Response thành công giữ `success: true` và `data` dạng mảng, thêm `total`, `page`, `limit`, `totalPages`. `total` là số Product duy nhất sau toàn bộ filter, không phải số dòng join hoặc số phần tử của trang. Với tập rỗng, data là [], total là 0, page là 1; totalPages tối thiểu 1 để tương thích quy ước trang hiện tại, UI không hiện điều khiển phân trang khi có tối đa một trang.

Mỗi Product giữ thông tin quan hệ cần cho caller hiện có và bổ sung các giá trị đã tính tại BE: `minPrice`, `originalPrice`, `hasSale`, `isOutOfStock`. FE chỉ chuẩn hóa hình ảnh/định dạng hiển thị, không tự tính lại giá hoặc quyết định Product đủ điều kiện. Giữ variants cần cho collection Postman; nếu payload cần giảm thêm, phải cập nhật caller và collection đồng bộ.

## Trình tự triển khai và tiêu chí nghiệm thu

| Bước | Kết quả phải có | Cách nghiệm thu |
| --- | --- | --- |
| 1. Kiểm chứng truy vấn | Chọn cách so khớp tiếng Việt trên DB thực tế; xây tập Product đủ điều kiện và phép tính giá/khuyến mãi. | Ca có/không dấu, đ/d, Unicode tổ hợp, nhiều Variant/Image; kiểm SQL sinh ra trước khi chốt cách aggregate/count. Không dùng slug như bản thay thế tên bỏ dấu. |
| 2. API danh sách | Validation, service query, metadata và giá/nhãn đã tính; mọi filter/sort trước limit/offset. | Dữ liệu hơn một trang; Product phù hợp nằm ngoài trang đầu vẫn được tìm/lọc đúng; total duy nhất; mỗi response không quá limit Product. |
| 3. Trang products | Hook/service dùng BE; q/filter/sort/page đồng bộ URL và lịch sử; giữ state khi đổi query. | Tìm, đổi/xóa từng tiêu chí, Back/Forward, refresh, trang vượt giới hạn, tập rỗng và Thử lại; giá hiển thị khớp giá lọc/sort. |
| 4. Hộp thoại trực tiếp | Input, debounce, IME, AbortController, kết quả Product và tải thêm; Enter/Xem tất cả/chọn Product đúng luồng. | Gõ iphone → iphone 16 → iphone 16 pro; sửa/xóa/dán query; phản hồi đảo thứ tự; query mới lúc tải thêm; đóng/mở modal và keyboard/mobile. |
| 5. Review và bàn giao | Test cần thiết, FE lint/build, Postman và nhật ký đầy đủ. | Comment tiếng Việt giải thích các đoạn chính; mọi file thực tế đổi có vị trí, công dụng, lý do và kết quả kiểm tra trong ChangeLog; phân biệt kết quả đã chạy với phần chưa xác minh. |

Các kiểm chứng và test ở bảng này là công việc dự kiến của giai đoạn triển khai; chưa được chạy trong phiên lập kế hoạch. Nếu kiểm chứng buộc phải đổi schema hoặc cách tiếp cận, cập nhật kế hoạch và nhật ký theo bằng chứng thực tế trước khi thực hiện phần phát sinh.

## Kết quả đối chiếu kỹ thuật

- Starting Price đã được tính tại BE theo quy tắc mới; test HTTP kiểm giá còn hàng, fallback hết hàng, giá gốc đi kèm và Variant bị ẩn. Các trang ngoài phạm vi giữ luồng riêng.
- MySQL 8.4.3 thực tế không coi đ/d là một chỉ nhờ collation; truy vấn thay đ/Đ riêng, chuẩn hóa query NFC và kiểm bằng ca tiếng Việt/Unicode tổ hợp tại HTTP API.
- BE có 6 test tích hợp API với schema tạm riêng; FE có 5 test hook mới và 9 test ảnh hiện có. Ranh giới kiểm thử là HTTP API và hook quan sát qua response HTTP/Router như đã thống nhất trong kế hoạch; không test helper private bằng mock nội bộ.
- Dự án JavaScript không có cấu hình TypeScript/typecheck. Đã kiểm syntax BE bằng node --check, lint và build toàn FE; chưa đánh giá hiệu năng với catalog quy mô lớn nên không cam kết ngưỡng thời gian đáp ứng.

## Cách ghi nhận trong phiên

- Ghi từng quyết định khi người dùng trả lời, kèm ví dụ biên và các câu hỏi còn mở.
- Chỉ bổ sung `GLOSSARY.md` khi thuật ngữ nghiệp vụ được thống nhất; không đưa chi tiết kỹ thuật vào định nghĩa.
- Chỉ đề xuất ADR khi quyết định khó đảo ngược, cần giải thích cho người đọc sau và có đánh đổi thực sự.
- Khi hết câu hỏi, tổng hợp kế hoạch triển khai theo file/tầng cùng tiêu chí nghiệm thu để người dùng xác nhận cách hiểu trước khi bắt đầu code.

## Yêu cầu review code đã chốt

- Code mới hoặc phần sửa phải có comment tiếng Việt giải thích rõ mục đích, quy tắc nghiệp vụ, lý do lựa chọn cách xử lý và trường hợp biên để người dùng dễ review.
- Chú thích rõ các đoạn chuẩn hóa/tách từ khóa, ghép điều kiện tìm kiếm, điều kiện xuất hiện/hết hàng, tính giá, đồng bộ URL và chống kết quả request cũ ghi đè nếu được triển khai.
- Với hàm xử lý chính, mô tả đầu vào/đầu ra và ví dụ khi cần; comment phải khớp hành vi cuối cùng của code.
- Khi nghiệm thu, kiểm tra cả tính dễ hiểu của comment và tính đúng của chức năng. Yêu cầu này được bổ sung trực tiếp từ người dùng, không phải suy luận từ skill.
- Duy trì một file [clientProductSearchChangeLog.md](./clientProductSearchChangeLog.md) trong docs: liệt kê từng file sửa/thêm, vị trí bằng tên hàm/component/mục và số dòng sau khi hoàn tất, giải thích công dụng và lý do, kèm cách kiểm tra. Phân biệt việc đã thực hiện với thay đổi mới dự kiến; cập nhật nhật ký khi triển khai và sau lần chỉnh cuối để số dòng đúng với source.

## Quyết định đã chốt

- **Q1:** Phạm vi triển khai gồm FE và BE; truy vấn tìm kiếm thực hiện tại BE.
- **Q2:** Mỗi Product xuất hiện một lần; chọn Variant tại trang chi tiết. Bổ sung thuật ngữ Product Search vào `GLOSSARY.md`.
- **Q3 (thay thế quyết định cũ):** Hộp thoại hiển thị sản phẩm thật và cập nhật theo quá trình gõ; Enter/nút tìm kiếm theo Q24.
- **Q4:** Tìm mới từ Header trên toàn cửa hàng, bỏ bộ lọc trước đó và bắt đầu ở trang 1.
- **Q5:** Tìm trong tên Product, tên thương hiệu, tên danh mục; chưa tìm mô tả/SKU/Attribute Option.
- **Q6:** Không phân biệt hoa/thường hoặc dấu tiếng Việt, bao gồm đ/d; chưa tự sửa chính tả.
- **Q7:** Product/Brand/Category đang hoạt động và có Variant đang hoạt động; Product hết hàng vẫn hiện với nhãn “Hết hàng”.
- **Q8:** Dùng `/products?q=...`, hiển thị từ khóa và tổng kết quả, có ô sửa và thao tác xóa từ khóa.
- **Q9 (đã cập nhật):** Bỏ gợi ý hardcode hiện tại, bổ sung kết quả trực tiếp trong hộp thoại theo yêu cầu mới; chưa thêm lịch sử tìm kiếm.
- **Q10:** Mọi từ khóa đều phải khớp một trong ba trường, cho phép khớp qua nhiều trường, khác thứ tự và khớp một phần từ.
- **Q11:** Giữ từ khóa khi đổi/xóa bộ lọc; xóa từ khóa giữ bộ lọc; sửa từ khóa tại trang kết quả giữ bộ lọc; đổi từ khóa/filter/sort về trang 1. Tìm từ Header vẫn bắt đầu mới.
- **Q12:** Mặc định Mới nhất theo thời điểm tạo, dùng ID để ổn định khi trùng thời điểm; giữ sort giá tăng/giảm và bán chạy, chưa xếp hạng độ liên quan.
- **Q13:** Starting Price theo giá bán thực tế, ưu tiên Variant đang hoạt động/còn hàng, fallback về Variant đang hoạt động khi tất cả hết hàng. Đồng bộ giá thẻ/lọc/sort và cập nhật glossary.
- **Q14:** Quy tắc xuất hiện và nhãn hết hàng áp dụng cho `/products` cả khi không có từ khóa.
- **Q15:** Chuyển toàn bộ tìm kiếm, lọc, sắp xếp và phân trang sang BE ngay trong bản đầu; FE hiển thị một trang và metadata từ BE.
- **Q16:** Khuyến mãi xét Variant đang hoạt động kể cả hết hàng; Variant bị ẩn không được tính. Cập nhật Promotional Product trong glossary.
- **Q17:** Không chấp nhận query chứa ký tự đặc biệt theo Q22; trim/gộp khoảng trắng, tối đa 100 ký tự; query quá dài báo lỗi. Header rỗng không submit; submit rỗng tại trang kết quả xóa q và giữ filter.
- **Q18:** Loading tại vùng kết quả, giữ ô nhập/filter; rỗng có reset riêng, lỗi có Thử lại; hỗ trợ keyboard/focus và bỏ request cũ.
- **Q19:** URL/lịch sử khôi phục tiêu chí và trang; chuẩn hóa URL dùng replace, thao tác chủ động tạo lịch sử; vượt trang về trang cuối, tập rỗng trang 1.
- **Q20:** Hết hàng có nhãn và nút Xem chi tiết thay Mua ngay.
- **Q21:** Bộ lọc chỉ hiện Category/Brand đang hoạt động; không loại chỉ vì tập kết quả hiện tại rỗng.
- **Q22:** Chỉ chữ cái Unicode, chữ số và khoảng trắng hợp lệ; giữ nội dung sai để sửa nhưng hiển thị tập kết quả rỗng.
- **Q23:** Hộp thoại tải 12 Product mỗi đợt, cuộn/tải thêm tới hết tập kết quả; đổi query bắt đầu lại.
- **Q24:** Chọn Product mở chi tiết; Enter/Xem tất cả mở trang kết quả; không cập nhật URL theo từng phím trong hộp thoại.
- **Comment:** Giải thích code rõ ràng bằng tiếng Việt để người dùng dễ review theo yêu cầu bổ sung.
- **Nhật ký review:** Ghi tên file, vị trí sửa/thêm, công dụng và lý do vào một file Markdown trong docs; cập nhật theo thay đổi thực tế.

Người dùng đã xác nhận toàn bộ các nhánh nghiệp vụ và yêu cầu tài liệu. Không còn câu hỏi phỏng vấn đang mở. Các điểm kiểm chứng MySQL/query/performance là công việc kỹ thuật khi triển khai, không phải yêu cầu chưa được chốt.

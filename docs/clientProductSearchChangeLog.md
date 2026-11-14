# Nhật ký triển khai tìm kiếm sản phẩm Client

Tài liệu này ghi các file thực tế đã sửa/thêm, vị trí cần đọc, công dụng và lý do thay đổi để review/nghiệm thu. Yêu cầu đã chốt và hợp đồng API nằm tại [clientProductSearchInterview.md](./clientProductSearchInterview.md).

## Trạng thái

Đã triển khai FE/BE và chạy test, lint, build thành công. Đang thực hiện review Standards/Spec trước khi bàn giao. Mốc so sánh trước triển khai: `f3e41c232f96cf0e6bf76e990f77bc2a2ecd8a82`, branch `feature/search_product`.

Các số dòng bên dưới là vị trí bắt đầu của hàm/component hoặc mục sau triển khai; đi kèm tên để dễ tìm khi dòng dịch chuyển. Comment logic mới/sửa được viết bằng tiếng Việt.

## Backend — file thực tế đã thay đổi

| File | Loại | Vị trí cần đọc | Công dụng/ý nghĩa | Lý do làm như vậy |
| --- | --- | --- | --- | --- |
| [productSearchService.js](../BE/src/services/client/productSearchService.js) | Thêm | Dòng 20 PRICE_RANGES/SORTS; dòng 44 getProductPage | Query Product theo mọi từ qua tên/Brand/Category; visibility; Starting Price; ưu đãi; sort; count và phân trang. | Lọc/sort phải xảy ra trước LIMIT để kết quả và tổng chính xác. SQL chọn một Variant đại diện trước, không nhân Product theo quan hệ một-nhiều. |
| [productSearchService.js](../BE/src/services/client/productSearchService.js) | Thêm | Trong getProductPage: conditions/replacements, JOIN chosen, transaction và hydrate | Chuẩn hóa đ/d riêng; dữ liệu khách qua replacements; chọn Variant còn hàng/giá thấp nhất; hydrate chỉ ID của trang trong cùng snapshot. | Collation thực tế không tự khớp đ/d. Tham số tránh ghép dữ liệu người dùng vào SQL; snapshot giữ metadata/trang nhất quán; không tải cả catalog về Node. |
| [productSearchQuery.js](../BE/src/utils/productSearchQuery.js) | Thêm | Dòng 2 normalizeProductKeyword, dòng 4 isProductKeywordAllowed | NFC, trim/gộp khoảng trắng và chỉ chấp nhận chữ cái/chữ số/khoảng trắng. | Tiếng Việt tổ hợp vẫn hợp lệ; query có ký tự cấm phải rỗng, không tự bỏ ký tự để tìm query khác. |
| [productValidators.js](../BE/src/validators/productValidators.js) | Sửa | Dòng 10 listProductRules và export | Validate query, giới hạn 100 ký tự, limit 1–100, page nguyên dương, allowlist price/sort/sale; lấy matchedData. | Chặn query sai cấu trúc trước Service; Express 5 có getter req.query nên phải lấy dữ liệu đã sanitize từ validator. Validator tạo Product vẫn dùng riêng. |
| [productRoutes.js](../BE/src/routes/client/productRoutes.js) | Sửa | Dòng 13 route GET `/`, validator tại dòng 15 | Gắn validation trước controller danh sách. | Giữ Router phụ trách đường dẫn và middleware; không đặt logic truy vấn tại route. |
| [productController.js](../BE/src/controllers/client/productController.js) | Sửa | Dòng 10 getAllProductsController | Chuyển query đã validate xuống Service, trả success cùng data/total/page/limit/totalPages. | Controller mỏng, không tính giá hoặc xử lý nghiệp vụ; FE cần metadata để phân trang. |
| [productService.js](../BE/src/services/client/productService.js) | Sửa | Dòng 23 import getProductPage thành getAllProducts | Thay danh sách trả toàn bộ bằng Service phân trang mới; giữ các export home/chi tiết/related. | Chỉ đổi contract endpoint danh sách Client, tách truy vấn phức tạp khỏi các luồng sản phẩm khác. |
| [productSearch.test.js](../BE/tests/productSearch.test.js) | Thêm | Setup dòng 8; sáu test từ dòng 87 | Test qua HTTP API với MySQL thật, dữ liệu nhiều Product/Variant/Image; schema test riêng. | Bắt lỗi collation, count trùng, lọc sau phân trang, visibility và fallback giá mà mock ORM không chứng minh được. |
| [package.json](../BE/package.json) | Sửa | Dòng 10 script test | npm test chạy node --test tests/*.test.js. | Thay script placeholder bằng bộ kiểm thử thực thi được. |

Giá và nhãn khuyến mãi được BE tính một lần. Q16 dùng phương án đã chốt: Variant active có ưu đãi vẫn được tính dù hết hàng; Starting Price vẫn ưu tiên Variant active còn hàng. ID Variant phá hòa khi giá bằng nhau để giá gốc đi kèm ổn định.

## Frontend — file thực tế đã thay đổi

| File | Loại | Vị trí cần đọc | Công dụng/ý nghĩa | Lý do làm như vậy |
| --- | --- | --- | --- | --- |
| [productService.js](../FE/my-app/src/services/api/client/productService.js) | Sửa | Dòng 20 getProducts | Gửi toàn bộ tiêu chí và AbortSignal, trả cả response phân trang. | Bản cũ chỉ gửi category/brand và bỏ metadata; hủy request giúp tránh tải thừa khi đổi query. |
| [productSearch.js](../FE/my-app/src/utils/productSearch.js) | Thêm | Dòng 3/7 chuẩn hóa và inspect; dòng 17 toProductCard; dòng 34/59/72 xử lý tiêu chí URL | Kiểm query tại UI, chuyển dữ liệu sang thẻ, chuẩn hóa URL và tách thao tác đổi/xóa q/filter. | Phản hồi ngay cho ký tự cấm; FE không tính lại giá/sort/filter của BE; query đã submit khôi phục được bằng URL. |
| [productFilters.js](../FE/my-app/src/constants/productFilters.js) | Thêm | Dòng 2 PRICE_RANGES; dòng 9 SORT_OPTIONS | Mã và nhãn filter/sort dùng chung trong UI. | Tách constants khỏi hook; giữ cùng mã API nhưng không còn cận giá/logic lọc tại FE. |
| [useProductSearch.js](../FE/my-app/src/hooks/client/useProductSearch.js) | Thêm | Dòng 19 useProductSearch; requestPage/effect/loadMore bên trong | Debounce 300 ms, IME, hủy request, bỏ response cũ, tải thêm 12 Product và chống trùng ID. | Kết quả phải theo query mới nhất kể cả khi hủy không kịp; trang của query cũ không được nối vào query mới. |
| [productSearchOverlay.jsx](../FE/my-app/src/components/client/search/productSearchOverlay.jsx) | Thêm | Dòng 9 ProductSearchOverlay, effect focus/inert, submit và danh sách | Hộp thoại hiển thị Product thật khi gõ, loading/rỗng/lỗi, tải thêm, chọn chi tiết và Xem tất cả; Portal, focus trap và Escape. | Thay gợi ý hardcode; Portal/inert giữ bàn phím trong hộp thoại và phục hồi focus khi đóng, không để query nháp làm đổi URL từng phím. |
| [productSearchForm.jsx](../FE/my-app/src/components/client/search/productSearchForm.jsx) | Thêm | Dòng 5 ProductSearchForm | Ô sửa từ khóa trên trang, kiểm 100 ký tự và không submit giữa lúc ghép dấu; xóa riêng q. | Sửa từ khóa vẫn giữ filter; form đồng bộ lại khi q thay đổi do submit/Back. |
| [header.jsx](../FE/my-app/src/components/header.jsx) | Sửa | Import dòng 1; closeSearch dòng 185; mount overlay dòng 648 | Bỏ SearchOverlay/gợi ý cũ, dùng component mới chỉ mount khi mở; callback đóng ổn định. | Đóng hộp sẽ unmount/hủy request và query nháp; tránh nhồi logic mạng/IME vào Header. |
| [useProducts.js](../FE/my-app/src/hooks/client/useProducts.js) | Sửa | Dòng 19 useProducts; effect fetch/cache, setFilter/resetFilters/clearQuery | Đọc tiêu chí từ URL, gọi API một trang, nhận metadata, lọc lựa chọn Category/Brand active; bỏ tính giá/lọc/sort/slice sản phẩm tại FE. | Một trang từ BE không được lọc/sort lại tại FE; cache chỉ tránh gọi lặp khi BE kẹp trang và được xóa sau lỗi để Back không kẹt loading. |
| [products.jsx](../FE/my-app/src/pages/client/products.jsx) | Sửa | Dòng 11 Products | Ghép tiêu đề/form/filter/grid/pagination, loading/lỗi chỉ ở vùng kết quả, Thử lại giữ tiêu chí. | Không mất ô nhập/filter khi tải và không reload toàn trang chỉ để thử lại API. |
| [ProductListHeader.jsx](../FE/my-app/src/components/client/products/ProductListHeader.jsx) | Sửa | Dòng 10 ProductListHeader, title/count và reset | Hiện q và total từ BE, nhãn Xóa bộ lọc; lấy constants từ module riêng. | Người mua biết query đang áp dụng; phân biệt xóa filter với xóa q. |
| [ProductGrid.jsx](../FE/my-app/src/components/client/products/ProductGrid.jsx) | Sửa | Dòng 8 ProductGrid, nhánh rỗng | Thông báo phù hợp query/filter; hai thao tác xóa riêng; sửa import đúng chữ hoa của file hiện có. | Không giải thích mọi tập rỗng như lỗi bộ lọc và không âm thầm xóa q cùng filter. |
| [ProductCard.jsx](../FE/my-app/src/components/client/products/ProductCard.jsx) | Sửa | Dòng 6 ProductCard, nhãn và nút hành động | Đọc giá/ưu đãi/hết hàng từ dữ liệu BE; hiện Hết hàng và Xem chi tiết. | Product hết hàng vẫn được xem, nhưng không gợi ý Mua ngay. Giá gạch ngang chỉ hiện khi giá gốc lớn hơn Starting Price. |
| [ProductPagination.jsx](../FE/my-app/src/components/client/products/ProductPagination.jsx) | Sửa | Dòng 4 ProductPagination, candidates | Dùng metadata BE; tạo tối đa năm số trang ứng viên và dấu ba chấm. | Không lặp qua toàn bộ tổng trang khi catalog lớn; giữ nút trước/sau và trang lân cận. |
| [productFilter.jsx](../FE/my-app/src/components/client/products/productFilter.jsx) | Sửa | Import PRICE_RANGES gần đầu file | Dùng constants mới; danh sách active đã chuẩn hóa trong useProducts. | Loại phụ thuộc constants từ hook, giữ cơ chế UI desktop/mobile hiện có. |
| [mainLayout.jsx](../FE/my-app/src/layouts/mainLayout.jsx) | Sửa | Dòng 22 isProductsPage; dòng 50 gateOutlet; dòng 60 Loading | Không gỡ Outlet hoặc bật loading toàn trang cho products khi đổi query. | Gỡ Outlet làm mất state và hủy/tạo lại request; trang products tự quản lý loading vùng kết quả. |
| [productSearch.test.mjs](../FE/my-app/tests/productSearch.test.mjs) | Thêm | Năm test từ dòng 51, hook và Router harness | Kiểm debounce, IME, input cấm, response đảo thứ tự, tải thêm, URL/reset/Back và Back sau lỗi mạng. | Test tại hook + biên HTTP/Router theo kế hoạch; fake response mô phỏng trường hợp mạng khó tái hiện bằng click thông thường. |
| [package.json](../FE/my-app/package.json), [package-lock.json](../FE/my-app/package-lock.json) | Sửa | devDependencies jsdom và lock tương ứng | Thêm jsdom chỉ phục vụ test React DOM/hook. | Dự án chưa có DOM test environment; không thêm dependency chạy trong bundle sản phẩm. |

## Tài liệu và collection API

| File | Loại | Vị trí cần đọc | Công dụng/ý nghĩa | Lý do làm như vậy |
| --- | --- | --- | --- | --- |
| [Get All Products.request.yaml](../postman/collections/TechStore%20API/Products/Get%20All%20Products.request.yaml) | Sửa | URL và afterResponse, phần metadata | Gọi page/limit/sort và kiểm data/total/totalPages/giá/nhãn/ID duy nhất; giữ biến product_id/variant_id. | Collection phải theo response mới và không làm hỏng request dùng Variant sau đó. |
| [GLOSSARY.md](../GLOSSARY.md) | Sửa/thêm | Dòng 27 Starting Price, dòng 31 Promotional Product, dòng 39 Product Search | Thống nhất giá, Product ưu đãi và đơn vị kết quả Product. | Quy tắc Q13/Q16 và cách phân biệt Search với Filter cần được ghi rõ bằng ngôn ngữ nghiệp vụ. |
| [0003-client-product-search-query.md](./adr/0003-client-product-search-query.md) | Thêm | Toàn bộ ADR | Ghi vì sao dùng SQL có tham số qua Sequelize cho tập ID/count/page rồi hydrate bằng ORM. | Đây là lựa chọn có đánh đổi so với ưu tiên ORM và cần giữ lý do để người sau không đổi thành join/phân trang sai. |
| [clientProductSearchInterview.md](./clientProductSearchInterview.md) | Thêm/cập nhật | Bản tổng hợp, các vòng Q1–Q24, API, kế hoạch và kết quả đối chiếu | Lưu yêu cầu đã thống nhất, nguồn khảo sát trước triển khai và hợp đồng để nghiệm thu. | Không để các quyết định cũ đã thay thế bị hiểu nhầm là yêu cầu hiện hành; phân biệt mốc source cũ với kết quả thực hiện. |
| [clientProductSearchChangeLog.md](./clientProductSearchChangeLog.md) | Thêm/cập nhật | Toàn bộ file | Nhật ký thực tế với tên file, vị trí, công dụng, lý do và bằng chứng kiểm tra. | Yêu cầu trực tiếp của người dùng để đọc, review và nghiệm thu code. |

Không sửa model/schema/database cửa hàng; quan hệ Category được join trong truy vấn nên không cần thêm association vào models/index.js. Không thay các endpoint home/chi tiết/Admin. `package-lock.json` ở root đã modified trước task và không được đưa vào commit tính năng.

## Kết quả kiểm tra đã chạy

| Kiểm tra | Kết quả | Phạm vi đã chứng minh |
| --- | --- | --- |
| BE: npm test | 6/6 đạt | HTTP API với MySQL 8.4.3 thật, hơn một trang Product, nhiều Variant/Image, query tiếng Việt/Unicode, validation, visibility, giá và metadata. |
| BE: node --check trên file JS đã sửa/thêm | Đạt | Syntax JavaScript Backend và test. |
| FE: npm test | 14/14 đạt | 5 test hook/Router mới và 9 test ảnh hiện có. |
| FE: npm run lint | Đạt | ESLint toàn frontend, không tắt rule bằng comment. |
| FE: npm run build | Đạt | Vite build production; còn cảnh báo chunk JS lớn hơn 500 kB, chưa thực hiện code splitting ngoài phạm vi tìm kiếm. |
| Orca browser desktop 1440×1000 | Đạt | Kết quả Product thật; input iphone% cho thông báo rỗng; query a tải 12 rồi đủ 15 Product; Escape trả focus về nút search và bỏ inert nền. |
| Orca browser mobile 390×844 | Đạt | iphone 16 pro max cho đúng một Product; Enter mở URL kết quả tương ứng; không tràn ngang. Đã xem screenshot desktop/mobile để đối chiếu bố cục. |
| git diff --check | Đạt | Không lỗi khoảng trắng/xung đột trong diff. |

TDD có vòng đỏ → xanh tại API tìm Product/phân trang, hook tìm trực tiếp và lỗi Back sau lỗi mạng. API test tạo schema `techstore_search_test_<pid>` rồi xóa sau chạy, không gọi connectDB/sync trên database cửa hàng. Cần MySQL và tài khoản phát triển có quyền tạo/xóa schema test. FE test dùng jsdom/Vite và mock tại biên HTTP, không mock helper/Service nội bộ.

Dự án dùng JavaScript và không có cấu hình TypeScript/typecheck; syntax BE, ESLint và Vite build là các bước kiểm tra tương ứng hiện có. Chưa benchmark catalog quy mô lớn, chưa cam kết ngưỡng thời gian đáp ứng hoặc kiểm thử mọi phiên bản MySQL/trình duyệt.

## Hướng dẫn nghiệm thu nhanh

1. Chạy BE bằng npm run dev và FE bằng npm run dev trong đúng thư mục; dùng VITE_API_URL/CORS_ORIGIN hiện có nếu cần đổi cổng.
2. Mở tìm kiếm ở Header, gõ iphone rồi iphone 16 pro max; danh sách tự thu hẹp. Enter/Xem tất cả mở trang kết quả, bấm Product mở chi tiết.
3. Nhập iphone%, USB-C hoặc emoji: phải hiện Không tìm thấy sản phẩm phù hợp; xóa ký tự đó thì tìm lại bình thường. Thử dán chữ tiếng Việt và nhập bằng bộ gõ.
4. Tìm q có nhiều kết quả, đổi giá/sale/sort và trang; kiểm total sau toàn bộ bộ lọc. Xóa bộ lọc giữ q, xóa q giữ bộ lọc; Back/Forward/refresh khôi phục tiêu chí.
5. Kiểm Product hết hàng vẫn hiện nhãn và Xem chi tiết; giá phải theo Variant active còn hàng hoặc fallback khi hết toàn bộ.
6. Ngắt mạng để kiểm Thử lại, đổi query khi request đang chạy, rồi nhấn Back; không được hiện Product của query cũ hoặc kẹt loading.

## Review cuối

### Standards

Đang chờ review độc lập từ mốc trước triển khai.

### Spec

Đang chờ review độc lập theo clientProductSearchInterview.md.

Sau review sẽ ghi kết quả, sửa các phát hiện cần thiết, cập nhật số dòng nếu thay đổi và ghi commit bàn giao. Chỉ đánh dấu kiểm tra đạt khi đã thực sự chạy.

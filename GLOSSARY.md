# TechStore

Hệ thống thương mại điện tử chuyên cung cấp thiết bị công nghệ với giao diện phong cách Apple và quy trình quản trị chuyên sâu.

## Language

**Product**:
Sản phẩm gốc/cha chứa thông tin cơ bản định danh chung như tên, thương hiệu, danh mục và mô tả tổng quan.
_Avoid_: Item, Good, Article

**Variant**:
Biến thể cụ thể có thể bán của sản phẩm, gắn liền với mã SKU riêng biệt, đơn giá (price), giá khuyến mãi (sale_price) và số lượng tồn kho (stock).
_Avoid_: Sub-product, Product detail, Model

**Attribute**:
Đặc tính phân loại dùng để tạo biến thể sản phẩm (ví dụ: Màu sắc, Dung lượng lưu trữ, Bộ nhớ RAM).
_Avoid_: Property, Characteristic, Field

**Attribute Option**:
Giá trị lựa chọn cụ thể thuộc về một Attribute (ví dụ: "Titan Sa Mạc", "256GB", "16GB").
_Avoid_: Option value, Variant value

**Cartesian Matrix**:
Bảng tổ hợp Descartes sinh ra từ danh sách các Attribute Option được chọn, tạo nên danh sách toàn bộ các Variant tự động cho một Product.
_Avoid_: Combination table, Product matrix

**Starting Price**:
Mức giá niêm yết thấp nhất được tính toán tự động từ tất cả các biến thể (Variant) khả dụng của một Product, hiển thị dưới dạng "Từ {giá}₫" trên trang chủ và danh sách sản phẩm.
_Avoid_: Base price, Minimum price

**Promotional Product**:
Sản phẩm có ít nhất một Variant đang áp dụng giá khuyến mãi hợp lệ (sale_price > 0 và sale_price < price), được gắn cờ hasSale và hiển thị nhãn "ƯU ĐÃI".
_Avoid_: Discounted good, Sale item, Deal product

**Product Filter**:
Tập hợp các tiêu chí lọc và sắp xếp đa chiều (Danh mục, Thương hiệu, Khoảng giá Starting Price, Trạng thái khuyến mãi) trên trang danh sách sản phẩm, đồng bộ 2 chiều với URL Search Parameters.
_Avoid_: Product searcher, Query filter, Search facet

**Cart**:
Giỏ hàng trực tuyến lưu trữ trên hệ thống, gắn liền với tài khoản người dùng đã đăng nhập, lưu trữ danh sách các Variant và số lượng chọn mua.
_Avoid_: Bag, Shopping basket

**Order**:
Đơn đặt hàng được tạo sau khi khách hàng xác nhận giỏ hàng và thông tin thanh toán, vận hành qua vòng đời trạng thái: Pending -> Confirmed -> Processing -> Shipping -> Completed (hoặc Cancelled). Khách hàng chỉ có quyền tự hủy đơn khi ở trạng thái Pending; từ Confirmed trở đi quyền chuyển đổi trạng thái thuộc về Admin hoặc Staff.
_Avoid_: Purchase, Transaction, Checkout session

**Order Item**:
Hàng mục sản phẩm cụ thể nằm trong một Order, lưu vết cố định thông tin tại thời điểm mua gồm Variant được chọn, đơn giá chốt, số lượng và thành tiền.
_Avoid_: Order product, Order line, Bought item

**Cancellation Reason**:
Lý do hủy đơn hàng được ghi nhận khi Order chuyển sang trạng thái Cancelled, bắt buộc phải cung cấp khi Admin hoặc Staff can thiệp hủy đơn.
_Avoid_: Cancel note, Reason text

**Reorder**:
Hành động tạo lại giỏ hàng (Cart) từ danh sách các Variant còn tồn kho khả dụng thuộc về một Order đã hoàn tất hoặc bị hủy.
_Avoid_: Repurchase, Order again, Buy again

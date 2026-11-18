# Admin và Staff chỉ xử lý Order đến Shipping

Admin/Staff được duyệt Order tuần tự đến Shipping, còn xác nhận kết quả giao hàng thuộc Shipper trên giao diện riêng. Chọn ranh giới này thay vì để Admin/Staff hoàn tất đơn nhằm tách trách nhiệm chuẩn bị/bàn giao hàng khỏi xác nhận giao và thu tiền; API phải giữ ranh giới quyền này dù giao diện Shipper chưa được triển khai.

Đợt hiện tại dừng ở Shipping, chưa thêm role/account/giao diện Shipper hoặc cạnh Shipping → Completed. Quy tắc Completed đồng thời paid của COD được hoãn đến nâng cấp giao hàng; chuyển Shipping không có nghĩa đã thu tiền. Trạng thái Completed hiện có vẫn được đọc và hiển thị.

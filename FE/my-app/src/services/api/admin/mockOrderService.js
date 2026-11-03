/**
 * Mock Order Service for Admin Order Management
 * - Quản lý và lưu trữ dữ liệu đơn hàng mẫu trên localStorage
 * - Mô phỏng latency ~250ms cho trải nghiệm thực tế
 * - Cung cấp đầy đủ các thao tác: danh sách, phân trang, lọc đa chiều, tìm kiếm,
 *   cập nhật trạng thái đơn hàng (kèm lý do hủy), cập nhật thanh toán, thao tác hàng loạt, reset data, xuất CSV.
 */

const STORAGE_KEY = "techstore_admin_orders_v1";

const INITIAL_MOCK_ORDERS = [
  {
    id: 1,
    order_code: "#TS-1024",
    created_at: "2026-11-04T08:30:00.000Z",
    updated_at: "2026-11-04T08:30:00.000Z",
    receiver_name: "Nguyễn Văn Tuấn",
    receiver_phone: "0908123456",
    receiver_email: "tuan.nguyen@gmail.com",
    address: "Tòa S2.05 Vinhome Grand Park, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh",
    subtotal: 36480000,
    shipping_fee: 0,
    discount_amount: 500000,
    total_amount: 35980000,
    payment_method: "vnpay",
    payment_status: "paid",
    order_status: "pending",
    note: "Giao hàng giờ hành chính, gọi trước 15 phút.",
    items: [
      {
        id: 101,
        product_id: 1,
        product_name: "iPhone 16 Pro Max",
        variant_id: 11,
        sku: "IP16PM-256-DESERT",
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Titan Sa Mạc" },
          { name: "Dung lượng", value: "256GB" },
        ],
        price: 34990000,
        quantity: 1,
        total: 34990000,
      },
      {
        id: 102,
        product_id: 2,
        product_name: "Ốp lưng Silicone MagSafe iPhone 16 Pro Max",
        variant_id: 22,
        sku: "CASE-16PM-BLK",
        image: "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Đen" },
        ],
        price: 1490000,
        quantity: 1,
        total: 1490000,
      },
    ],
  },
  {
    id: 2,
    order_code: "#TS-1025",
    created_at: "2026-11-04T07:15:00.000Z",
    updated_at: "2026-11-04T07:45:00.000Z",
    receiver_name: "Trần Thị Mai Anh",
    receiver_phone: "0912345678",
    receiver_email: "maianh.tran@outlook.com",
    address: "Số 45 Ngõ 12 Đào Tấn, Phường Cống Vị, Quận Ba Đình, Hà Nội",
    subtotal: 51980000,
    shipping_fee: 50000,
    discount_amount: 1000000,
    total_amount: 51030000,
    payment_method: "cod",
    payment_status: "pending",
    order_status: "pending",
    note: "Kiểm tra máy kỹ trước khi giao, đồng kiểm khi nhận hàng.",
    items: [
      {
        id: 103,
        product_id: 3,
        product_name: "MacBook Pro 14 inch M3 Pro",
        variant_id: 31,
        sku: "MBP14-M3P-18-512-SPACEBLK",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Đen Không Gian" },
          { name: "RAM", value: "18GB" },
          { name: "SSD", value: "512GB" },
        ],
        price: 49990000,
        quantity: 1,
        total: 49990000,
      },
      {
        id: 104,
        product_id: 4,
        product_name: "Chuột Apple Magic Mouse 2",
        variant_id: 41,
        sku: "MOUSE-MAGIC-SLV",
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Bạc" },
        ],
        price: 1990000,
        quantity: 1,
        total: 1990000,
      },
    ],
  },
  {
    id: 3,
    order_code: "#TS-1026",
    created_at: "2026-11-03T19:20:00.000Z",
    updated_at: "2026-11-04T06:00:00.000Z",
    receiver_name: "Lê Hoàng Long",
    receiver_phone: "0934888999",
    receiver_email: "longle.tech@gmail.com",
    address: "128 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP. Hồ Chí Minh",
    subtotal: 10990000,
    shipping_fee: 0,
    discount_amount: 0,
    total_amount: 10990000,
    payment_method: "momo",
    payment_status: "paid",
    order_status: "confirmed",
    note: "Dán sẵn cường lực màn hình giúp mình nhé shop.",
    items: [
      {
        id: 105,
        product_id: 5,
        product_name: "Apple Watch Series 10 GPS 42mm",
        variant_id: 51,
        sku: "AW10-42-GPS-JETBLK",
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Đen Bóng" },
          { name: "Kích thước", value: "42mm" },
          { name: "Kết nối", value: "GPS" },
        ],
        price: 10990000,
        quantity: 1,
        total: 10990000,
      },
    ],
  },
  {
    id: 4,
    order_code: "#TS-1027",
    created_at: "2026-11-03T16:45:00.000Z",
    updated_at: "2026-11-04T05:30:00.000Z",
    receiver_name: "Phạm Hải Đăng",
    receiver_phone: "0977112233",
    receiver_email: "haidang.pham@viettel.vn",
    address: "Tầng 12 Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội",
    subtotal: 20480000,
    shipping_fee: 30000,
    discount_amount: 500000,
    total_amount: 20010000,
    payment_method: "vnpay",
    payment_status: "paid",
    order_status: "confirmed",
    note: "Giao trong giờ hành chính tới lễ tân tòa nhà.",
    items: [
      {
        id: 106,
        product_id: 6,
        product_name: "iPad Air M2 11 inch Wi-Fi",
        variant_id: 61,
        sku: "IPADAIR-M2-11-128-BLU",
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Xanh Dương" },
          { name: "Dung lượng", value: "128GB" },
        ],
        price: 16990000,
        quantity: 1,
        total: 16990000,
      },
      {
        id: 107,
        product_id: 7,
        product_name: "Bút cảm ứng Apple Pencil Pro",
        variant_id: 71,
        sku: "PENCIL-PRO-WHT",
        image: "https://images.unsplash.com/photo-1585792180666-f7547c6a28c5?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Trắng" },
        ],
        price: 3490000,
        quantity: 1,
        total: 3490000,
      },
    ],
  },
  {
    id: 5,
    order_code: "#TS-1028",
    created_at: "2026-11-03T14:10:00.000Z",
    updated_at: "2026-11-03T18:00:00.000Z",
    receiver_name: "Vũ Bích Phương",
    receiver_phone: "0988665544",
    receiver_email: "bichphuong.vu@gmail.com",
    address: "72 Lê Duẩn, Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng",
    subtotal: 5990000,
    shipping_fee: 0,
    discount_amount: 200000,
    total_amount: 5790000,
    payment_method: "cod",
    payment_status: "pending",
    order_status: "processing",
    note: "Đang cần gấp trước cuối tuần, đóng gói chống sốc kỹ giúp em.",
    items: [
      {
        id: 108,
        product_id: 8,
        product_name: "Tai nghe AirPods Pro 2 USB-C (MagSafe)",
        variant_id: 81,
        sku: "AIRPODS-PRO2-USBC",
        image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Trắng" },
          { name: "Cổng sạc", value: "USB-C" },
        ],
        price: 5990000,
        quantity: 1,
        total: 5990000,
      },
    ],
  },
  {
    id: 6,
    order_code: "#TS-1029",
    created_at: "2026-11-03T11:00:00.000Z",
    updated_at: "2026-11-03T16:30:00.000Z",
    receiver_name: "Hoàng Minh Đức",
    receiver_phone: "0945678901",
    receiver_email: "duc.hoang@vng.com.vn",
    address: "Z06 Đường số 13, Khu chế xuất Tân Thuận, Quận 7, TP. Hồ Chí Minh",
    subtotal: 62980000,
    shipping_fee: 0,
    discount_amount: 1500000,
    total_amount: 61480000,
    payment_method: "vnpay",
    payment_status: "paid",
    order_status: "processing",
    note: "Xuất hóa đơn đỏ VAT cho công ty CP Công nghệ VNG.",
    items: [
      {
        id: 109,
        product_id: 9,
        product_name: "MacBook Pro 16 inch M3 Max",
        variant_id: 91,
        sku: "MBP16-M3MAX-36-1TB",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Bạc" },
          { name: "RAM", value: "36GB" },
          { name: "SSD", value: "1TB" },
        ],
        price: 62980000,
        quantity: 1,
        total: 62980000,
      },
    ],
  },
  {
    id: 7,
    order_code: "#TS-1030",
    created_at: "2026-11-02T15:30:00.000Z",
    updated_at: "2026-11-03T09:00:00.000Z",
    receiver_name: "Đỗ Gia Huy",
    receiver_phone: "0909554433",
    receiver_email: "huy.dogia@gmail.com",
    address: "Số 88 Trần Hưng Đạo, Phường 1, TP. Vũng Tàu, Bà Rịa - Vũng Tàu",
    subtotal: 21990000,
    shipping_fee: 45000,
    discount_amount: 0,
    total_amount: 22035000,
    payment_method: "cod",
    payment_status: "pending",
    order_status: "shipping",
    note: "Shipper Viettel Post: Đang giao tuyến TP. Vũng Tàu.",
    items: [
      {
        id: 110,
        product_id: 10,
        product_name: "iPhone 16 128GB",
        variant_id: 101,
        sku: "IP16-128-PNK",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Hồng Pastel" },
          { name: "Dung lượng", value: "128GB" },
        ],
        price: 21990000,
        quantity: 1,
        total: 21990000,
      },
    ],
  },
  {
    id: 8,
    order_code: "#TS-1031",
    created_at: "2026-11-02T10:20:00.000Z",
    updated_at: "2026-11-03T08:15:00.000Z",
    receiver_name: "Bùi Tuyết Mai",
    receiver_phone: "0918776655",
    receiver_email: "tuyetmai.bui@shopee.vn",
    address: "Khu đô thị Ecopark, Huyện Văn Giang, Hưng Yên",
    subtotal: 13980000,
    shipping_fee: 0,
    discount_amount: 300000,
    total_amount: 13680000,
    payment_method: "momo",
    payment_status: "paid",
    order_status: "shipping",
    note: "Giao cho mẹ mình nhận, số nhà Thảo Nguyên 12.",
    items: [
      {
        id: 111,
        product_id: 11,
        product_name: "Apple Watch SE 2 40mm GPS",
        variant_id: 111,
        sku: "AW-SE2-40-STR",
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Ánh Sao (Starlight)" },
          { name: "Kích thước", value: "40mm" },
        ],
        price: 6190000,
        quantity: 1,
        total: 6190000,
      },
      {
        id: 112,
        product_id: 12,
        product_name: "Tai nghe AirPods 4 Chống ồn chủ động (ANC)",
        variant_id: 121,
        sku: "AIRPODS4-ANC",
        image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Trắng" },
          { name: "Phiên bản", value: "ANC Chống ồn" },
        ],
        price: 4790000,
        quantity: 1,
        total: 4790000,
      },
      {
        id: 113,
        product_id: 13,
        product_name: "Củ sạc Apple 20W Type-C Chính Hãng",
        variant_id: 131,
        sku: "CHARGER-20W-USBC",
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Trắng" },
        ],
        price: 550000,
        quantity: 2,
        total: 1100000,
      },
    ],
  },
  {
    id: 9,
    order_code: "#TS-1032",
    created_at: "2026-11-01T14:00:00.000Z",
    updated_at: "2026-11-03T17:00:00.000Z",
    receiver_name: "Đặng Quang Huy",
    receiver_phone: "0903332211",
    receiver_email: "quanghuy.dang@gmail.com",
    address: "215 Lạch Tray, Quận Ngô Quyền, TP. Hải Phòng",
    subtotal: 29990000,
    shipping_fee: 0,
    discount_amount: 500000,
    total_amount: 29490000,
    payment_method: "vnpay",
    payment_status: "paid",
    order_status: "completed",
    note: "Đã giao hàng thành công, khách khen đóng gói cẩn thận.",
    items: [
      {
        id: 114,
        product_id: 14,
        product_name: "iPhone 16 Pro 128GB",
        variant_id: 141,
        sku: "IP16P-128-NAT",
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Titan Tự Nhiên" },
          { name: "Dung lượng", value: "128GB" },
        ],
        price: 28990000,
        quantity: 1,
        total: 28990000,
      },
      {
        id: 115,
        product_id: 15,
        product_name: "Kính cường lực Mipow Kingbull HD",
        variant_id: 151,
        sku: "GLASS-16P-MIPOW",
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Loại", value: "HD Chống nhìn trộm" },
        ],
        price: 1000000,
        quantity: 1,
        total: 1000000,
      },
    ],
  },
  {
    id: 10,
    order_code: "#TS-1033",
    created_at: "2026-11-01T09:30:00.000Z",
    updated_at: "2026-11-02T16:00:00.000Z",
    receiver_name: "Võ Thị Diệu Thảo",
    receiver_phone: "0938221100",
    receiver_email: "thaovothi@vietcombank.com.vn",
    address: "5B Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    subtotal: 27990000,
    shipping_fee: 0,
    discount_amount: 1000000,
    total_amount: 26990000,
    payment_method: "cod",
    payment_status: "paid",
    order_status: "completed",
    note: "Giao thành công, đã thu tiền mặt COD 26.990.000₫.",
    items: [
      {
        id: 116,
        product_id: 16,
        product_name: "MacBook Air 13 inch M3",
        variant_id: 161,
        sku: "MBA13-M3-16-256-MIDNIGHT",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Đêm Xanh Thẳm (Midnight)" },
          { name: "RAM", value: "16GB" },
          { name: "SSD", value: "256GB" },
        ],
        price: 27990000,
        quantity: 1,
        total: 27990000,
      },
    ],
  },
  {
    id: 11,
    order_code: "#TS-1034",
    created_at: "2026-10-31T20:10:00.000Z",
    updated_at: "2026-11-01T10:00:00.000Z",
    receiver_name: "Lý Văn Sang",
    receiver_phone: "0971239876",
    receiver_email: "sangly.arch@gmail.com",
    address: "450 Lê Văn Việt, Phường Tăng Nhơn Phú A, TP. Thủ Đức, TP. Hồ Chí Minh",
    subtotal: 34990000,
    shipping_fee: 0,
    discount_amount: 0,
    total_amount: 34990000,
    payment_method: "cod",
    payment_status: "failed",
    order_status: "cancelled",
    cancellation_reason: "Khách hàng đổi ý muốn đổi sang phiên bản 512GB",
    cancelled_by: "Admin",
    note: "Khách liên hệ qua hotline xin hủy đơn để đặt lại cấu hình cao hơn.",
    items: [
      {
        id: 117,
        product_id: 1,
        product_name: "iPhone 16 Pro Max",
        variant_id: 12,
        sku: "IP16PM-256-NAT",
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Titan Tự Nhiên" },
          { name: "Dung lượng", value: "256GB" },
        ],
        price: 34990000,
        quantity: 1,
        total: 34990000,
      },
    ],
  },
  {
    id: 12,
    order_code: "#TS-1035",
    created_at: "2026-10-31T15:00:00.000Z",
    updated_at: "2026-11-01T08:30:00.000Z",
    receiver_name: "Phan Quốc Bảo",
    receiver_phone: "0919988776",
    receiver_email: "baopq@fpt.com.vn",
    address: "Tổ hợp Công nghệ FPT, Khu CNC Hòa Lạc, Thạch Thất, Hà Nội",
    subtotal: 21990000,
    shipping_fee: 50000,
    discount_amount: 500000,
    total_amount: 21540000,
    payment_method: "vnpay",
    payment_status: "failed",
    order_status: "cancelled",
    cancellation_reason: "Quá thời hạn thanh toán cổng VNPAY (Giao dịch hết hạn)",
    cancelled_by: "Hệ thống tự động",
    note: "Cổng thanh toán phản hồi mã lỗi 99 (Giao dịch timeout). Đã tự động hoàn trả tồn kho.",
    items: [
      {
        id: 118,
        product_id: 17,
        product_name: "Apple Watch Ultra 2 GPS + Cellular 49mm",
        variant_id: 171,
        sku: "AW-ULTRA2-49-TITAN",
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Titan Tự Nhiên" },
          { name: "Dây đeo", value: "Dây Trail Loop Xanh/Đen" },
        ],
        price: 21990000,
        quantity: 1,
        total: 21990000,
      },
    ],
  },
  {
    id: 13,
    order_code: "#TS-1036",
    created_at: "2026-11-04T02:10:00.000Z",
    updated_at: "2026-11-04T02:10:00.000Z",
    receiver_name: "Châu Ngọc Ánh",
    receiver_phone: "0966443322",
    receiver_email: "anhchau.ngoc@gmail.com",
    address: "Chung cư Sunrise City, 23 Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7, TP. Hồ Chí Minh",
    subtotal: 13990000,
    shipping_fee: 0,
    discount_amount: 0,
    total_amount: 13990000,
    payment_method: "momo",
    payment_status: "paid",
    order_status: "pending",
    note: "Giao cho bảo vệ sảnh tòa North tháp W2.",
    items: [
      {
        id: 119,
        product_id: 18,
        product_name: "Tai nghe không dây Apple AirPods Max USB-C",
        variant_id: 181,
        sku: "AIRPODS-MAX-USBC-MIDNIGHT",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Nửa Đêm (Midnight)" },
          { name: "Cổng sạc", value: "USB-C" },
        ],
        price: 13990000,
        quantity: 1,
        total: 13990000,
      },
    ],
  },
  {
    id: 14,
    order_code: "#TS-1037",
    created_at: "2026-11-03T21:40:00.000Z",
    updated_at: "2026-11-04T04:15:00.000Z",
    receiver_name: "Trịnh Khắc Huy",
    receiver_phone: "0904556677",
    receiver_email: "huytk.dev@outlook.com",
    address: "24 Đại lộ Hòa Bình, Phường An Cư, Quận Ninh Kiều, Cần Thơ",
    subtotal: 31980000,
    shipping_fee: 0,
    discount_amount: 500000,
    total_amount: 31480000,
    payment_method: "vnpay",
    payment_status: "paid",
    order_status: "confirmed",
    note: "Kiểm tra kỹ cổng sạc máy trước khi bàn giao bên ship.",
    items: [
      {
        id: 120,
        product_id: 19,
        product_name: "iPad Pro 11 inch M4 Wi-Fi",
        variant_id: 191,
        sku: "IPADPRO-M4-11-256-BLK",
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Đen Không Gian" },
          { name: "Dung lượng", value: "256GB" },
        ],
        price: 28490000,
        quantity: 1,
        total: 28490000,
      },
      {
        id: 121,
        product_id: 7,
        product_name: "Bút cảm ứng Apple Pencil Pro",
        variant_id: 71,
        sku: "PENCIL-PRO-WHT",
        image: "https://images.unsplash.com/photo-1585792180666-f7547c6a28c5?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Trắng" },
        ],
        price: 3490000,
        quantity: 1,
        total: 3490000,
      },
    ],
  },
  {
    id: 15,
    order_code: "#TS-1038",
    created_at: "2026-11-02T08:00:00.000Z",
    updated_at: "2026-11-03T14:30:00.000Z",
    receiver_name: "Tạ Đình Phong",
    receiver_phone: "0932009988",
    receiver_email: "phong.td@gmail.com",
    address: "88 Lý Thường Kiệt, TP. Buôn Ma Thuột, Đắk Lắk",
    subtotal: 18490000,
    shipping_fee: 60000,
    discount_amount: 0,
    total_amount: 18550000,
    payment_method: "cod",
    payment_status: "pending",
    order_status: "shipping",
    note: "Hàng giá trị cao, bên ship liên hệ trước 30 phút.",
    items: [
      {
        id: 122,
        product_id: 20,
        product_name: "iPhone 15 128GB",
        variant_id: 201,
        sku: "IP15-128-BLU",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Xanh Dương Nhạt" },
          { name: "Dung lượng", value: "128GB" },
        ],
        price: 18490000,
        quantity: 1,
        total: 18490000,
      },
    ],
  },
  {
    id: 16,
    order_code: "#TS-1039",
    created_at: "2026-10-30T10:00:00.000Z",
    updated_at: "2026-11-01T15:00:00.000Z",
    receiver_name: "Mai Thanh Trúc",
    receiver_phone: "0982334455",
    receiver_email: "thanhtruc.mai@gmail.com",
    address: "15 Pasteur, Phường 4, TP. Đà Lạt, Lâm Đồng",
    subtotal: 39990000,
    shipping_fee: 0,
    discount_amount: 1000000,
    total_amount: 38990000,
    payment_method: "vnpay",
    payment_status: "paid",
    order_status: "completed",
    note: "Đã giao hàng trọn vẹn, khách đã đánh giá 5 sao trên hệ thống.",
    items: [
      {
        id: 123,
        product_id: 1,
        product_name: "iPhone 16 Pro Max",
        variant_id: 13,
        sku: "IP16PM-512-WHT",
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80",
        attributes: [
          { name: "Màu sắc", value: "Titan Trắng" },
          { name: "Dung lượng", value: "512GB" },
        ],
        price: 39990000,
        quantity: 1,
        total: 39990000,
      },
    ],
  },
];

/**
 * Đọc dữ liệu từ localStorage hoặc khởi tạo ban đầu
 */
function loadOrdersFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ORDERS));
      return [...INITIAL_MOCK_ORDERS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ORDERS));
      return [...INITIAL_MOCK_ORDERS];
    }
    return parsed;
  } catch (e) {
    console.error("Không thể đọc đơn hàng từ localStorage:", e);
    return [...INITIAL_MOCK_ORDERS];
  }
}

/**
 * Lưu danh sách đơn hàng vào localStorage
 */
function saveOrdersToStorage(orders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error("Không thể lưu đơn hàng vào localStorage:", e);
  }
}

/**
 * Mô phỏng latency mạng
 */
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockOrderService = {
  /**
   * Lấy danh sách đơn hàng có hỗ trợ lọc đa chiều, tìm kiếm, sắp xếp và phân trang
   */
  async getOrders({
    status = "all",
    search = "",
    paymentMethod = "all",
    paymentStatus = "all",
    dateRange = "all",
    sortBy = "newest",
    page = 1,
    limit = 8,
  } = {}) {
    await delay(200);
    const allOrders = loadOrdersFromStorage();

    // 1. Tính số lượng đơn theo từng trạng thái (để hiển thị badge trên tab)
    const countsByStatus = {
      all: allOrders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0,
    };

    allOrders.forEach((o) => {
      if (countsByStatus[o.order_status] !== undefined) {
        countsByStatus[o.order_status]++;
      }
    });

    // 2. Lọc theo trạng thái tab
    let filtered = [...allOrders];
    if (status && status !== "all") {
      filtered = filtered.filter((o) => o.order_status === status);
    }

    // 3. Tìm kiếm theo mã đơn, tên khách hoặc số điện thoại
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.order_code?.toLowerCase().includes(q) ||
          o.receiver_name?.toLowerCase().includes(q) ||
          o.receiver_phone?.includes(q) ||
          o.receiver_email?.toLowerCase().includes(q)
      );
    }

    // 4. Lọc phương thức thanh toán
    if (paymentMethod && paymentMethod !== "all") {
      filtered = filtered.filter((o) => o.payment_method === paymentMethod);
    }

    // 5. Lọc trạng thái thanh toán
    if (paymentStatus && paymentStatus !== "all") {
      filtered = filtered.filter((o) => o.payment_status === paymentStatus);
    }

    // 6. Lọc theo khoảng thời gian
    if (dateRange && dateRange !== "all") {
      const now = new Date();
      filtered = filtered.filter((o) => {
        const orderDate = new Date(o.created_at);
        const diffMs = now - orderDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateRange === "today") {
          return orderDate.toDateString() === now.toDateString();
        }
        if (dateRange === "7days") {
          return diffDays <= 7;
        }
        if (dateRange === "30days") {
          return diffDays <= 30;
        }
        return true;
      });
    }

    // 7. Sắp xếp
    filtered.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === "total_desc") {
        return b.total_amount - a.total_amount;
      }
      if (sortBy === "total_asc") {
        return a.total_amount - b.total_amount;
      }
      // Mặc định newest
      return new Date(b.created_at) - new Date(a.created_at);
    });

    // 8. Phân trang
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (safePage - 1) * limit;
    const paginatedOrders = filtered.slice(startIndex, startIndex + limit);

    return {
      orders: paginatedOrders,
      total,
      page: safePage,
      limit,
      totalPages,
      countsByStatus,
    };
  },

  /**
   * Lấy chi tiết đơn hàng theo ID
   */
  async getOrderById(id) {
    await delay(150);
    const orders = loadOrdersFromStorage();
    const order = orders.find((o) => o.id === Number(id));
    if (!order) {
      throw new Error(`Không tìm thấy đơn hàng #${id}`);
    }
    return { ...order };
  },

  /**
   * Cập nhật trạng thái đơn hàng (tuân thủ State Machine & hoàn trả tồn kho nếu hủy)
   */
  async updateOrderStatus(id, newStatus, cancellationReason = "") {
    await delay(250);
    const orders = loadOrdersFromStorage();
    const index = orders.findIndex((o) => o.id === Number(id));
    if (index === -1) {
      throw new Error(`Không tìm thấy đơn hàng #${id}`);
    }

    const currentOrder = orders[index];
    const updated = {
      ...currentOrder,
      order_status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "cancelled") {
      updated.cancellation_reason = cancellationReason || "Admin hủy đơn theo yêu cầu";
      updated.cancelled_by = "Admin";
      // Nếu hủy đơn và chưa thanh toán -> cập nhật failed
      if (updated.payment_status === "pending") {
        updated.payment_status = "failed";
      }
    } else if (newStatus === "completed" && updated.payment_method === "cod") {
      // Đơn COD khi giao thành công thì tự động đánh dấu đã thanh toán
      updated.payment_status = "paid";
    }

    orders[index] = updated;
    saveOrdersToStorage(orders);

    return { ...updated };
  },

  /**
   * Cập nhật trạng thái thanh toán (pending, paid, failed)
   */
  async updatePaymentStatus(id, newPaymentStatus) {
    await delay(200);
    const orders = loadOrdersFromStorage();
    const index = orders.findIndex((o) => o.id === Number(id));
    if (index === -1) {
      throw new Error(`Không tìm thấy đơn hàng #${id}`);
    }

    orders[index] = {
      ...orders[index],
      payment_status: newPaymentStatus,
      updated_at: new Date().toISOString(),
    };

    saveOrdersToStorage(orders);
    return { ...orders[index] };
  },

  /**
   * Thao tác hàng loạt: Cập nhật trạng thái cho danh sách các ID
   */
  async bulkUpdateStatus(orderIds = [], newStatus) {
    await delay(300);
    if (!orderIds.length) return { updatedCount: 0 };

    const orders = loadOrdersFromStorage();
    let updatedCount = 0;

    const newOrders = orders.map((o) => {
      if (orderIds.includes(o.id)) {
        updatedCount++;
        const nextOrder = {
          ...o,
          order_status: newStatus,
          updated_at: new Date().toISOString(),
        };
        if (newStatus === "completed" && nextOrder.payment_method === "cod") {
          nextOrder.payment_status = "paid";
        }
        return nextOrder;
      }
      return o;
    });

    saveOrdersToStorage(newOrders);
    return { updatedCount };
  },

  /**
   * Đặt lại toàn bộ dữ liệu mẫu ban đầu
   */
  async resetData() {
    await delay(200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ORDERS));
    return [...INITIAL_MOCK_ORDERS];
  },

  /**
   * Xuất danh sách đơn hàng sang định dạng CSV
   */
  exportOrdersCsv(orders = []) {
    const headers = [
      "Mã đơn hàng",
      "Ngày đặt",
      "Người nhận",
      "Số điện thoại",
      "Email",
      "Địa chỉ",
      "Tổng tiền (VNĐ)",
      "Phương thức thanh toán",
      "Trạng thái thanh toán",
      "Trạng thái đơn hàng",
      "Ghi chú",
    ];

    const rows = orders.map((o) => [
      `"${o.order_code || ""}"`,
      `"${new Date(o.created_at).toLocaleString("vi-VN")}"`,
      `"${(o.receiver_name || "").replace(/"/g, '""')}"`,
      `"${o.receiver_phone || ""}"`,
      `"${o.receiver_email || ""}"`,
      `"${(o.address || "").replace(/"/g, '""')}"`,
      o.total_amount || 0,
      `"${(o.payment_method || "").toUpperCase()}"`,
      `"${o.payment_status || ""}"`,
      `"${o.order_status || ""}"`,
      `"${(o.note || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `techstore-orders-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

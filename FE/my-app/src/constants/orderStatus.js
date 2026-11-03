export const ORDER_STATUS_MAP = {
  pending: {
    label: "Chờ xác nhận",
    labelEn: "Pending",
    color: "text-[#ca7600]",
    bg: "bg-[#fff7e6]",
    border: "border-[#ffd591]",
    dot: "bg-[#ca7600]",
  },
  confirmed: {
    label: "Đã xác nhận",
    labelEn: "Confirmed",
    color: "text-[#0066cc]",
    bg: "bg-[#e8f4ff]",
    border: "border-[#b3d8ff]",
    dot: "bg-[#0066cc]",
  },
  processing: {
    label: "Đang chuẩn bị",
    labelEn: "Processing",
    color: "text-[#5e5ce6]",
    bg: "bg-[#f2f1fd]",
    border: "border-[#d4d1f9]",
    dot: "bg-[#5e5ce6]",
  },
  shipping: {
    label: "Đang giao hàng",
    labelEn: "Shipping",
    color: "text-[#0284c7]",
    bg: "bg-[#e0f2fe]",
    border: "border-[#bae6fd]",
    dot: "bg-[#0284c7]",
  },
  completed: {
    label: "Đã giao thành công",
    labelEn: "Completed",
    color: "text-[#1d8a3d]",
    bg: "bg-[#e8f8ee]",
    border: "border-[#b7ebc6]",
    dot: "bg-[#1d8a3d]",
  },
  cancelled: {
    label: "Đã hủy đơn",
    labelEn: "Cancelled",
    color: "text-[#e30000]",
    bg: "bg-[#fff0f0]",
    border: "border-[#ffccc7]",
    dot: "bg-[#e30000]",
  },
};

export const PAYMENT_STATUS_MAP = {
  pending: {
    label: "Chờ thanh toán",
    color: "text-[#ca7600]",
    bg: "bg-[#fff7e6]",
    border: "border-[#ffd591]",
    dot: "bg-[#ca7600]",
  },
  paid: {
    label: "Đã thanh toán",
    color: "text-[#1d8a3d]",
    bg: "bg-[#e8f8ee]",
    border: "border-[#b7ebc6]",
    dot: "bg-[#1d8a3d]",
  },
  failed: {
    label: "Thất bại",
    color: "text-[#e30000]",
    bg: "bg-[#fff0f0]",
    border: "border-[#ffccc7]",
    dot: "bg-[#e30000]",
  },
};

export const PAYMENT_METHOD_MAP = {
  cod: {
    label: "COD (Thanh toán khi nhận)",
    shortLabel: "COD",
    color: "text-gray-700",
    bg: "bg-gray-100",
    border: "border-gray-200",
  },
  vnpay: {
    label: "VNPAY QR",
    shortLabel: "VNPAY",
    color: "text-[#005baa]",
    bg: "bg-[#e6f2ff]",
    border: "border-[#b5d7ff]",
  },
  momo: {
    label: "Ví MoMo",
    shortLabel: "MoMo",
    color: "text-[#a50064]",
    bg: "bg-[#fde7f3]",
    border: "border-[#fbcfe8]",
  },
};

export const ORDER_STATUS_FLOW = [
  "pending",
  "confirmed",
  "processing",
  "shipping",
  "completed",
];

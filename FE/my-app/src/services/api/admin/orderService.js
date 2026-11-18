import { httpRequest } from "@/services/api/httpClient";
import { resolveProductImageUrl } from "@/utils/imageHelper";

const normalize = (order) => ({ ...order, items: (order.items || []).map((item) => ({ ...item, image: resolveProductImageUrl(item.image) })) });
export const adminOrderService = {
  async getOrders(filters, signal) {
    const query = new URLSearchParams(Object.entries(filters).map(([key, value]) => [key, String(value)]));
    const result = await httpRequest(`/api/admin/orders?${query}`, { signal });
    return { ...result, data: result.data.map(normalize) };
  },
  async getOrder(id, signal) {
    const result = await httpRequest(`/api/admin/orders/${id}`, { signal });
    return normalize(result.data);
  },
  updateStatus(id, expectedStatus, targetStatus) {
    return httpRequest(`/api/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ expected_status: expectedStatus, target_status: targetStatus }) });
  },
  cancel(id, payload) {
    return httpRequest(`/api/admin/orders/${id}/cancel`, { method: "PUT", body: JSON.stringify(payload) });
  },
  async bulkStatus(orders, targetStatus) {
    const result = await httpRequest("/api/admin/orders/bulk-status", { method: "POST", body: JSON.stringify({ orders: orders.map((order) => ({ id: order.id, expected_status: order.order_status })), target_status: targetStatus }) });
    return result.data;
  },
};

// Chỉ xuất trang đang hiển thị; trung hòa công thức khi CSV được mở trong bảng tính.
export function exportOrdersCsv(orders) {
  const cell = (value) => {
    let text = String(value ?? "");
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const rows = [["Mã đơn", "Người nhận", "Điện thoại", "Email", "Trạng thái", "Thanh toán", "Tổng tiền"], ...orders.map((order) => [order.order_code, order.receiver_name, order.receiver_phone, order.receiver_email, order.order_status, order.payment_status, order.total_amount])];
  const url = URL.createObjectURL(new Blob(["\uFEFF", rows.map((row) => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "techstore-don-hang.csv";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

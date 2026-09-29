
import { useLocation, useNavigate, Link } from "react-router-dom";


const SF_DISPLAY = "SF Pro Display, system-ui, -apple-system, sans-serif";
const SF_TEXT = "SF Pro Text, system-ui, -apple-system, sans-serif";

function formatVndFromNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(Math.round(num)) + " ₫";
}

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  // Nếu không có order data (truy cập trực tiếp URL) → redirect về home
  if (!order) {
    navigate("/", { replace: true });
    return null;
  }

  const orderId = order.order_code || order.id || "—";
  const items = order.items || [];
  console.log("OrderSuccess - order:", order);
  const createdDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <main
      className="w-full min-h-screen bg-[#ffffff] text-[#1d1d1f]"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="max-w-175 mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* ─── Success animation / icon ─── */}
        <div className="flex justify-center mb-8 fade-in-up">
          <div className="w-20 h-20 rounded-full bg-[#f5f5f7] flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#0066cc]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* ─── Title ─── */}
        <div
          className="text-center mb-12 fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          <h1
            className="text-[34px] md:text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] mb-3"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Order Confirmed
          </h1>
          <p className="text-[17px] text-[#7a7a7a] font-normal">
            Thank you for your purchase! Your order has been placed
            successfully.
          </p>
        </div>

        {/* ─── Order Info Card ─── */}
        <div
          className="bg-[#f5f5f7] rounded-[18px] p-6 sm:p-8 mb-8 fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          {/* Order ID & Date */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-6 border-b border-[#e0e0e0] mb-6">
            <div>
              <p className="text-[12px] text-[#7a7a7a] font-normal tracking-[-0.12px] uppercase">
                Order Code
              </p>
              <p
                className="text-[21px] font-semibold tracking-[0.231px] text-[#1d1d1f]"
                style={{ fontFamily: SF_DISPLAY }}
              >
                #{orderId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[#7a7a7a] font-normal tracking-[-0.12px] uppercase">
                Date
              </p>
              <p className="text-[14px] font-semibold text-[#1d1d1f]">
                {createdDate}
              </p>
            </div>
          </div>

          {/* Items list */}
          <div className="space-y-4 mb-6">
            <p className="text-[14px] font-semibold text-[#1d1d1f] tracking-[-0.224px]">
              Items ({items.length})
            </p>
            {items.map((item) => {
              // Lấy thông tin variant & product từ response API
              // Cấu trúc: item.variant.product.name (đã include ở backend)
              const variant = item.variant || {};
              const product = variant.product || {};

              // Tên sản phẩm chính: lấy từ product.name
              const productName = product.name || "Unknown Product";

              // Thông số kỹ thuật (màu sắc / RAM / bộ nhớ)
              const variantLabel = [variant.color, variant.ram, variant.storage]
                .filter(Boolean)
                .join(" / ");

              return (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#1d1d1f] truncate">
                      {productName}
                    </p>
                    <p className="text-[12px] text-[#7a7a7a]">
                      {variantLabel && `${variantLabel} | `}Qty: {item.quantity}{" "}
                      × {formatVndFromNumber(item.price)}
                    </p>
                  </div>
                  <p className="text-[14px] font-semibold text-[#1d1d1f] shrink-0 ml-4">
                    {formatVndFromNumber(item.total)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="border-t border-[#e0e0e0] pt-4 space-y-3">
            <div className="flex justify-between text-[14px] text-[#1d1d1f]">
              <span>Subtotal</span>
              <span className="font-semibold">
                {formatVndFromNumber(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-[14px] text-[#1d1d1f]">
              <span>Shipping</span>
              <span className="font-semibold">
                {Number(order.shipping_fee) > 0
                  ? formatVndFromNumber(order.shipping_fee)
                  : "FREE"}
              </span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-[14px] text-[#1d1d1f]">
                <span>Discount</span>
                <span className="font-semibold text-[#0066cc]">
                  -{formatVndFromNumber(order.discount_amount)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-[#e0e0e0]">
              <span
                className="text-[21px] font-semibold tracking-[0.231px]"
                style={{ fontFamily: SF_DISPLAY }}
              >
                Total
              </span>
              <span
                className="text-[21px] font-semibold tracking-[0.231px]"
                style={{ fontFamily: SF_DISPLAY }}
              >
                {formatVndFromNumber(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Shipping Info Card ─── */}
        <div
          className="bg-[#f5f5f7] rounded-[18px] p-6 sm:p-8 mb-12 fade-in-up"
          style={{ animationDelay: "300ms" }}
        >
          <h2
            className="text-[17px] font-semibold tracking-[-0.374px] mb-4"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Shipping Details
          </h2>
          <div className="space-y-2 text-[14px] text-[#1d1d1f]">
            <p>
              <span className="text-[#7a7a7a]">Name: </span>
              {order.receiver_name || "—"}
            </p>
            <p>
              <span className="text-[#7a7a7a]">Phone: </span>
              {order.receiver_phone || "—"}
            </p>
            {order.receiver_email && (
              <p>
                <span className="text-[#7a7a7a]">Email: </span>
                {order.receiver_email}
              </p>
            )}
            <p>
              <span className="text-[#7a7a7a]">Address: </span>
              {order.address || "—"}
            </p>
            <p>
              <span className="text-[#7a7a7a]">Payment: </span>
              {order.payment_method === "cod"
                ? "Thanh toán khi nhận hàng (COD)"
                : order.payment_method === "card"
                  ? "Thẻ tín dụng"
                  : order.payment_method || "—"}
            </p>
            <p>
              <span className="text-[#7a7a7a]">Status: </span>
              <span className="text-[#0066cc] font-semibold capitalize">
                {order.order_status || "pending"}
              </span>
            </p>
          </div>
        </div>

        {/* ─── Action buttons ─── */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up"
          style={{ animationDelay: "400ms" }}
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-[#0066cc] text-[#ffffff] px-7 py-3.5 rounded-full text-[18px] font-normal hover:bg-[#0071e3] active:scale-95 transition-all"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-[#ffffff] text-[#0066cc] px-7 py-3.5 rounded-full text-[18px] font-normal border border-[#0066cc] hover:bg-[#f5f5f7] active:scale-95 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `,
        }}
      />
    </main>
  );
}

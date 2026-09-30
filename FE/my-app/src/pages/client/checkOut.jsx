import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Loading from "../../components/loading";

const SF_DISPLAY = "SF Pro Display, system-ui, -apple-system, sans-serif";
const SF_TEXT = "SF Pro Text, system-ui, -apple-system, sans-serif";

const API_BASE_URL = "http://localhost:3000/";

function formatVndFromNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(Math.round(num)) + " ₫";
}

export default function Check_out() {
  const navigate = useNavigate();
  const location = useLocation();

  // ─── Form state (phải khai báo trước mọi early return để tuân thủ Rules of Hooks) ───
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ─── Nhận dữ liệu giỏ hàng từ Router State ───
  const { cartItems, cartTotal } = location.state || {};
  const isInvalidCart = !cartItems || !cartTotal;

  useEffect(() => {
    if (isInvalidCart) {
      navigate("/cart", { replace: true });
    }
  }, [isInvalidCart, navigate]);

  if (isInvalidCart) {
    return null;
  }

  const total = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.quantity),
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // ─── Validate form ───
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (!street.trim()) {
      setError("Please enter your street address");
      return;
    }
    if (!city.trim()) {
      setError("Please enter your city");
      return;
    }

    setError(null);

    try {
      setIsSubmitting(true);

      const orderData = {
        receiver_name: `${firstName.trim()} ${lastName.trim()}`,
        receiver_phone: phone.trim(),
        receiver_email: email.trim() || undefined,
        address: `${street.trim()}, ${city.trim()}${postalCode.trim() ? `, ${postalCode.trim()}` : ""}`,
        payment_method: paymentMethod,
      };

      const res = await fetch(`${API_BASE_URL}api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.message || `HTTP ${res.status}`);
      }

      // ─── Thành công → cập nhật badge giỏ hàng ngay ───
      // Backend vừa xóa toàn bộ cart_items của user trong transaction.
      // Dispatch "cart:updated" để Header (badge) quét lại giỏ hàng → về 0.
      // Pattern này nhất quán với cart.jsx (đổi số lượng / xóa item).
      // (Lớp an toàn thứ 2: header cũng tự refetch khi pathname đổi sang
      // /order-success, nên badge luôn được đồng bộ dù event bị bỏ sót.)
      window.dispatchEvent(new Event("cart:updated"));

      // Thành công → navigate sang trang Order Success
      navigate("/order-success", {
        state: { order: payload.data },
        replace: true,
      });
    } catch (err) {
      setError(err?.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="w-full min-h-screen bg-[#ffffff] text-[#1d1d1f]"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="max-w-267 mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Breadcrumb */}
        <div className="mb-8 text-[14px] text-[#7a7a7a] flex items-center gap-2">
          <Link to="/cart" className="hover:text-[#0066cc] transition-colors">
            Bag
          </Link>
          <span>/</span>
          <span className="text-[#1d1d1f] font-semibold">Checkout</span>
        </div>

        <div className="text-center md:text-left mb-12 fade-in-up">
          <h1
            className="text-[34px] md:text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] mb-2"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Checkout
          </h1>
          <p className="text-[17px] text-[#7a7a7a] font-normal tracking-[-0.374px]">
            Please enter your details to complete your order.
          </p>
        </div>

        {/* ─── Error message ─── */}
        {error ? (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-[15px] rounded-[11px] fade-in-up">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
          {/* Left Column: Form */}
          <div
            className="flex-1 w-full fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Info */}
              <section>
                <h2
                  className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px] mb-6"
                  style={{ fontFamily: SF_DISPLAY }}
                >
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone number *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section>
                <h2
                  className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px] mb-6"
                  style={{ fontFamily: SF_DISPLAY }}
                >
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="First name *"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-1/2 bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last name *"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-1/2 bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Street address *"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="City *"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-1/2 bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Postal code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-1/2 bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section>
                <h2
                  className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px] mb-6"
                  style={{ fontFamily: SF_DISPLAY }}
                >
                  Payment Method
                </h2>

                <div className="space-y-4 mb-6">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-[#e0e0e0] rounded-lg hover:border-[#0071e3] transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="w-5 h-5 accent-[#0066cc]"
                    />
                    <span className="text-[17px] font-normal text-[#1d1d1f]">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-[#e0e0e0] rounded-lg hover:border-[#0071e3] transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="w-5 h-5 accent-[#0066cc]"
                    />
                    <span className="text-[17px] font-normal text-[#1d1d1f]">
                      Thanh toán trước (Thẻ tín dụng)
                    </span>
                  </label>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <input
                        type="text"
                        placeholder="Card number"
                        className="w-full bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
                      />
                    </div>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="Expiration date (MM/YY)"
                        className="w-1/2 bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Security code"
                        className="w-1/2 bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
                      />
                    </div>
                  </div>
                )}
              </section>

              <div className="pt-6 hidden lg:block">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0066cc] text-[#ffffff] px-7 py-3.5 rounded-full text-[18px] font-normal hover:bg-[#0071e3] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-3">
                      <Loading variant="inline" size="small" />
                      Placing...
                    </span>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div
            className="w-full lg:w-105 shrink-0 fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="bg-[#f5f5f7] rounded-[18px] p-6 lg:p-8 lg:sticky lg:top-24">
              <h2
                className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px] mb-6"
                style={{ fontFamily: SF_DISPLAY }}
              >
                Order Summary
              </h2>

              <div className="space-y-6 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 shrink-0 bg-[#ffffff] rounded-lg flex items-center justify-center p-2 border border-[#e0e0e0]">
                      <img
                        src={
                          item.image?.startsWith("http") || item.image?.startsWith("data:")
                            ? item.image
                            : item.image?.includes("uploads/")
                              ? `http://localhost:3000/${item.image.replace(/^\//, "")}`
                              : item.image
                                ? `http://localhost:3000/uploads/products/${item.image}`
                                : "/src/assets/product.jpg"
                        }
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-semibold tracking-[-0.224px] text-[#1d1d1f] truncate">
                        {item.name}
                      </h3>
                      <p className="text-[12px] text-[#7a7a7a]">
                        {item.tagline} | Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-[14px] font-semibold text-[#1d1d1f] shrink-0">
                      {formatVndFromNumber(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e0e0e0] pt-6 space-y-4">
                <div className="flex justify-between items-center text-[14px] text-[#1d1d1f]">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    {formatVndFromNumber(total)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[14px] text-[#1d1d1f]">
                  <span>Shipping</span>
                  <span className="font-semibold">FREE</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#e0e0e0]">
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
                    {formatVndFromNumber(total)}
                  </span>
                </div>
              </div>

              {/* ─── Mobile submit button ─── */}
              <div className="mt-8 lg:hidden">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-[#0066cc] text-[#ffffff] px-7 py-3.5 rounded-full text-[18px] font-normal hover:bg-[#0071e3] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-3">
                      <Loading variant="inline" size="small" />
                      Placing...
                    </span>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
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

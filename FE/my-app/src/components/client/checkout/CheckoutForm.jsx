import { SF_DISPLAY } from "@/constants/typography";
import PaymentMethodSelector from "./PaymentMethodSelector";

export default function CheckoutForm({
  formData,
  onUpdateField,
  onSubmit,
}) {
  return (
    <form id="checkout-form" onSubmit={onSubmit} className="space-y-8">
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
              value={formData.email}
              onChange={(e) => onUpdateField("email", e.target.value)}
              className="w-full bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
            />
          </div>
          <div>
            <input
              type="tel"
              placeholder="Phone number *"
              required
              value={formData.phone}
              onChange={(e) => onUpdateField("phone", e.target.value)}
              className="w-full bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First name *"
              required
              value={formData.firstName}
              onChange={(e) => onUpdateField("firstName", e.target.value)}
              className="w-full bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
            />
            <input
              type="text"
              placeholder="Last name *"
              required
              value={formData.lastName}
              onChange={(e) => onUpdateField("lastName", e.target.value)}
              className="w-full bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Street address (House number, Street name) *"
              required
              value={formData.street}
              onChange={(e) => onUpdateField("street", e.target.value)}
              className="w-full bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City / Province *"
              required
              value={formData.city}
              onChange={(e) => onUpdateField("city", e.target.value)}
              className="w-full bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
            />
            <input
              type="text"
              placeholder="Postal code (optional)"
              value={formData.postalCode}
              onChange={(e) => onUpdateField("postalCode", e.target.value)}
              className="w-full bg-[#ffffff] text-[#1d1d1f] text-[17px] rounded-lg border border-[#e0e0e0] px-4 py-3 focus:outline-none focus:border-[#0071e3] transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Payment Method */}
      <PaymentMethodSelector
        paymentMethod={formData.paymentMethod}
        onSelectMethod={(method) => onUpdateField("paymentMethod", method)}
      />
    </form>
  );
}

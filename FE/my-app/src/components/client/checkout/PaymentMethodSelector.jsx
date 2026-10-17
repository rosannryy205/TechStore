import { SF_DISPLAY } from "@/constants/typography";

export default function PaymentMethodSelector({ paymentMethod, onSelectMethod }) {
  const methods = [
    {
      id: "cod",
      title: "Cash on Delivery (COD)",
      desc: "Pay in cash when your order is delivered to your address.",
    },
    {
      id: "bank",
      title: "Bank Transfer",
      desc: "Transfer directly to our bank account. Details provided on completion.",
    },
  ];

  return (
    <section>
      <h2
        className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px] mb-6"
        style={{ fontFamily: SF_DISPLAY }}
      >
        Payment Method
      </h2>
      <div className="space-y-4">
        {methods.map((method) => {
          const isSelected = paymentMethod === method.id;
          return (
            <label
              key={method.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "border-[#0071e3] bg-[#f5f5f7]/50"
                  : "border-[#e0e0e0] hover:border-[#a0a0a0]"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={isSelected}
                onChange={() => onSelectMethod(method.id)}
                className="mt-1 w-4 h-4 text-[#0066cc] focus:ring-[#0071e3]"
              />
              <div className="flex-1">
                <div className="text-[17px] font-semibold text-[#1d1d1f]">
                  {method.title}
                </div>
                <div className="text-[14px] text-[#7a7a7a] mt-1">
                  {method.desc}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";
import { useCheckout } from "@/hooks/client/useCheckout";
import CheckoutForm from "@/components/client/checkout/CheckoutForm";
import CheckoutOrderSummary from "@/components/client/checkout/CheckoutOrderSummary";

export default function CheckOut() {
  const {
    cartItems,
    cartTotal,
    isInvalidCart,
    formData,
    updateField,
    isSubmitting,
    error,
    handleSubmit,
  } = useCheckout();

  if (isInvalidCart) {
    return null;
  }

  return (
    <main
      className="w-full min-h-screen bg-white text-[#1d1d1f]"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="max-w-267 mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Breadcrumb */}
        <div className="mb-8 text-[14px] text-[#7a7a7a] flex items-center gap-2">
          <Link to="/cart" className="hover:text-[#0066cc] transition-colors no-underline">
            Bag
          </Link>
          <span>/</span>
          <span className="text-[#1d1d1f] font-semibold">Checkout</span>
        </div>

        <div className="text-center md:text-left mb-12">
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

        {error ? (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-[15px] rounded-[11px]">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
          <div className="flex-1 w-full">
            <CheckoutForm
              formData={formData}
              onUpdateField={updateField}
              onSubmit={handleSubmit}
            />
          </div>

          <CheckoutOrderSummary
            cartItems={cartItems}
            cartTotal={cartTotal}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </main>
  );
}

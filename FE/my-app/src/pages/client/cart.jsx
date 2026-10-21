import Loading from "@/components/loading";
import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";
import { formatVnd } from "@/utils/formatCurrency";
import { useCart } from "@/hooks/client/useCart";
import CartItemList from "@/components/client/cart/cartItemList";
import CartSummary from "@/components/client/cart/cartSummary";
import EmptyCart from "@/components/client/cart/emptyCart";

export default function Cart() {
  const {
    cartItems,
    cartTotal,
    loadingCart,
    authLoading,
    error,
    updatingItemId,
    hasMounted,
    handleChangeQuantity,
    handleRemoveItem,
    handleCheckout,
  } = useCart();

  return (
    <main
      className="w-full min-h-screen bg-white text-[#1d1d1f]"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="max-w-245 mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center md:text-left mb-12">
          <h1
            className="text-[34px] md:text-[40px] font-semibold leading-[1.1] tracking-[-0.374px] mb-6"
            style={{ fontFamily: SF_DISPLAY }}
          >
            {authLoading
              ? "Loading..."
              : cartItems.length > 0
                ? `Your Bag total is ${formatVnd(cartTotal)}.`
                : "Your Bag is empty."}
          </h1>
        </div>

        {error ? (
          <div className="text-center py-6 bg-red-50 text-red-700 mb-6">{error}</div>
        ) : null}

        {loadingCart ? (
          <div className="relative min-h-50">
            <Loading
              variant="overlay"
              size="medium"
              text="Loading cart..."
              shouldShow={true}
              minDurationMs={1000}
              maxDurationMs={3000}
            />
          </div>
        ) : cartItems.length > 0 ? (
          <>
            <CartItemList
              items={cartItems}
              hasMounted={hasMounted}
              updatingItemId={updatingItemId}
              onChangeQuantity={handleChangeQuantity}
              onRemoveItem={handleRemoveItem}
            />
            <CartSummary
              cartTotal={cartTotal}
              onCheckout={handleCheckout}
              isDisabled={cartItems.length === 0}
            />
          </>
        ) : (
          <EmptyCart />
        )}
      </div>
    </main>
  );
}

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/authContext";
import { SF_TEXT } from "@/constants/typography";
import OrderSuccessBanner from "@/components/client/orderSuccess/orderSuccessBanner";
import OrderItemsSummary from "@/components/client/orderSuccess/orderItemsSummary";
import OrderCustomerInfo from "@/components/client/orderSuccess/orderCustomerInfo";

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};
  const { user, loading: isAuthLoading } = useAuth();
  const canViewOrder = Boolean(user && order && order.user_id === user.id);

  useEffect(() => {
    if (!isAuthLoading && !canViewOrder) {
      navigate("/", { replace: true });
    }
  }, [isAuthLoading, canViewOrder, navigate]);

  if (!canViewOrder) {
    return null;
  }

  const orderId = order.order_code || order.id || "—";
  const items = order.items || [];

  return (
    <main
      className="w-full min-h-screen bg-white text-[#1d1d1f]"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="max-w-175 mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <OrderSuccessBanner
          orderId={orderId}
          createdDate={order.created_at}
        />
        <OrderItemsSummary
          items={items}
          totalAmount={order.total_amount}
          subtotal={order.subtotal}
          shippingFee={order.shipping_fee}
        />
        <OrderCustomerInfo order={order} />
      </div>
    </main>
  );
}

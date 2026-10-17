import { useNavigate } from "react-router-dom";
import Loading from "@/components/loading";
import { SF_DISPLAY } from "@/constants/typography";
import ProfileOrderItem from "./ProfileOrderItem";

export default function ProfileOrdersTab({
  orders,
  loadingOrders,
  ordersError,
  cancellingId,
  onCancelOrder,
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] p-6 sm:p-8">
      <h2
        className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px] mb-6"
        style={{ fontFamily: SF_DISPLAY }}
      >
        Order History
      </h2>

      {ordersError && (
        <div className="mb-6 p-4 bg-[#fff0f0] text-[#e30000] rounded-[11px] text-[14px]">
          {ordersError}
        </div>
      )}

      {loadingOrders ? (
        <div className="flex items-center justify-center py-12">
          <Loading variant="inline" size="medium" text="Loading orders…" />
        </div>
      ) : orders.length > 0 ? (
        <div className="flex flex-col gap-5">
          {orders.map((order) => (
            <ProfileOrderItem
              key={order.id}
              order={order}
              cancellingId={cancellingId}
              onCancel={onCancelOrder}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[#7a7a7a] text-[17px] mb-4">
            You haven't placed any orders yet.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-[#0066cc] text-[#ffffff] px-5.5 py-2.75 rounded-full text-[17px] font-normal hover:bg-[#0071e3] active:scale-95 transition-all cursor-pointer"
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
}

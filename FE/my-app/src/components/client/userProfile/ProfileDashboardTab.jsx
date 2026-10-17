import Loading from "@/components/loading";
import { SF_DISPLAY } from "@/constants/typography";
import ProfileOrderItem from "./ProfileOrderItem";

export default function ProfileDashboardTab({
  user,
  orders,
  loadingOrders,
  cancellingId,
  onCancelOrder,
  onNavigateTab,
}) {
  return (
    <>
      {/* Personal Info Card */}
      <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] p-6 sm:p-8 hover:shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow">
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px]"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Personal Info
          </h2>
          <button
            onClick={() => onNavigateTab("settings")}
            className="text-[#0066cc] text-[17px] hover:underline active:opacity-70 transition-opacity cursor-pointer"
          >
            Edit
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[#f0f0f0]">
            <span className="text-[#7a7a7a] text-[17px] w-32 mb-1 sm:mb-0">
              Name
            </span>
            <span className="text-[17px] font-medium">
              {user?.name || "Not set"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[#f0f0f0]">
            <span className="text-[#7a7a7a] text-[17px] w-32 mb-1 sm:mb-0">
              Email
            </span>
            <span className="text-[17px] font-medium">{user?.email || "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[#f0f0f0]">
            <span className="text-[#7a7a7a] text-[17px] w-32 mb-1 sm:mb-0">
              Phone
            </span>
            <span className="text-[17px] font-medium">
              {user?.phone || "Not set"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center py-4">
            <span className="text-[#7a7a7a] text-[17px] w-32 mb-1 sm:mb-0">
              Address
            </span>
            <span className="text-[17px] font-medium">
              {user?.address || "Not set"}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders Preview Card */}
      <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] p-6 sm:p-8 hover:shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow">
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px]"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Recent Orders
          </h2>
          <button
            onClick={() => onNavigateTab("orders")}
            className="text-[#0066cc] text-[17px] hover:underline active:opacity-70 transition-opacity cursor-pointer"
          >
            View all
          </button>
        </div>

        {loadingOrders ? (
          <div className="flex items-center justify-center py-8">
            <Loading variant="inline" size="small" text="Loading orders…" />
          </div>
        ) : orders.length > 0 ? (
          orders
            .slice(0, 3)
            .map((order) => (
              <ProfileOrderItem
                key={order.id}
                order={order}
                compact
                cancellingId={cancellingId}
                onCancel={onCancelOrder}
              />
            ))
        ) : (
          <p className="text-[#7a7a7a] text-[17px] text-center py-8">
            No orders yet.
          </p>
        )}
      </div>
    </>
  );
}

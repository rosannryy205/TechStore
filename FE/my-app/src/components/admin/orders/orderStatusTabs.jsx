import { ORDER_STATUS_MAP } from "@/constants/orderStatus";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: ORDER_STATUS_MAP.pending.label },
  { key: "confirmed", label: ORDER_STATUS_MAP.confirmed.label },
  { key: "processing", label: ORDER_STATUS_MAP.processing.label },
  { key: "shipping", label: ORDER_STATUS_MAP.shipping.label },
  { key: "completed", label: ORDER_STATUS_MAP.completed.label },
  { key: "cancelled", label: ORDER_STATUS_MAP.cancelled.label },
];

export default function OrderStatusTabs({
  activeStatus = "all",
  countsByStatus = {},
  onTabChange,
}) {
  return (
    <div className="border-b border-gray-200/80 mb-6">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {TABS.map((tab) => {
          const isActive = activeStatus === tab.key;
          const count = countsByStatus[tab.key] ?? 0;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={[
                "group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-[#1d1d1f] text-white shadow-sm"
                  : "text-gray-600 hover:text-[#1d1d1f] hover:bg-gray-100/70",
              ].join(" ")}
            >
              <span>{tab.label}</span>
              <span
                className={[
                  "px-2 py-0.5 rounded-full text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-200/70 text-gray-700 group-hover:bg-gray-300/70",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

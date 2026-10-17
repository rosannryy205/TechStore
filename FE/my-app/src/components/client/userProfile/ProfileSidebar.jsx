export default function ProfileSidebar({ activeTab, onTabChange, onLogout }) {
  return (
    <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] p-4 flex flex-col gap-1">
      <button
        onClick={() => onTabChange("dashboard")}
        className={`text-left px-4 py-2.75 rounded-[11px] text-[17px] transition-all cursor-pointer ${
          activeTab === "dashboard"
            ? "bg-[#f5f5f7] font-semibold text-[#1d1d1f]"
            : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
        }`}
      >
        Account Summary
      </button>
      <button
        onClick={() => onTabChange("orders")}
        className={`text-left px-4 py-2.75 rounded-[11px] text-[17px] transition-all cursor-pointer ${
          activeTab === "orders"
            ? "bg-[#f5f5f7] font-semibold text-[#1d1d1f]"
            : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
        }`}
      >
        Order History
      </button>
      <button
        onClick={() => onTabChange("settings")}
        className={`text-left px-4 py-2.75 rounded-[11px] text-[17px] transition-all cursor-pointer ${
          activeTab === "settings"
            ? "bg-[#f5f5f7] font-semibold text-[#1d1d1f]"
            : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
        }`}
      >
        Settings
      </button>

      <div className="h-px bg-[#f0f0f0] my-2 mx-2"></div>

      <button
        onClick={onLogout}
        className="text-left px-4 py-2.75 rounded-[11px] text-[17px] text-[#e30000] hover:bg-[#fff0f0] transition-all active:scale-95 origin-left cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  );
}

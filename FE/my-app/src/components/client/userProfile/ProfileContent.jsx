import ProfileDashboardTab from "./ProfileDashboardTab";
import ProfileOrdersTab from "./ProfileOrdersTab";
import ProfileSettingsTab from "./ProfileSettingsTab";

export default function ProfileContent({
  activeTab,
  user,
  orders,
  loadingOrders,
  ordersError,
  cancellingId,
  onCancelOrder,
  onNavigateTab,
  formName,
  setFormName,
  formPhone,
  setFormPhone,
  formAddress,
  setFormAddress,
  saving,
  saveMessage,
  onSaveProfile,
}) {
  return (
    <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-6 lg:gap-8">
      {activeTab === "dashboard" && (
        <ProfileDashboardTab
          user={user}
          orders={orders}
          loadingOrders={loadingOrders}
          cancellingId={cancellingId}
          onCancelOrder={onCancelOrder}
          onNavigateTab={onNavigateTab}
        />
      )}

      {activeTab === "orders" && (
        <ProfileOrdersTab
          orders={orders}
          loadingOrders={loadingOrders}
          ordersError={ordersError}
          cancellingId={cancellingId}
          onCancelOrder={onCancelOrder}
        />
      )}

      {activeTab === "settings" && (
        <ProfileSettingsTab
          user={user}
          formName={formName}
          setFormName={setFormName}
          formPhone={formPhone}
          setFormPhone={setFormPhone}
          formAddress={formAddress}
          setFormAddress={setFormAddress}
          saving={saving}
          saveMessage={saveMessage}
          onSaveProfile={onSaveProfile}
        />
      )}
    </div>
  );
}

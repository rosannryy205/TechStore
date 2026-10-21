import ConfirmDialog from "@/components/confirmDialog";
import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";
import { useUserProfile } from "@/hooks/client/useUserProfile";
import ProfileSidebar from "@/components/client/userProfile/profileSidebar";
import ProfileContent from "@/components/client/userProfile/profileContent";

export default function UserProfile() {
  const p = useUserProfile();

  if (p.authLoading) {
    return <main className="w-full min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center" style={{ fontFamily: SF_TEXT }}>Loading…</main>;
  }

  const firstName = (p.user?.name || "").split(" ")[0] || "User";

  return (
    <main
      className="w-full min-h-screen bg-[#f5f5f7] text-[#1d1d1f]"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="max-w-267 mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="mb-12">
          <h1
            className="text-[34px] md:text-[40px] font-semibold leading-[1.1] tracking-[-0.374px]"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Hi, {firstName}.
          </h1>
          <p className="mt-2 text-[17px] text-[#7a7a7a] font-normal">
            Welcome to your account dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          <div className="md:col-span-4 lg:col-span-3">
            <ProfileSidebar
              activeTab={p.activeTab}
              onTabChange={p.handleTabChange}
              onLogout={p.handleLogout}
            />
          </div>

          <ProfileContent
            activeTab={p.activeTab}
            user={p.user}
            orders={p.orders}
            loadingOrders={p.loadingOrders}
            ordersError={p.ordersError}
            cancellingId={p.cancellingId}
            onCancelOrder={p.handleCancelOrder}
            onNavigateTab={p.handleTabChange}
            formName={p.formName}
            setFormName={p.setFormName}
            formPhone={p.formPhone}
            setFormPhone={p.setFormPhone}
            formAddress={p.formAddress}
            setFormAddress={p.setFormAddress}
            saving={p.saving}
            saveMessage={p.saveMessage}
            onSaveProfile={p.handleSaveProfile}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={p.confirmOpen}
        title="Cancel This Order?"
        message="This action cannot be undone. Your order will be cancelled and you will need to place a new one."
        confirmLabel="Cancel Order"
        cancelLabel="Go Back"
        variant="danger"
        loading={false}
        onConfirm={p.executeCancelOrder}
        onCancel={p.closeConfirmDialog}
      />
    </main>
  );
}

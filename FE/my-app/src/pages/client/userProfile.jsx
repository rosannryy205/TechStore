import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import Loading from "../../components/loading";
import ConfirmDialog from "../../components/ConfirmDialog";

const SF_DISPLAY = "SF Pro Display, system-ui, -apple-system, sans-serif";
const SF_TEXT = "SF Pro Text, system-ui, -apple-system, sans-serif";
const API_BASE_URL = "http://localhost:3000";

/**
 * Format số tiền VND
 */
function formatVnd(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(Math.round(num)) + " ₫";
}

/**
 * Format ngày tháng
 */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Map trạng thái đơn hàng sang text tiếng Việt + màu sắc
 */
const ORDER_STATUS_MAP = {
  pending: { label: "Pending", color: "text-[#ca7600]", bg: "bg-[#fff7e6]" },
  confirmed: {
    label: "Confirmed",
    color: "text-[#0066cc]",
    bg: "bg-[#e8f4ff]",
  },
  processing: {
    label: "Processing",
    color: "text-[#0066cc]",
    bg: "bg-[#e8f4ff]",
  },
  shipping: { label: "Shipping", color: "text-[#0066cc]", bg: "bg-[#e8f4ff]" },
  completed: {
    label: "Completed",
    color: "text-[#1d8a3d]",
    bg: "bg-[#e8f8ee]",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-[#e30000]",
    bg: "bg-[#fff0f0]",
  },
};

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    logout,
    refreshMe,
  } = useAuth();

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // Cancel state
  const [cancellingId, setCancellingId] = useState(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState(null);

  // Profile form state (Settings tab)
  const [formName, setFormName] = useState(user?.name || "");
  const [formPhone, setFormPhone] = useState(user?.phone || "");
  const [formAddress, setFormAddress] = useState(user?.address || "");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null); // { type: 'success' | 'error', text }

  // ─── Adjust form state when user data loads (during render) ───
  const [prevUser, setPrevUser] = useState(user);
  if (prevUser !== user) {
    setPrevUser(user);
    setFormName(user?.name || "");
    setFormPhone(user?.phone || "");
    setFormAddress(user?.address || "");
  }

  // ─── Redirect if not authenticated ───
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // ─── Fetch orders ───
  const fetchOrders = useCallback(async () => {
    if (authLoading || !isAuthenticated) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        method: "GET",
        credentials: "include",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || `HTTP ${res.status}`);
      setOrders(payload?.data || []);
    } catch (e) {
      setOrdersError(e?.message || "Failed to load orders.");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [authLoading, isAuthenticated]);

  // ─── Fetch orders on mount (setState in promise callbacks only) ───
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let ignore = false;
    fetch(`${API_BASE_URL}/api/orders/my-orders`, {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.message || `HTTP ${res.status}`);
        if (!ignore) setOrders(payload?.data || []);
      })
      .catch((e) => {
        if (!ignore) setOrdersError(e?.message || "Failed to load orders.");
      })
      .finally(() => {
        if (!ignore) setLoadingOrders(false);
      });
    return () => {
      ignore = true;
    };
  }, [authLoading, isAuthenticated]);

  // ─── Tab change handler (fetch orders outside effect) ───
  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    if (nextTab === "orders" || nextTab === "dashboard") {
      setLoadingOrders(true);
      setOrdersError(null);
      fetchOrders();
    }
  };

  // ─── Open confirm dialog ───
  const handleCancelOrder = useCallback((orderId) => {
    setPendingCancelId(orderId);
    setConfirmOpen(true);
  }, []);

  // ─── Actually cancel after user confirms ───
  const executeCancelOrder = useCallback(async () => {
    if (!pendingCancelId) return;
    try {
      setCancellingId(pendingCancelId);
      setConfirmOpen(false);
      setOrdersError(null);
      const res = await fetch(
        `${API_BASE_URL}/api/orders/${pendingCancelId}/cancel`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || `HTTP ${res.status}`);
      // Refresh orders list
      await fetchOrders();
    } catch (e) {
      setOrdersError(e?.message || "Failed to cancel order.");
    } finally {
      setCancellingId(null);
      setPendingCancelId(null);
    }
  }, [pendingCancelId, fetchOrders]);

  // ─── Close confirm dialog without action ───
  const closeConfirmDialog = useCallback(() => {
    setConfirmOpen(false);
    setPendingCancelId(null);
  }, []);

  // ─── Save profile handler ───
  const handleSaveProfile = useCallback(
    async (e) => {
      e.preventDefault();
      setSaveMessage(null);
      try {
        setSaving(true);
        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: formName,
            phone: formPhone,
            address: formAddress,
          }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.message || `HTTP ${res.status}`);
        // Refresh auth context to get updated user
        await refreshMe();
        setSaveMessage({
          type: "success",
          text: "Profile updated successfully.",
        });
        setTimeout(() => setSaveMessage(null), 4000);
      } catch (e) {
        setSaveMessage({
          type: "error",
          text: e?.message || "Failed to update profile.",
        });
      } finally {
        setSaving(false);
      }
    },
    [formName, formPhone, formAddress, refreshMe],
  );

  if (authLoading) {
    return (
      <main
        className="w-full min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center"
        style={{ fontFamily: SF_TEXT }}
      >
        Loading…
      </main>
    );
  }

  return (
    <main
      className="w-full min-h-screen bg-[#f5f5f7] text-[#1d1d1f]"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="max-w-267 mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* ─── Header ─── */}
        <div className="mb-12 animate-fade-in-up">
          <h1
            className="text-[34px] md:text-[40px] font-semibold leading-[1.1] tracking-[-0.374px]"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Hi, {(user?.name || "").split(" ")[0] || "User"}.
          </h1>
          <p className="mt-2 text-[17px] text-[#7a7a7a] font-normal">
            Welcome to your account dashboard.
          </p>
        </div>

        {/* ─── Dashboard Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {/* ─── Sidebar Navigation ─── */}
          <div
            className="md:col-span-4 lg:col-span-3 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] p-4 flex flex-col gap-1">
              <button
                onClick={() => handleTabChange("dashboard")}
                className={`text-left px-4 py-2.75 rounded-[11px] text-[17px] transition-all ${
                  activeTab === "dashboard"
                    ? "bg-[#f5f5f7] font-semibold text-[#1d1d1f]"
                    : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                }`}
              >
                Account Summary
              </button>
              <button
                onClick={() => handleTabChange("orders")}
                className={`text-left px-4 py-2.75 rounded-[11px] text-[17px] transition-all ${
                  activeTab === "orders"
                    ? "bg-[#f5f5f7] font-semibold text-[#1d1d1f]"
                    : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                }`}
              >
                Order History
              </button>
              <button
                onClick={() => handleTabChange("settings")}
                className={`text-left px-4 py-2.75 rounded-[11px] text-[17px] transition-all ${
                  activeTab === "settings"
                    ? "bg-[#f5f5f7] font-semibold text-[#1d1d1f]"
                    : "text-[#1d1d1f] hover:bg-[#f5f5f7]"
                }`}
              >
                Settings
              </button>

              <div className="h-px bg-[#f0f0f0] my-2 mx-2"></div>

              <button
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
                className="text-left px-4 py-2.75 rounded-[11px] text-[17px] text-[#e30000] hover:bg-[#fff0f0] transition-all active:scale-95 origin-left"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* ─── Main Content ─── */}
          <div
            className="md:col-span-8 lg:col-span-9 flex flex-col gap-6 lg:gap-8 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            {/* ═══ DASHBOARD TAB ═══ */}
            {activeTab === "dashboard" && (
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
                      onClick={() => handleTabChange("settings")}
                      className="text-[#0066cc] text-[17px] hover:underline active:opacity-70 transition-opacity"
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
                        {user?.name || ""}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[#f0f0f0]">
                      <span className="text-[#7a7a7a] text-[17px] w-32 mb-1 sm:mb-0">
                        Email
                      </span>
                      <span className="text-[17px] font-medium">
                        {user?.email || ""}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[#f0f0f0]">
                      <span className="text-[#7a7a7a] text-[17px] w-32 mb-1 sm:mb-0">
                        Phone
                      </span>
                      <span className="text-[17px] font-medium">
                        {user?.phone || ""}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center py-4">
                      <span className="text-[#7a7a7a] text-[17px] w-32 mb-1 sm:mb-0">
                        Address
                      </span>
                      <span className="text-[17px] font-medium">
                        {user?.address || ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Card */}
                <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] p-6 sm:p-8 hover:shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-shadow">
                  <div className="flex justify-between items-center mb-6">
                    <h2
                      className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px]"
                      style={{ fontFamily: SF_DISPLAY }}
                    >
                      Recent Orders
                    </h2>
                    <button
                      onClick={() => handleTabChange("orders")}
                      className="text-[#0066cc] text-[17px] hover:underline active:opacity-70 transition-opacity"
                    >
                      View All
                    </button>
                  </div>
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-8">
                      <Loading variant="inline" size="small" />
                    </div>
                  ) : orders.length > 0 ? (
                    orders
                      .slice(0, 3)
                      .map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          compact
                          cancellingId={cancellingId}
                          onCancel={handleCancelOrder}
                        />
                      ))
                  ) : (
                    <p className="text-[#7a7a7a] text-[17px] text-center py-8">
                      No orders yet.
                    </p>
                  )}
                </div>
              </>
            )}

            {/* ═══ ORDERS TAB ═══ */}
            {activeTab === "orders" && (
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
                    <Loading
                      variant="inline"
                      size="medium"
                      text="Loading orders…"
                    />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="flex flex-col gap-5">
                    {orders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        cancellingId={cancellingId}
                        onCancel={handleCancelOrder}
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
                      className="bg-[#0066cc] text-[#ffffff] px-5.5 py-2.75 rounded-full text-[17px] font-normal hover:bg-[#0071e3] active:scale-95 transition-all"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ═══ SETTINGS TAB ═══ */}
            {activeTab === "settings" && (
              <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] p-6 sm:p-8">
                <h2
                  className="text-[24px] font-semibold leading-[1.14] tracking-[0.196px] mb-8"
                  style={{ fontFamily: SF_DISPLAY }}
                >
                  Account Settings
                </h2>

                {saveMessage && (
                  <div
                    className={`mb-6 p-4 rounded-[11px] text-[14px] ${
                      saveMessage.type === "success"
                        ? "bg-[#e8f8ee] text-[#1d8a3d]"
                        : "bg-[#fff0f0] text-[#e30000]"
                    }`}
                  >
                    {saveMessage.text}
                  </div>
                )}

                <form
                  onSubmit={handleSaveProfile}
                  className="space-y-6 max-w-lg"
                >
                  {/* Name */}
                  <div>
                    <label className="block text-[14px] font-semibold tracking-[-0.224px] text-[#1d1d1f] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-[#f5f5f7] border border-[#e0e0e0] text-[#1d1d1f] text-[17px] rounded-[11px] px-4 py-2.75 focus:outline-none focus:bg-[#ffffff] focus:ring-4 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all"
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Email — READ ONLY */}
                  <div>
                    <label className="block text-[14px] font-semibold tracking-[-0.224px] text-[#1d1d1f] mb-2">
                      Email Address
                    </label>
                    <div className="w-full bg-[#f5f5f7] border border-[#e0e0e0] text-[#7a7a7a] text-[17px] rounded-[11px] px-4 py-2.75 cursor-not-allowed">
                      {user?.email || ""}
                    </div>
                    <p className="text-[12px] text-[#7a7a7a] mt-1">
                      Email cannot be changed.
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[14px] font-semibold tracking-[-0.224px] text-[#1d1d1f] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-[#f5f5f7] border border-[#e0e0e0] text-[#1d1d1f] text-[17px] rounded-[11px] px-4 py-2.75 focus:outline-none focus:bg-[#ffffff] focus:ring-4 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all"
                      placeholder="Your phone number"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-[14px] font-semibold tracking-[-0.224px] text-[#1d1d1f] mb-2">
                      Shipping Address
                    </label>
                    <textarea
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      rows={3}
                      className="w-full bg-[#f5f5f7] border border-[#e0e0e0] text-[#1d1d1f] text-[17px] rounded-[11px] px-4 py-2.75 focus:outline-none focus:bg-[#ffffff] focus:ring-4 focus:ring-[#0071e3]/20 focus:border-[#0071e3] transition-all resize-y"
                      placeholder="Your shipping address"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="pt-4 flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#0066cc] text-[#ffffff] px-5.5 py-2.75 rounded-full text-[17px] font-normal hover:bg-[#0071e3] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loading variant="inline" size="small" />
                          Saving…
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Cancel Order Confirm Dialog ─── */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Cancel This Order?"
        message="This action cannot be undone. Your order will be cancelled and you will need to place a new one."
        confirmLabel="Cancel Order"
        cancelLabel="Go Back"
        variant="danger"
        loading={false}
        onConfirm={executeCancelOrder}
        onCancel={closeConfirmDialog}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `,
        }}
      />
    </main>
  );
}

/* ─── Order Card Sub-component ─── */
function OrderCard({ order, compact, cancellingId, onCancel }) {
  const statusInfo = ORDER_STATUS_MAP[order.order_status] || {
    label: order.order_status,
    color: "text-[#7a7a7a]",
    bg: "bg-[#f5f5f7]",
  };

  // Lấy tên sản phẩm đầu tiên
  const firstItem = order.items?.[0];
  const itemName = firstItem?.variant?.product?.name || "Product";
  const itemVariant = [
    firstItem?.variant?.color,
    firstItem?.variant?.ram,
    firstItem?.variant?.storage,
  ]
    .filter(Boolean)
    .join(" • ");
  const itemCount = order.items?.length || 0;

  if (compact) {
    return (
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-5 bg-[#f5f5f7] rounded-[11px] border border-transparent hover:border-[#e0e0e0] transition-colors mb-4 last:mb-0">
        <div className="flex-1 min-w-0">
          <div className="text-[17px] font-semibold mb-1 tracking-[-0.374px] truncate">
            {itemName}
            {itemCount > 1 ? ` +${itemCount - 1} more` : ""}
          </div>
          {itemVariant && (
            <div className="text-[14px] text-[#7a7a7a] mb-1">{itemVariant}</div>
          )}
          <div className="text-[14px] text-[#7a7a7a] tracking-[-0.224px]">
            Order {order.order_code || `#${order.id}`} •{" "}
            {formatDate(order.created_at)}
          </div>
        </div>
        <div className="flex flex-col sm:items-end gap-1">
          <span className="text-[17px] font-semibold tracking-[-0.374px]">
            {formatVnd(order.total_amount)}
          </span>
          <span
            className={`inline-block text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5 sm:p-6 border border-[#e0e0e0] rounded-[18px] hover:border-[#0066cc]/30 hover:shadow-[0_4px_12px_rgba(0,102,204,0.06)] transition-all">
      {/* Order header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <span className="text-[15px] font-semibold text-[#1d1d1f]">
            Order {order.order_code || `#${order.id}`}
          </span>
          <span className="text-[14px] text-[#7a7a7a] ml-2">
            {formatDate(order.created_at)}
          </span>
        </div>
        <span
          className={`inline-block text-[12px] font-semibold px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color} self-start sm:self-auto`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-3">
        {order.items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-b-0"
          >
            <div className="flex-1 min-w-0">
              <span className="text-[15px] font-medium text-[#1d1d1f]">
                {item.variant?.product?.name || "Product"}
              </span>
              {item.variant?.color && (
                <span className="text-[13px] text-[#7a7a7a] ml-1">
                  (
                  {[item.variant.color, item.variant.ram, item.variant.storage]
                    .filter(Boolean)
                    .join(" • ")}
                  )
                </span>
              )}
            </div>
            <div className="text-right shrink-0 ml-4">
              <div className="text-[14px] font-medium text-[#1d1d1f]">
                {formatVnd(item.total)}
              </div>
              <div className="text-[12px] text-[#7a7a7a]">
                {item.quantity} x {formatVnd(item.price)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order totals */}
      <div className="flex flex-col gap-1 pt-2 border-t border-[#f0f0f0]">
        <div className="flex justify-between text-[14px]">
          <span className="text-[#7a7a7a]">Subtotal</span>
          <span>{formatVnd(order.subtotal)}</span>
        </div>
        {Number(order.shipping_fee) > 0 && (
          <div className="flex justify-between text-[14px]">
            <span className="text-[#7a7a7a]">Shipping</span>
            <span>{formatVnd(order.shipping_fee)}</span>
          </div>
        )}
        <div className="flex justify-between text-[17px] font-semibold pt-2">
          <span>Total</span>
          <span>{formatVnd(order.total_amount)}</span>
        </div>
      </div>

      {/* Payment & shipping info */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-[#7a7a7a] pt-2 border-t border-[#f0f0f0]">
        <span>Payment: {order.payment_method?.toUpperCase() || "N/A"}</span>
        <span>
          Payment status:{" "}
          <span
            className={
              order.payment_status === "paid"
                ? "text-[#1d8a3d]"
                : order.payment_status === "failed"
                  ? "text-[#e30000]"
                  : "text-[#ca7600]"
            }
          >
            {order.payment_status}
          </span>
        </span>
        {order.address && <span>Ship to: {order.address}</span>}
      </div>

      {/* Cancel button — only when pending */}
      {order.order_status === "pending" && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={cancellingId === order.id}
            onClick={() => onCancel(order.id)}
            className="text-[#e30000] text-[14px] font-medium px-4 py-2 rounded-[11px] border border-[#e30000]/30 hover:bg-[#fff0f0] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {cancellingId === order.id ? (
              <>
                <Loading variant="inline" size="small" />
                Cancelling…
              </>
            ) : (
              "Cancel Order"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

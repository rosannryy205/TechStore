import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { orderService } from "@/services/api/client/orderService";
import { userService } from "@/services/api/client/userService";

export function useUserProfile() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    logout,
    refreshMe,
  } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const [cancellingId, setCancellingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState(null);

  const [formName, setFormName] = useState(user?.name || "");
  const [formPhone, setFormPhone] = useState(user?.phone || "");
  const [formAddress, setFormAddress] = useState(user?.address || "");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Sync form state when user changes without cascading renders
  const [prevUser, setPrevUser] = useState(user);
  if (prevUser !== user) {
    setPrevUser(user);
    setFormName(user?.name || "");
    setFormPhone(user?.phone || "");
    setFormAddress(user?.address || "");
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchOrders = useCallback(async () => {
    if (authLoading || !isAuthenticated) return;
    try {
      setLoadingOrders(true);
      setOrdersError(null);
      const data = await orderService.getUserOrders();
      setOrders(data || []);
    } catch (e) {
      setOrdersError(e?.message || "Failed to load orders.");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    let ignore = false;
    if (authLoading || !isAuthenticated) return;

    orderService
      .getUserOrders()
      .then((data) => {
        if (!ignore) setOrders(data || []);
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

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    if (nextTab === "orders" || nextTab === "dashboard") {
      fetchOrders();
    }
  };

  const handleCancelOrder = useCallback((orderId) => {
    setPendingCancelId(orderId);
    setConfirmOpen(true);
  }, []);

  const executeCancelOrder = useCallback(async () => {
    if (!pendingCancelId) return;
    try {
      setCancellingId(pendingCancelId);
      setConfirmOpen(false);
      setOrdersError(null);
      await orderService.cancelOrder(pendingCancelId);
      await fetchOrders();
    } catch (e) {
      setOrdersError(e?.message || "Failed to cancel order.");
    } finally {
      setCancellingId(null);
      setPendingCancelId(null);
    }
  }, [pendingCancelId, fetchOrders]);

  const closeConfirmDialog = useCallback(() => {
    setConfirmOpen(false);
    setPendingCancelId(null);
  }, []);

  const handleSaveProfile = useCallback(
    async (e) => {
      e.preventDefault();
      setSaveMessage(null);
      try {
        setSaving(true);
        await userService.updateProfile({
          name: formName,
          phone: formPhone,
          address: formAddress,
        });
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
    [formName, formPhone, formAddress, refreshMe]
  );

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return {
    user,
    authLoading,
    activeTab,
    handleTabChange,
    orders,
    loadingOrders,
    ordersError,
    cancellingId,
    confirmOpen,
    handleCancelOrder,
    executeCancelOrder,
    closeConfirmDialog,
    formName,
    setFormName,
    formPhone,
    setFormPhone,
    formAddress,
    setFormAddress,
    saving,
    saveMessage,
    handleSaveProfile,
    handleLogout,
  };
}

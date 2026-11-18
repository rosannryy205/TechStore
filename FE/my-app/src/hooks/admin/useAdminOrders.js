import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { adminOrderService, exportOrdersCsv } from "@/services/api/admin/orderService";

export function useAdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get("status") || "all";
  const [filters, setFilters] = useState({ search: "", paymentMethod: "all", paymentStatus: "all", dateRange: "all", sortBy: "newest", page: 1 });
  const [result, setResult] = useState({ data: [], total: 0, page: 1, totalPages: 1, countsByStatus: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [selectionStatus, setSelectionStatus] = useState(activeStatus);
  // Back/Forward đổi tab cũng phải bỏ lựa chọn, kể cả không đi qua nút đổi tab.
  if (selectionStatus !== activeStatus) {
    setSelectionStatus(activeStatus);
    setSelectedOrderIds([]);
  }
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, message: "", type: "success" });
  const [busy, setBusy] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const busyRef = useRef(false);
  const cancelRequest = useRef(null);
  const showNotification = useCallback((message, type = "success") => setNotification({ isOpen: true, message, type }), []);
  const refreshOrders = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    // Debounce tìm kiếm và bỏ phản hồi cũ, không cho query trước ghi đè danh sách mới.
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await adminOrderService.getOrders({ ...filters, status: activeStatus, limit: 8 }, controller.signal);
        if (!controller.signal.aborted) setResult(data);
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [filters, activeStatus, reloadKey]);

  useEffect(() => {
    if (!isDrawerOpen || !selectedOrderId) return;
    const controller = new AbortController();
    Promise.resolve().then(async () => {
      if (controller.signal.aborted) return;
      setDetailLoading(true);
      setDetailError("");
      try {
        const detail = await adminOrderService.getOrder(selectedOrderId, controller.signal);
        if (!controller.signal.aborted) setSelectedOrder(detail);
      } catch (failure) {
        if (!controller.signal.aborted) setDetailError(failure.message);
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    });
    return () => controller.abort();
  }, [selectedOrderId, isDrawerOpen, reloadKey]);

  const changeFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value, page: 1 }));
    setSelectedOrderIds([]);
    setLoading(true);
  };
  const handleTabChange = (status) => {
    setSearchParams((previous) => { const next = new URLSearchParams(previous); if (status === "all") next.delete("status"); else next.set("status", status); return next; });
    changeFilter("page", 1);
  };
  const handlePageChange = (page) => {
    if (page < 1 || page > result.totalPages) return;
    setFilters((previous) => ({ ...previous, page }));
    setSelectedOrderIds([]);
    setLoading(true);
  };
  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setSelectedOrderId(order.id);
    setDetailError("");
    setIsDrawerOpen(true);
  };

  // Khóa bằng ref ngay trước await để hai click trong cùng frame không tạo hai request.
  const mutate = async (action, successMessage) => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    try {
      const data = await action();
      showNotification(typeof successMessage === "function" ? successMessage(data) : successMessage, data?.failedCount ? "error" : "success");
      setSelectedOrderIds([]);
      refreshOrders();
      return true;
    } catch (failure) {
      showNotification(failure.message || "Không xử lý được yêu cầu.", "error");
      refreshOrders();
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const handleUpdateStatus = (id, target) => {
    const order = selectedOrder?.id === id ? selectedOrder : result.data.find((item) => item.id === id);
    if (order) return mutate(() => adminOrderService.updateStatus(id, order.order_status, target), "Đã cập nhật trạng thái đơn hàng.");
  };
  const handleQuickAdvance = (order) => order.next_status && mutate(() => adminOrderService.updateStatus(order.id, order.order_status, order.next_status), "Đã xác nhận đơn hàng.");
  const handleConfirmCancel = async (reason) => {
    if (!selectedOrder) return;
    if (!cancelRequest.current || cancelRequest.current.reason !== reason) cancelRequest.current = { reason, request_id: crypto.randomUUID(), expected_status: selectedOrder.order_status };
    const succeeded = await mutate(async () => {
      try { return await adminOrderService.cancel(selectedOrder.id, cancelRequest.current); }
      catch (failure) {
        if (failure.status < 500 || failure.payload?.code === "CANCELLATION_FAILED") cancelRequest.current = null;
        throw failure;
      }
    }, "Đã hủy đơn hàng và hoàn kho.");
    if (succeeded) { setIsCancelModalOpen(false); cancelRequest.current = null; }
  };
  const handleBulkAdvance = (target) => {
    const orders = result.data.filter((order) => selectedOrderIds.includes(order.id));
    if (!orders.length) return;
    return mutate(async () => {
      const data = await adminOrderService.bulkStatus(orders, target);
      setBulkResult(data);
      return data;
    }, (data) => `${data.updatedCount} đơn thành công, ${data.failedCount} đơn thất bại.`);
  };

  return {
    orders: result.data, loading, error, refreshOrders, detailLoading, detailError, busy, bulkResult,
    totalOrders: result.total, currentPage: result.page, totalPages: result.totalPages, countsByStatus: result.countsByStatus,
    activeStatus, searchTerm: filters.search, paymentMethod: filters.paymentMethod, paymentStatus: filters.paymentStatus, dateRange: filters.dateRange, sortBy: filters.sortBy,
    selectedOrderIds, selectedOrder, isDrawerOpen, isCancelModalOpen, isPrintModalOpen, printOrder, notification,
    closeNotification: () => setNotification((previous) => ({ ...previous, isOpen: false })),
    handleTabChange, handleSearchChange: (value) => changeFilter("search", value),
    setPaymentMethod: (value) => changeFilter("paymentMethod", value), setPaymentStatus: (value) => changeFilter("paymentStatus", value), setDateRange: (value) => changeFilter("dateRange", value), setSortBy: (value) => changeFilter("sortBy", value),
    handlePageChange,
    handleSelectOne: (id, checked) => { if (!busy && !loading) setSelectedOrderIds((previous) => checked ? [...new Set([...previous, id])] : previous.filter((item) => item !== id)); },
    handleSelectAll: (checked) => { if (!busy && !loading) setSelectedOrderIds(checked ? result.data.map((order) => order.id) : []); },
    handleOpenDetail, handleCloseDetail: () => { if (!busy) setIsDrawerOpen(false); },
    handleUpdateStatus, handleQuickAdvance,
    handleOpenCancelModal: () => { cancelRequest.current = null; setIsCancelModalOpen(true); },
    handleConfirmCancel, setIsCancelModalOpen, handleBulkAdvance, setSelectedOrderIds,
    handleOpenPrint: (order) => { setPrintOrder(order); setIsPrintModalOpen(true); },
    handleClosePrint: () => setIsPrintModalOpen(false),
    handleExportCsv: () => { if (!loading && !error) exportOrdersCsv(result.data); },
  };
}

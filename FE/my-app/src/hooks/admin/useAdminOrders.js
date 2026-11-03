import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { mockOrderService } from "@/services/api/admin/mockOrderService";
import { ORDER_STATUS_FLOW } from "@/constants/orderStatus";

export function useAdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc status từ URL query param, mặc định là 'all'
  const activeStatus = searchParams.get("status") || "all";

  // Bộ lọc & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [reloadKey, setReloadKey] = useState(0);

  // Dữ liệu & Phân trang
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [countsByStatus, setCountsByStatus] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  });

  // Chọn hàng loạt (Bulk actions)
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Drawer xem chi tiết đơn hàng (Dùng ID, tính toán derived state tự động cập nhật)
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal hủy đơn
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // Modal in phiếu giao hàng
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState(null);

  // Notification Toast
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({
      isOpen: true,
      message,
      type,
    });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const refreshOrders = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  // Tải danh sách đơn hàng từ Mock Service
  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      try {
        setLoading(true);
        const res = await mockOrderService.getOrders({
          status: activeStatus,
          search: searchTerm,
          paymentMethod,
          paymentStatus,
          dateRange,
          sortBy,
          page: currentPage,
          limit: 8,
        });

        if (!ignore) {
          setOrders(res.orders);
          setTotalOrders(res.total);
          setTotalPages(res.totalPages);
          setCountsByStatus(res.countsByStatus);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Lỗi khi tải danh sách đơn hàng:", err);
          showNotification("Không thể tải danh sách đơn hàng", "error");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      ignore = true;
    };
  }, [
    activeStatus,
    searchTerm,
    paymentMethod,
    paymentStatus,
    dateRange,
    sortBy,
    currentPage,
    reloadKey,
    showNotification,
  ]);

  // Derived state: luôn lấy dữ liệu mới nhất từ mảng orders
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  // Đổi tab trạng thái và cập nhật URL query params
  const handleTabChange = (statusKey) => {
    setCurrentPage(1);
    setSelectedOrderIds([]);
    if (statusKey === "all") {
      searchParams.delete("status");
      setSearchParams(searchParams);
    } else {
      searchParams.set("status", statusKey);
      setSearchParams(searchParams);
    }
  };

  // Tìm kiếm
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  // Thay đổi trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Chọn checkbox đơn lẻ
  const handleSelectOne = (id, checked) => {
    setSelectedOrderIds((prev) =>
      checked ? [...prev, id] : prev.filter((orderId) => orderId !== id)
    );
  };

  // Chọn tất cả checkbox trên trang hiện tại
  const handleSelectAll = (checked) => {
    if (checked) {
      const pageIds = orders.map((o) => o.id);
      setSelectedOrderIds(Array.from(new Set([...selectedOrderIds, ...pageIds])));
    } else {
      const pageIds = new Set(orders.map((o) => o.id));
      setSelectedOrderIds((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  // Mở drawer xem chi tiết
  const handleOpenDetail = (order) => {
    setSelectedOrderId(order.id);
    setIsDrawerOpen(true);
  };

  // Đóng drawer
  const handleCloseDetail = () => {
    setIsDrawerOpen(false);
  };

  // Chuyển nhanh sang trạng thái kế tiếp (Quick Advance 1-Click)
  const handleQuickAdvance = async (order) => {
    const currentIndex = ORDER_STATUS_FLOW.indexOf(order.order_status);
    if (currentIndex === -1 || currentIndex >= ORDER_STATUS_FLOW.length - 1) {
      return;
    }
    const nextStatus = ORDER_STATUS_FLOW[currentIndex + 1];

    try {
      await mockOrderService.updateOrderStatus(order.id, nextStatus);
      showNotification(
        `Đơn hàng ${order.order_code} đã chuyển sang "${nextStatus.toUpperCase()}"`,
        "success"
      );
      refreshOrders();
    } catch (err) {
      console.error("Lỗi cập nhật nhanh:", err);
      showNotification("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng", "error");
    }
  };

  // Cập nhật trạng thái từ Drawer
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updated = await mockOrderService.updateOrderStatus(orderId, newStatus);
      showNotification(
        `Đã cập nhật trạng thái đơn ${updated.order_code} thành công`,
        "success"
      );
      refreshOrders();
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      showNotification("Không thể cập nhật trạng thái đơn hàng", "error");
    }
  };

  // Mở modal hủy đơn
  const handleOpenCancelModal = (orderId) => {
    setCancellingOrderId(orderId);
    setIsCancelModalOpen(true);
  };

  // Xác nhận hủy đơn kèm lý do
  const handleConfirmCancel = async (reason) => {
    if (!cancellingOrderId) return;
    try {
      const updated = await mockOrderService.updateOrderStatus(
        cancellingOrderId,
        "cancelled",
        reason
      );
      setIsCancelModalOpen(false);
      setCancellingOrderId(null);
      showNotification(`Đã hủy đơn hàng ${updated.order_code}`, "warning");
      refreshOrders();
    } catch (err) {
      console.error("Lỗi hủy đơn hàng:", err);
      showNotification("Không thể hủy đơn hàng", "error");
    }
  };

  // Cập nhật trạng thái thanh toán từ Drawer
  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const updated = await mockOrderService.updatePaymentStatus(
        orderId,
        newPaymentStatus
      );
      showNotification(
        `Đã cập nhật thanh toán đơn ${updated.order_code}: ${newPaymentStatus}`,
        "success"
      );
      refreshOrders();
    } catch (err) {
      console.error("Lỗi cập nhật thanh toán:", err);
      showNotification("Không thể cập nhật thanh toán", "error");
    }
  };

  // Thao tác hàng loạt (Bulk Status Advance)
  const handleBulkAdvance = async (newStatus) => {
    if (!selectedOrderIds.length) return;
    try {
      const { updatedCount } = await mockOrderService.bulkUpdateStatus(
        selectedOrderIds,
        newStatus
      );
      setSelectedOrderIds([]);
      showNotification(
        `Đã cập nhật thành công ${updatedCount} đơn hàng sang trạng thái mới`,
        "success"
      );
      refreshOrders();
    } catch (err) {
      console.error("Lỗi thao tác hàng loạt:", err);
      showNotification("Thao tác hàng loạt thất bại", "error");
    }
  };

  // Mở modal in phiếu
  const handleOpenPrint = (order) => {
    setPrintOrder(order);
    setIsPrintModalOpen(true);
  };

  const handleClosePrint = () => {
    setIsPrintModalOpen(false);
    setPrintOrder(null);
  };

  // Xuất file CSV
  const handleExportCsv = () => {
    mockOrderService.exportOrdersCsv(orders);
    showNotification("Đã xuất danh sách đơn hàng sang file CSV", "success");
  };

  // Đặt lại dữ liệu mẫu
  const handleResetData = async () => {
    try {
      await mockOrderService.resetData();
      setSelectedOrderIds([]);
      setCurrentPage(1);
      showNotification("Đã đặt lại toàn bộ dữ liệu đơn hàng mẫu ban đầu", "success");
      refreshOrders();
    } catch (err) {
      console.error("Lỗi reset dữ liệu:", err);
      showNotification("Không thể đặt lại dữ liệu", "error");
    }
  };

  return {
    orders,
    loading,
    totalOrders,
    currentPage,
    totalPages,
    countsByStatus,
    activeStatus,
    searchTerm,
    paymentMethod,
    paymentStatus,
    dateRange,
    sortBy,
    selectedOrderIds,
    selectedOrder,
    isDrawerOpen,
    isCancelModalOpen,
    isPrintModalOpen,
    printOrder,
    notification,
    closeNotification,
    handleTabChange,
    handleSearchChange,
    setPaymentMethod,
    setPaymentStatus,
    setDateRange,
    setSortBy,
    handlePageChange,
    handleSelectOne,
    handleSelectAll,
    handleOpenDetail,
    handleCloseDetail,
    handleQuickAdvance,
    handleUpdateStatus,
    handleOpenCancelModal,
    handleConfirmCancel,
    setIsCancelModalOpen,
    handleUpdatePaymentStatus,
    handleBulkAdvance,
    setSelectedOrderIds,
    handleOpenPrint,
    handleClosePrint,
    handleExportCsv,
    handleResetData,
  };
}

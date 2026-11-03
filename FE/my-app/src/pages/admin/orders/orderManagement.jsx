import Notification from "@/components/notification";
import { useAdminOrders } from "@/hooks/admin/useAdminOrders";
import OrderManagementHeader from "@/components/admin/orders/orderManagementHeader";
import OrderStatusTabs from "@/components/admin/orders/orderStatusTabs";
import OrderFilterBar from "@/components/admin/orders/orderFilterBar";
import OrderTable from "@/components/admin/orders/orderTable";
import OrderBulkActionBar from "@/components/admin/orders/orderBulkActionBar";
import OrderDetailDrawer from "@/components/admin/orders/orderDetailDrawer";
import OrderCancelModal from "@/components/admin/orders/orderCancelModal";
import OrderPrintModal from "@/components/admin/orders/orderPrintModal";

export default function OrderManagement() {
  const {
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
  } = useAdminOrders();

  const handleResetFilters = () => {
    handleSearchChange("");
    setPaymentMethod("all");
    setPaymentStatus("all");
    setDateRange("all");
    setSortBy("newest");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans text-[#1d1d1f]">
      {/* Toast Notification */}
      <Notification
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />

      {/* 1. Header Trang */}
      <OrderManagementHeader
        totalOrders={totalOrders}
        onResetData={handleResetData}
        onExportCsv={handleExportCsv}
      />

      {/* 2. Tabs trạng thái */}
      <OrderStatusTabs
        activeStatus={activeStatus}
        countsByStatus={countsByStatus}
        onTabChange={handleTabChange}
      />

      {/* 3. Bộ lọc & Tìm kiếm */}
      <OrderFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={setPaymentStatus}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Bảng danh sách đơn hàng & Phân trang */}
      <OrderTable
        orders={orders}
        loading={loading}
        selectedOrderIds={selectedOrderIds}
        currentPage={currentPage}
        totalPages={totalPages}
        totalOrders={totalOrders}
        onPageChange={handlePageChange}
        onToggleSelectOne={handleSelectOne}
        onToggleSelectAll={handleSelectAll}
        onOpenDetail={handleOpenDetail}
        onQuickAdvance={handleQuickAdvance}
      />

      {/* 5. Thanh tác vụ hàng loạt nổi */}
      <OrderBulkActionBar
        selectedCount={selectedOrderIds.length}
        onBulkAdvance={handleBulkAdvance}
        onClearSelection={() => setSelectedOrderIds([])}
      />

      {/* 6. Slide-over Drawer xem chi tiết đơn hàng */}
      <OrderDetailDrawer
        isOpen={isDrawerOpen}
        order={selectedOrder}
        onClose={handleCloseDetail}
        onUpdateStatus={handleUpdateStatus}
        onOpenCancelModal={handleOpenCancelModal}
        onOpenPrint={handleOpenPrint}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
      />

      {/* 7. Modal xác nhận hủy đơn */}
      <OrderCancelModal
        isOpen={isCancelModalOpen}
        orderCode={selectedOrder?.order_code || ""}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
      />

      {/* 8. Modal xem trước và in phiếu giao hàng */}
      <OrderPrintModal
        isOpen={isPrintModalOpen}
        order={printOrder}
        onClose={handleClosePrint}
      />
    </div>
  );
}

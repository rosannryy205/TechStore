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
    error,
    detailLoading,
    detailError,
    refreshOrders,
    busy,
    bulkResult,
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
    handleBulkAdvance,
    setSelectedOrderIds,
    handleOpenPrint,
    handleClosePrint,
    handleExportCsv,
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

      <fieldset disabled={busy} className="min-w-0">
      {/* 1. Header Trang */}
      <OrderManagementHeader
        totalOrders={totalOrders}
        onExportCsv={handleExportCsv}
        onRefresh={refreshOrders}
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
      {bulkResult && <section aria-live="polite" className="mb-4 rounded-xl border border-gray-200 bg-white p-4 text-sm">
        <h2 className="font-semibold">Kết quả lần cập nhật hàng loạt gần nhất: {bulkResult.updatedCount} thành công, {bulkResult.failedCount} thất bại</h2>
        <ul className="mt-2 space-y-1">{bulkResult.results.map((item) => <li key={item.id} className={item.success ? "text-green-700" : "text-red-700"}>Đơn #{item.id}: {item.success ? "Thành công" : item.message}</li>)}</ul>
      </section>}
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error} <button type="button" onClick={refreshOrders} className="ml-3 underline">Thử lại</button></div>}
      <OrderTable
        orders={error ? [] : orders}
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
        selectedCount={loading ? 0 : selectedOrderIds.length}
        onBulkAdvance={handleBulkAdvance}
        onClearSelection={() => setSelectedOrderIds([])}
      />

      {/* 6. Slide-over Drawer xem chi tiết đơn hàng */}
      {isDrawerOpen && (detailLoading || detailError) && <div role="status" className="fixed top-4 right-4 z-[60] rounded-xl border bg-white p-4 shadow-sm">{detailError || "Đang tải chi tiết…"}{detailError && <button type="button" onClick={refreshOrders} className="ml-3 underline">Thử lại</button>}</div>}
      <OrderDetailDrawer
        isOpen={isDrawerOpen}
        order={selectedOrder}
        onClose={handleCloseDetail}
        onUpdateStatus={handleUpdateStatus}
        onOpenCancelModal={handleOpenCancelModal}
        onOpenPrint={handleOpenPrint}
      />

      {/* 7. Modal xác nhận hủy đơn */}
      <OrderCancelModal
        isOpen={isCancelModalOpen}
        busy={busy}
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
      </fieldset>
    </div>
  );
}

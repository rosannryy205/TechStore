import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ShoppingBagIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { SF_DISPLAY } from "@/constants/typography";
import { cartService } from "@/services/api/client/cartService";
import OrderSkeleton from "./OrderSkeleton";
import ProfileOrderCard from "./ProfileOrderCard";
import OrderTrackingDrawer from "./OrderTrackingDrawer";

const STATUS_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "processing", label: "Đang chuẩn bị" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Hoàn tất" },
  { key: "cancelled", label: "Đã hủy" },
];

export default function ProfileOrdersTab({
  orders = [],
  loadingOrders = false,
  ordersError = null,
  cancellingId = null,
  onCancelOrder,
}) {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reorderingId, setReorderingId] = useState(null);
  const [noticeMessage, setNoticeMessage] = useState(null);

  // Tính số lượng đơn hàng theo từng trạng thái để gắn badge
  const countsByStatus = useMemo(() => {
    const counts = { all: orders.length };
    for (const tab of STATUS_TABS) {
      if (tab.key !== "all") counts[tab.key] = 0;
    }
    for (const order of orders) {
      const s = order.order_status;
      if (counts[s] !== undefined) {
        counts[s] += 1;
      }
    }
    return counts;
  }, [orders]);

  // Lọc đơn hàng theo tab trạng thái & thanh tìm kiếm tức thời
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Lọc theo trạng thái
      if (activeStatus !== "all" && order.order_status !== activeStatus) {
        return false;
      }

      // 2. Lọc theo chuỗi tìm kiếm (mã đơn hoặc tên sản phẩm)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const codeMatch = (order.order_code || "").toLowerCase().includes(query);
        const idMatch = String(order.id).includes(query);
        const itemMatch = order.items?.some((item) =>
          (item.variant?.product?.name || "").toLowerCase().includes(query)
        );
        return codeMatch || idMatch || itemMatch;
      }

      return true;
    });
  }, [orders, activeStatus, searchQuery]);

  // Xử lý kịch bản Mua lại (Reorder)
  const handleReorder = async (order) => {
    if (!order?.items || order.items.length === 0) return;

    try {
      setReorderingId(order.id);
      setNoticeMessage(null);

      let addedCount = 0;
      let outOfStockCount = 0;

      for (const item of order.items) {
        const productId = item.variant?.product_id || item.variant?.product?.id;
        const variantId = item.product_variant_id || item.variant?.id;
        const quantity = Number(item.quantity) || 1;

        if (!productId || !variantId) continue;

        try {
          await cartService.addToCart({
            productId,
            variantId,
            quantity,
          });
          addedCount++;
        } catch {
          // Sản phẩm hết hàng hoặc không khả dụng
          outOfStockCount++;
        }
      }

      // Kích hoạt cập nhật số lượng giỏ hàng trên Header
      window.dispatchEvent(new Event("cart:updated"));

      if (outOfStockCount > 0 && addedCount > 0) {
        setNoticeMessage({
          type: "warning",
          text: `Đã thêm ${addedCount} sản phẩm vào giỏ. ${outOfStockCount} sản phẩm tạm hết hàng đã được bỏ qua.`,
        });
        setTimeout(() => navigate("/cart"), 1500);
      } else if (outOfStockCount > 0 && addedCount === 0) {
        setNoticeMessage({
          type: "error",
          text: "Rất tiếc, các sản phẩm trong đơn hàng này hiện đã hết hàng.",
        });
      } else {
        navigate("/cart");
      }
    } catch (err) {
      setNoticeMessage({
        type: "error",
        text: err?.message || "Không thể thêm sản phẩm vào giỏ hàng.",
      });
    } finally {
      setReorderingId(null);
    }
  };

  // Cập nhật selectedOrder nếu danh sách orders thay đổi
  const currentSelectedOrder = useMemo(() => {
    if (!selectedOrder) return null;
    return orders.find((o) => o.id === selectedOrder.id) || selectedOrder;
  }, [orders, selectedOrder]);

  return (
    <div className="space-y-6">
      {/* ─── 1. TIÊU ĐỀ & THANH TÌM KIẾM TỨC THỜI ─── */}
      <div className="bg-white rounded-[24px] border border-zinc-200/80 p-6 sm:p-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2
              className="text-2xl font-bold tracking-tight text-[#18181B]"
              style={{ fontFamily: SF_DISPLAY }}
            >
              Lịch sử đơn hàng
            </h2>
            <p className="text-sm text-[#71717A] mt-1">
              Theo dõi lộ trình vận chuyển và thông tin các đơn hàng của bạn.
            </p>
          </div>

          {/* Instant Search Bar */}
          <div className="relative w-full md:w-80">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã đơn hoặc sản phẩm..."
              className="w-full pl-10 pr-9 py-2.5 bg-zinc-50 border border-zinc-200/80 rounded-full text-xs text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:border-[#0066cc] focus:bg-white focus:ring-2 focus:ring-[#0066cc]/10 transition-all min-h-[44px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded-full cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ─── 2. DẢI TAB TRẠNG THÁI (STATUS FILTER TABS) VỚI PILL BADGE ĐẾM ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar -mx-2 px-2">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.key;
            const count = countsByStatus[tab.key] || 0;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveStatus(tab.key)}
                className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[#18181B] text-white shadow-xs"
                    : "bg-zinc-100 text-[#71717A] hover:bg-zinc-200/70 hover:text-[#18181B]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-zinc-200/80 text-zinc-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thông báo nghiệp vụ Reorder / Stock notice */}
      {noticeMessage && (
        <div
          className={`p-4 rounded-[16px] text-xs flex items-center gap-2.5 border ${
            noticeMessage.type === "warning"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : noticeMessage.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <InformationCircleIcon className="w-5 h-5 shrink-0" />
          <span className="flex-1 font-medium">{noticeMessage.text}</span>
          <button
            type="button"
            onClick={() => setNoticeMessage(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lỗi tải đơn hàng */}
      {ordersError && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-[20px] text-rose-700 text-xs flex items-center justify-between gap-4">
          <span>{ordersError}</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 font-medium cursor-pointer shrink-0"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ─── 3. DANH SÁCH ĐƠN HÀNG HOẶC TRẠNG THÁI TẢI / RỖNG ─── */}
      {loadingOrders ? (
        <OrderSkeleton />
      ) : filteredOrders.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filteredOrders.map((order) => (
            <ProfileOrderCard
              key={order.id}
              order={order}
              onViewDetails={(ord) => setSelectedOrder(ord)}
              onCancel={onCancelOrder}
              onReorder={handleReorder}
              cancellingId={cancellingId}
              reorderingId={reorderingId}
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* Empty state: Người dùng chưa có đơn hàng nào */
        <div className="bg-white rounded-[24px] border border-zinc-200/80 p-12 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-4">
            <ShoppingBagIcon className="w-8 h-8 stroke-1.5" />
          </div>
          <h3
            className="text-lg font-semibold text-[#18181B] mb-2"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Bạn chưa có đơn hàng nào
          </h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto mb-6 leading-relaxed">
            Khám phá các thiết bị công nghệ chính hãng mới nhất tại TechStore và trải nghiệm dịch vụ giao hàng cao cấp.
          </p>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="min-h-[44px] bg-[#0066cc] text-white px-7 py-2.5 rounded-full text-xs font-semibold hover:bg-[#0071e3] active:scale-98 transition-all shadow-xs cursor-pointer"
          >
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        /* Empty state: Có đơn nhưng không khớp bộ lọc/tìm kiếm */
        <div className="bg-white rounded-[24px] border border-zinc-200/80 p-12 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="w-14 h-14 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3">
            <MagnifyingGlassIcon className="w-6 h-6 stroke-1.5" />
          </div>
          <h3
            className="text-base font-semibold text-[#18181B] mb-1"
            style={{ fontFamily: SF_DISPLAY }}
          >
            Không tìm thấy đơn hàng phù hợp
          </h3>
          <p className="text-xs text-[#71717A] mb-5">
            Không có đơn hàng nào khớp với từ khóa hoặc bộ lọc trạng thái hiện tại.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveStatus("all");
              setSearchQuery("");
            }}
            className="min-h-[44px] px-5 py-2 rounded-full border border-zinc-300 text-zinc-800 hover:bg-zinc-100 text-xs font-medium transition-colors cursor-pointer"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      )}

      {/* ─── 4. SLIDE-OVER DRAWER CHI TIẾT THEO DÕI ĐƠN HÀNG ─── */}
      <OrderTrackingDrawer
        isOpen={Boolean(selectedOrder)}
        order={currentSelectedOrder}
        onClose={() => setSelectedOrder(null)}
        onCancelOrder={(orderId) => {
          setSelectedOrder(null);
          onCancelOrder(orderId);
        }}
        onReorder={handleReorder}
        cancellingId={cancellingId}
        reorderingId={reorderingId}
      />
    </div>
  );
}

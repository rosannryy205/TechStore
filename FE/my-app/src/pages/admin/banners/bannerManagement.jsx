import { PlusIcon } from "@heroicons/react/24/outline";
import Loading from "@/components/loading";
import Notification from "@/components/notification";
import { SF_DISPLAY, SF_TEXT, MONO_TEXT } from "@/constants/typography";
import { useAdminBanners } from "@/hooks/admin/useAdminBanners";
import BannerTable from "@/components/admin/banners/BannerTable";
import BannerFormModal from "@/components/admin/banners/BannerFormModal";

export default function BannerManagement() {
  const {
    banners,
    isLoading,
    error,
    selectedPosition,
    notification,
    isModalOpen,
    editingBanner,
    formData,
    filePreviews,
    qualityAlerts,
    closeNotification,
    handleTabChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    handleInputChange,
    handleSpecChange,
    handleFileSelect,
    handleToggleStatus,
    handleDelete,
    handleSubmit,
    setFormData,
  } = useAdminBanners();

  const heroCount = banners.filter((b) => b.position === "hero_slide").length;
  const tradeInCount = banners.filter((b) => b.position === "trade_in").length;
  const activeCount = banners.filter((b) => Number(b.status) === 1).length;

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] p-4 md:p-6 lg:p-8"
      style={{ fontFamily: SF_TEXT }}
    >
      <Notification
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
      <Loading shouldShow={isLoading} variant="fullscreen" />

      <div className="mx-auto max-w-7xl">
        {/* Top Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#3B82F6] text-[11px] font-semibold tracking-wider uppercase mb-2 border border-blue-100"
              style={{ fontFamily: MONO_TEXT }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
              VISION 3D SHOWCASE ENGINE
            </div>
            <h1
              className="text-[30px] sm:text-[34px] font-bold text-[#1d1d1f] tracking-tight"
              style={{ fontFamily: SF_DISPLAY }}
            >
              Quản lý hình ảnh Banner
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý slide 3D lơ lửng, ảnh lồng chữ typography và các chiến dịch quảng bá tại trang chủ.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm Banner mới</span>
          </button>
        </div>

        {/* Quick Stats & Position Filter Tabs */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedPosition === "all"
                  ? "bg-[#18181B] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Tất cả vị trí ({banners.length})
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("hero_slide")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedPosition === "hero_slide"
                  ? "bg-[#3B82F6] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Hero 3D Showcase ({heroCount})
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("trade_in")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedPosition === "trade_in"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              Trade-in Program ({tradeInCount})
            </button>
          </div>

          <div
            className="text-xs text-gray-500 font-mono flex items-center gap-2"
            style={{ fontFamily: MONO_TEXT }}
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            Đang kích hoạt: <strong className="text-gray-900">{activeCount}</strong> banner
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-200 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-semibold underline hover:text-red-900"
            >
              Tải lại
            </button>
          </div>
        )}

        {/* Banner Table */}
        <BannerTable
          banners={banners}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />

        {/* Form Modal */}
        <BannerFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          formData={formData}
          isEditing={Boolean(editingBanner)}
          isLoading={isLoading}
          filePreviews={filePreviews}
          qualityAlerts={qualityAlerts}
          onChange={handleInputChange}
          onSpecChange={handleSpecChange}
          onFileSelect={handleFileSelect}
          onSubmit={handleSubmit}
          setFormData={setFormData}
        />
      </div>
    </div>
  );
}

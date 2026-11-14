import { XMarkIcon, PhotoIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { SF_DISPLAY, SF_TEXT, MONO_TEXT } from "@/constants/typography";
import { BANNER_POSITIONS, AMBIENT_PRESETS, BANNER_SPECS_CONFIG } from "@/constants/bannerPresets";
import Banner3DPreview from "./Banner3DPreview";

export default function BannerFormModal({
  isOpen,
  onClose,
  formData,
  isEditing,
  isLoading,
  filePreviews,
  qualityAlerts,
  onChange,
  onSpecChange,
  onFileSelect,
  onSubmit,
  setFormData,
}) {
  if (!isOpen) return null;

  const isHero = formData.position === "hero_slide";
  const posConfig = BANNER_SPECS_CONFIG[formData.position] || BANNER_SPECS_CONFIG.hero_slide;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60 shrink-0">
          <div>
            <h2
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: SF_DISPLAY }}
            >
              {isEditing ? "Chỉnh sửa Banner" : "Thêm Banner mới"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tùy chỉnh thông số hiển thị, màu sắc quang sai và ảnh 3D cho TechStore
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ─── LEFT COLUMN: FORM FIELDS (7 Cols) ─── */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Position selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Vị trí bố cục hiển thị <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BANNER_POSITIONS.map((pos) => {
                    const isSelected = formData.position === pos.value;
                    return (
                      <button
                        type="button"
                        key={pos.value}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, position: pos.value }))
                        }
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#3B82F6] bg-blue-50/50 shadow-sm ring-2 ring-[#3B82F6]/20"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-gray-900">
                            {pos.label}
                          </span>
                          <span
                            className={`w-3 h-3 rounded-full border-2 ${
                              isSelected
                                ? "border-[#3B82F6] bg-[#3B82F6]"
                                : "border-gray-300 bg-white"
                            }`}
                          />
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {pos.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nhãn phụ (Badge)
                  </label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={onChange}
                    placeholder="VD: iPhone 18 Pro Max"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tiêu đề chính <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={onChange}
                    placeholder={
                      isHero
                        ? "Kỷ nguyên {img1} công nghệ {img2} nguyên khối."
                        : "Thu cũ đổi mới. Trợ giá đến 2.000.000₫."
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent font-medium"
                    required
                  />
                  {isHero && (
                    <p className="text-[11px] text-gray-500 mt-1 font-mono" style={{ fontFamily: MONO_TEXT }}>
                      Tip: Thêm token &#123;img1&#125; và &#123;img2&#125; để lồng ảnh typography vào dòng chữ.
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mô tả chi tiết
                </label>
                <textarea
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={onChange}
                  placeholder="Nhập đoạn mô tả tính năng nổi bật..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                />
              </div>

              {/* ─── IMAGE DROPZONES & VALIDATION ─── */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-gray-900">
                      {posConfig.device.label} <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-[#3B82F6] font-mono" style={{ fontFamily: MONO_TEXT }}>
                      Chuẩn: {posConfig.device.recommended}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-300 bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#ffffff_0%_50%)] bg-[length:10px_10px] shrink-0 flex items-center justify-center shadow-inner">
                      {filePreviews.image || formData.image_url ? (
                        <img
                          src={filePreviews.image || formData.image_url}
                          alt="Main Preview"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer shadow-sm">
                        <span>Chọn ảnh thiết bị</span>
                        <input
                          type="file"
                          accept={posConfig.device.allowedFormats.join(",")}
                          onChange={(e) =>
                            onFileSelect("image", e.target.files?.[0])
                          }
                          className="sr-only"
                        />
                      </label>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Định dạng: {posConfig.device.formatLabel}
                      </p>
                    </div>
                  </div>

                  {/* Pre-flight Quality Alert Bar for Device Image */}
                  {qualityAlerts.image && (
                    <div
                      className={`mt-2 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                        qualityAlerts.image.isAcceptable
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {qualityAlerts.image.isAcceptable ? (
                        <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold">
                          Kích thước phát hiện: {qualityAlerts.image.width}x
                          {qualityAlerts.image.height}px (Tỷ lệ: {qualityAlerts.image.ratio})
                        </span>
                        {qualityAlerts.image.alerts.length > 0 && (
                          <ul className="list-disc pl-4 mt-1 space-y-0.5">
                            {qualityAlerts.image.alerts.map((alert, idx) => (
                              <li key={idx}>{alert}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Inline Images for Hero 3D */}
                {isHero && (
                  <div className="pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Inline Image 1 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-gray-800">
                          Ảnh Typography 1 ({'{img1}'})
                        </label>
                        <span className="text-[10px] font-mono text-gray-500" style={{ fontFamily: MONO_TEXT }}>
                          16:9
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-9 rounded-lg overflow-hidden border border-gray-300 bg-gray-100 shrink-0">
                          {filePreviews.inline1 || formData.inline_img_1 ? (
                            <img
                              src={filePreviews.inline1 || formData.inline_img_1}
                              alt="Inline 1"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                              16:9
                            </div>
                          )}
                        </div>
                        <label className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-[11px] font-medium text-gray-700 hover:bg-gray-100 cursor-pointer">
                          <span>Chọn ảnh 1</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              onFileSelect("inline1", e.target.files?.[0])
                            }
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Inline Image 2 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-gray-800">
                          Ảnh Typography 2 ({'{img2}'})
                        </label>
                        <span className="text-[10px] font-mono text-gray-500" style={{ fontFamily: MONO_TEXT }}>
                          16:9
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-9 rounded-lg overflow-hidden border border-gray-300 bg-gray-100 shrink-0">
                          {filePreviews.inline2 || formData.inline_img_2 ? (
                            <img
                              src={filePreviews.inline2 || formData.inline_img_2}
                              alt="Inline 2"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                              16:9
                            </div>
                          )}
                        </div>
                        <label className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-[11px] font-medium text-gray-700 hover:bg-gray-100 cursor-pointer">
                          <span>Chọn ảnh 2</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              onFileSelect("inline2", e.target.files?.[0])
                            }
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ambient Color Picker for 3D */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Màu quang sai nền kính 3D (Ambient Caustic Color)
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {AMBIENT_PRESETS.map((preset) => {
                    const isSelected = formData.ambient_color === preset.value;
                    return (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            ambient_color: preset.value,
                          }))
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#3B82F6] bg-blue-50 text-blue-800 shadow-sm ring-1 ring-[#3B82F6]"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: preset.hex }}
                        />
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  name="ambient_color"
                  value={formData.ambient_color}
                  onChange={onChange}
                  placeholder="rgba(59, 130, 246, 0.28)"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  style={{ fontFamily: MONO_TEXT }}
                />
              </div>

              {/* Call to action & HUD details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Nhãn nút CTA
                  </label>
                  <input
                    type="text"
                    name="primary_cta_label"
                    value={formData.primary_cta_label}
                    onChange={onChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Đường dẫn liên kết CTA
                  </label>
                  <input
                    type="text"
                    name="primary_cta_link"
                    value={formData.primary_cta_link}
                    onChange={onChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>

              {/* HUD metric values */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Chip Badge
                  </label>
                  <input
                    type="text"
                    name="chip_badge"
                    value={formData.chip_badge}
                    onChange={onChange}
                    placeholder="A20 Pro · 2nm"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    HUD Thông số (Metric)
                  </label>
                  <input
                    type="text"
                    name="metric_value"
                    value={formData.metric_value}
                    onChange={onChange}
                    placeholder="48MP / 128GB"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    HUD Mô tả (Label)
                  </label>
                  <input
                    type="text"
                    name="metric_label"
                    value={formData.metric_label}
                    onChange={onChange}
                    placeholder="Camera Fusion"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>

              {/* Dynamic Specs for Hero Slide */}
              {isHero && (
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                    Thông số kỹ thuật chân trang (3 thông số)
                  </label>
                  <div className="space-y-2">
                    {(formData.specs || []).map((spec, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2">
                        <input
                          type="text"
                          value={spec.label}
                          onChange={(e) =>
                            onSpecChange(index, "label", e.target.value)
                          }
                          placeholder={`Nhãn ${index + 1} (VD: Màn hình)`}
                          className="col-span-5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) =>
                            onSpecChange(index, "value", e.target.value)
                          }
                          placeholder={`Giá trị (VD: OLED 6.9 inch)`}
                          className="col-span-7 px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order & Status */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Thứ tự hiển thị:
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="display_order"
                    value={formData.display_order}
                    onChange={onChange}
                    className="w-20 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-mono text-center focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="status"
                    checked={Number(formData.status) === 1}
                    onChange={onChange}
                    className="w-4 h-4 text-[#3B82F6] rounded border-gray-300 focus:ring-[#3B82F6]"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    Kích hoạt hiển thị ngay
                  </span>
                </label>
              </div>

            </div>

            {/* ─── RIGHT COLUMN: INTERACTIVE 3D LIVE PREVIEW (5 Cols) ─── */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <Banner3DPreview
                formData={formData}
                previewImage={filePreviews.image}
              />
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-7 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              )}
              {isEditing ? "Lưu thay đổi" : "Tạo Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { bannerService } from "@/services/api/admin/bannerService";
import { BANNER_SPECS_CONFIG } from "@/constants/bannerPresets";

const DEFAULT_FORM_DATA = {
  position: "hero_slide",
  title: "",
  badge: "",
  description: "",
  image_url: "",
  inline_img_1: "",
  inline_img_2: "",
  primary_cta_label: "Khám phá ngay",
  primary_cta_link: "/products",
  ambient_color: "rgba(59, 130, 246, 0.28)",
  chip_badge: "",
  metric_value: "",
  metric_label: "",
  specs: [
    { label: "Màn hình", value: "Super Retina XDR 6,9 inch · 120Hz" },
    { label: "Thiết kế", value: "Nhôm nguyên khối" },
    { label: "Thời lượng pin", value: "Lên đến 40 giờ" },
  ],
  display_order: 1,
  status: 1,
};

export function useAdminBanners() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState("all");

  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);

  // File previews & raw files
  const [filePreviews, setFilePreviews] = useState({
    image: null,
    inline1: null,
    inline2: null,
  });

  // Client-side pre-flight quality alerts
  const [qualityAlerts, setQualityAlerts] = useState({});

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = selectedPosition !== "all" ? { position: selectedPosition } : {};
      const data = await bannerService.getBanners(params);
      setBanners(data);
    } catch (err) {
      setError(err?.message || "Lỗi khi tải danh sách banner");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPosition]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const params = selectedPosition !== "all" ? { position: selectedPosition } : {};
        const data = await bannerService.getBanners(params);
        if (!ignore) {
          setBanners(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.message || "Lỗi khi tải danh sách banner");
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [selectedPosition]);

  const handleTabChange = (pos) => {
    setSelectedPosition(pos);
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({
      ...DEFAULT_FORM_DATA,
      position: selectedPosition === "all" ? "hero_slide" : selectedPosition,
      display_order: banners.length + 1,
    });
    setFilePreviews({ image: null, inline1: null, inline2: null });
    setQualityAlerts({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      position: banner.position || "hero_slide",
      title: banner.title || "",
      badge: banner.badge || "",
      description: banner.description || "",
      image_url: banner.image_url || "",
      inline_img_1: banner.inline_img_1 || "",
      inline_img_2: banner.inline_img_2 || "",
      primary_cta_label: banner.primary_cta_label || "Khám phá ngay",
      primary_cta_link: banner.primary_cta_link || "/products",
      ambient_color: banner.ambient_color || "rgba(59, 130, 246, 0.28)",
      chip_badge: banner.chip_badge || "",
      metric_value: banner.metric_value || "",
      metric_label: banner.metric_label || "",
      specs: Array.isArray(banner.specs) && banner.specs.length > 0 ? banner.specs : DEFAULT_FORM_DATA.specs,
      display_order: banner.display_order ?? 1,
      status: banner.status ?? 1,
    });
    setFilePreviews({
      image: banner.image_url || null,
      inline1: banner.inline_img_1 || null,
      inline2: banner.inline_img_2 || null,
    });
    setQualityAlerts({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSpecChange = (index, field, value) => {
    setFormData((prev) => {
      const newSpecs = [...prev.specs];
      if (!newSpecs[index]) newSpecs[index] = { label: "", value: "" };
      newSpecs[index] = { ...newSpecs[index], [field]: value };
      return { ...prev, specs: newSpecs };
    });
  };

  /**
   * Pre-flight image analysis: kiểm tra kích thước, tỷ lệ và kênh alpha
   */
  const handleFileSelect = (fieldKey, file) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFilePreviews((prev) => ({ ...prev, [fieldKey]: previewUrl }));

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const ratio = width / height;

      const posConfig = BANNER_SPECS_CONFIG[formData.position] || BANNER_SPECS_CONFIG.hero_slide;
      const spec = posConfig[fieldKey === "image" ? "device" : fieldKey];

      const alerts = [];

      if (spec) {
        if (width < spec.minWidth || height < spec.minHeight) {
          alerts.push(`Kích thước (${width}x${height}px) nhỏ hơn tối thiểu khuyến nghị (${spec.minWidth}x${spec.minHeight}px).`);
        }

        const diffRatio = Math.abs(ratio - spec.aspectRatio);
        if (diffRatio > 0.08) {
          alerts.push(`Tỷ lệ ảnh (${ratio.toFixed(2)}) lệch chuẩn ${spec.ratioLabel}.`);
        }

        if (spec.requireAlpha && file.type === "image/jpeg") {
          alerts.push("Ảnh vị trí 3D bắt buộc phải tách nền trong suốt (PNG hoặc WebP).");
        }
      }

      setQualityAlerts((prev) => ({
        ...prev,
        [fieldKey]: {
          width,
          height,
          ratio: ratio.toFixed(2),
          alerts,
          isAcceptable: alerts.length === 0,
        },
      }));
    };
  };

  const handleToggleStatus = async (banner) => {
    try {
      await bannerService.toggleStatus(banner.id, banner.status);
      setNotification({
        isOpen: true,
        message: `Đã ${banner.status === 1 ? "ẩn" : "kích hoạt"} banner "${banner.title}"`,
        type: "success",
      });
      fetchBanners();
    } catch {
      setNotification({
        isOpen: true,
        message: "Không thể cập nhật trạng thái banner",
        type: "error",
      });
    }
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa banner "${banner.title}"?`)) return;

    try {
      await bannerService.deleteBanner(banner.id);
      setNotification({
        isOpen: true,
        message: `Đã xóa banner "${banner.title}" thành công`,
        type: "success",
      });
      fetchBanners();
    } catch {
      setNotification({
        isOpen: true,
        message: "Không thể xóa banner",
        type: "error",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const payload = {
        ...formData,
        image_url: filePreviews.image || formData.image_url,
        inline_img_1: filePreviews.inline1 || formData.inline_img_1,
        inline_img_2: filePreviews.inline2 || formData.inline_img_2,
      };

      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, payload);
        setNotification({
          isOpen: true,
          message: "Cập nhật banner thành công",
          type: "success",
        });
      } else {
        await bannerService.createBanner(payload);
        setNotification({
          isOpen: true,
          message: "Thêm mới banner thành công",
          type: "success",
        });
      }

      handleCloseModal();
      fetchBanners();
    } catch (err) {
      setNotification({
        isOpen: true,
        message: err?.message || "Có lỗi xảy ra khi lưu banner",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}

import Notification from "@/components/notification";
import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";
import { useAdminBrands } from "@/hooks/admin/useAdminBrands";
import BrandForm from "@/components/admin/brands/brandForm";
import BrandTable from "@/components/admin/brands/brandTable";

export default function BrandManagement() {
  const {
    brands,
    isLoading,
    error,
    notification,
    closeNotification,
    formData,
    logoPreview,
    handleInputChange,
    handleLogoChange,
    handleSubmit,
  } = useAdminBrands();

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] p-4 md:p-6 lg:p-8"
      style={{ fontFamily: SF_TEXT }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1
            className="text-[34px] font-semibold text-[#1d1d1f]"
            style={{
              fontFamily: SF_DISPLAY,
              letterSpacing: "-0.374px",
              lineHeight: 1.1,
            }}
          >
            Quản lý thương hiệu
          </h1>
          <p className="mt-1 text-[17px] text-[#7a7a7a]">
            Thêm mới, cập nhật thông tin và quản lý danh sách các đối tác thương hiệu.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <BrandForm
              formData={formData}
              logoPreview={logoPreview}
              isLoading={isLoading}
              error={error}
              onChange={handleInputChange}
              onLogoChange={handleLogoChange}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="lg:col-span-2">
            <BrandTable brands={brands} />
          </div>
        </div>
      </div>

      <Notification
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
    </div>
  );
}

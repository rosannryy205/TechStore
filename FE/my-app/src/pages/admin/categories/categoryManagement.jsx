import Loading from "@/components/loading";
import Notification from "@/components/notification";
import { SF_DISPLAY, SF_TEXT } from "@/constants/typography";
import { useAdminCategories } from "@/hooks/admin/useAdminCategories";
import CategoryForm from "@/components/admin/categories/categoryForm";
import CategoryTable from "@/components/admin/categories/categoryTable";

export default function CategoryManagement() {
  const {
    categories,
    brands,
    isLoading,
    error,
    notif,
    closeNotification,
    formData,
    handleInputChange,
    handleSubmit,
  } = useAdminCategories();

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] p-4 md:p-6 lg:p-8"
      style={{ fontFamily: SF_TEXT }}
    >
      <Notification
        isOpen={notif.isOpen}
        message={notif.message}
        type={notif.type}
        onClose={closeNotification}
      />
      <Loading shouldShow={isLoading} variant="fullscreen" />

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
            Quản lý danh mục
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CategoryForm
              formData={formData}
              brands={brands}
              isLoading={isLoading}
              error={error}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="lg:col-span-2">
            <CategoryTable categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
}

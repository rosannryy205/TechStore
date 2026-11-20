import { useMemo, useState } from "react";
import { useProductReviews } from "@/hooks/client/useProductReviews";
import CommentForm from "./commentForm";
import CommentItem from "./commentItem";

// Số comment hiển thị mỗi lần load.
const INITIAL_VISIBLE_COUNT = 5;
const LOAD_MORE_COUNT = 5;

/**
 * CommentSection
 * - Hiển thị danh sách và các thao tác review qua useProductReviews.
 * - Loading state: Skeleton UI.
 * - Empty state: chưa có bình luận.
 * - Error state: lỗi tải dữ liệu.
 * - Load more: hiển thị giới hạn + nút xem thêm.
 * - Chỉ admin mới thấy nút reply (isAdmin từ user.role).
 * - Comment "pending" hiển thị mờ + badge chờ duyệt.
 */
export default function CommentSection({
  productId,
  isAuthenticated,
  user,
  onRequireLogin,
}) {
  const {
    comments,
    loading,
    error,
    isSubmitting,
    loadReviews,
    handleSubmitComment,
    handleLike,
    handleReply,
  } = useProductReviews(productId);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const isAdmin = user?.role === "admin";
  const currentUserId = user?.id;

  // Kiểm tra user đã mua hàng chưa (mặc định false khi chưa đăng nhập).
  const hasPurchased = isAuthenticated;

  // Sắp xếp theo thời gian mới nhất (backend đã sắp, giữ nguyên).
  const sortedComments = useMemo(() => comments, [comments]);

  // Comment hiển thị (giới hạn).
  const visibleComments = useMemo(
    () => sortedComments.slice(0, visibleCount),
    [sortedComments, visibleCount],
  );

  const hasMore = visibleCount < sortedComments.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
  };

  // Skeleton loading.
  if (loading) {
    return (
      <div
        className="w-full"
        style={{
          fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif",
        }}
      >
        <div className="mt-10">
          <div className="h-8 w-64 bg-[#f5f5f7] rounded animate-pulse" />
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-[18px] border border-[#e0e0e0] bg-white p-5 sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#f5f5f7] animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-[#f5f5f7] rounded animate-pulse" />
                    <div className="mt-2 h-3 w-24 bg-[#f5f5f7] rounded animate-pulse" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full bg-[#f5f5f7] rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-[#f5f5f7] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state.
  if (error && comments.length === 0) {
    return (
      <div
        className="w-full rounded-[18px] border border-[#e0e0e0] bg-[#fafafc] p-8 text-center"
        style={{
          fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif",
        }}
      >
        <p className="text-[17px] font-normal tracking-[-0.374px] leading-[1.47] text-[#1d1d1f]">
          {error}
        </p>
        <button
          type="button"
          onClick={loadReviews}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-[#0066cc] text-white text-[14px] font-normal px-5 py-2 hover:bg-[#0071e3] active:scale-95 transition-all cursor-pointer border-none outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
          style={{
            fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif",
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      style={{
        fontFamily: "SF Pro Text, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2
          className="text-[24px] sm:text-[28px] font-semibold tracking-[-0.374px] leading-[1.1] text-[#1d1d1f]"
          style={{
            fontFamily: "SF Pro Display, system-ui, -apple-system, sans-serif",
          }}
        >
          Đánh giá sản phẩm
        </h2>
        <span className="text-[14px] text-[#7a7a7a]">
          {sortedComments.length} đánh giá
        </span>
      </div>

      {/* Thông báo lỗi khi gửi (nhưng vẫn còn comment cũ) */}
      {error && comments.length > 0 && (
        <div className="mt-4 rounded-[11px] bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {error}
        </div>
      )}

      {/* Form bình luận */}
      <div className="mt-6">
        <CommentForm
          isAuthenticated={isAuthenticated}
          hasPurchased={hasPurchased}
          onSubmit={handleSubmitComment}
          onRequireLogin={onRequireLogin}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Danh sách bình luận */}
      <div className="mt-8 space-y-4">
        {visibleComments.length === 0 ? (
          // Empty state.
          <div className="rounded-[18px] border border-[#e0e0e0] bg-[#fafafc] p-8 text-center">
            <p className="text-[17px] font-normal tracking-[-0.374px] leading-[1.47] text-[#1d1d1f]">
              Chưa có đánh giá nào.
            </p>
            <p className="mt-2 text-[14px] text-[#7a7a7a]">
              Hãy là người đầu tiên đánh giá sản phẩm này!
            </p>
          </div>
        ) : (
          <>
            {visibleComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={user}
                currentUserId={currentUserId}
                onLike={handleLike}
                onReply={handleReply}
                isAdmin={isAdmin}
              />
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="inline-flex items-center justify-center rounded-full bg-transparent text-[#0066cc] text-[15px] font-normal px-6 py-2.5 border border-[#0066cc] hover:bg-[rgba(0,102,204,0.06)] active:scale-95 transition-all cursor-pointer outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                  style={{
                    fontFamily:
                      "SF Pro Text, system-ui, -apple-system, sans-serif",
                  }}
                >
                  Xem thêm bình luận ({sortedComments.length - visibleCount})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

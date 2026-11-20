import { useCallback, useEffect, useRef, useState } from "react";
import { reviewService } from "@/services/api/client/reviewService";

export function useProductReviews(productId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reviewRequest = useRef(null);
  const productScope = useRef(null);

  const loadReviews = useCallback(async () => {
    if (!productId) return;
    reviewRequest.current?.abort();
    const controller = new AbortController();
    const { signal } = controller;
    reviewRequest.current = controller;
    setLoading(true);
    setError(null);

    try {
      const reviews = await reviewService.getReviews(productId, { signal });
      if (!signal.aborted) setComments(reviews);
    } catch {
      if (signal.aborted) return;
      setError("Không thể tải bình luận. Vui lòng thử lại.");
      setComments([]);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    productScope.current = {};
    const load = async () => {
      setIsSubmitting(false);
      await loadReviews();
    };
    load();
    return () => {
      productScope.current = null;
      reviewRequest.current?.abort();
    };
  }, [loadReviews]);

  const handleSubmitComment = async ({ rating, formData }) => {
    const scope = productScope.current;
    setIsSubmitting(true);
    try {
      formData.append("productId", String(productId));
      formData.append("rating", String(rating));
      await reviewService.createReview(formData);
      if (productScope.current === scope) await loadReviews();
    } catch (error) {
      if (productScope.current === scope) {
        setError(error?.message || "Không thể gửi bình luận.");
      }
    } finally {
      if (productScope.current === scope) setIsSubmitting(false);
    }
  };

  const handleLike = async (comment) => {
    const scope = productScope.current;
    try {
      const payload = await reviewService.likeReview(comment.id);
      if (productScope.current !== scope) return;
      setComments((previousComments) =>
        previousComments.map((previousComment) =>
          previousComment.id === comment.id
            ? { ...previousComment, likeCount: payload?.data?.likeCount ?? previousComment.likeCount }
            : previousComment,
        ),
      );
    } catch {
      // Giữ số lượt thích đã hiển thị khi server từ chối.
    }
  };

  const handleReply = async (comment, replyText) => {
    const scope = productScope.current;
    try {
      await reviewService.replyToReview(comment.id, replyText);
      if (productScope.current === scope) await loadReviews();
    } catch {
      // Giữ danh sách hiện tại khi phản hồi chưa được lưu.
    }
  };

  return { comments, loading, error, isSubmitting, loadReviews, handleSubmitComment, handleLike, handleReply };
}

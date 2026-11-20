import { useEffect, useRef, useState } from "react";
import { reviewService } from "@/services/api/client/reviewService";

export function useProductReviews(productId, userId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [revision, setRevision] = useState(0);
  const reviewSession = useRef(null);
  const isSubmitting = Boolean(submission && !submission.signal.aborted
    && submission.productId === productId && submission.userId === userId);

  const reloadReviews = () => setRevision((previousRevision) => previousRevision + 1);

  useEffect(() => {
    const controller = new AbortController();
    reviewSession.current = controller;
    return () => controller.abort();
  }, [productId, userId]);

  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    const loadReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await reviewService.getReviews(productId, { signal: controller.signal });
        if (!controller.signal.aborted) setComments(payload?.data ?? []);
      } catch {
        if (controller.signal.aborted) return;
        setError("Không thể tải bình luận. Vui lòng thử lại.");
        setComments([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadReviews();
    return () => controller.abort();
  }, [productId, revision]);

  const handleSubmitComment = async ({ rating, formData }) => {
    const signal = reviewSession.current?.signal;
    if (!signal || signal.aborted) return;
    setSubmission({ productId, userId, signal });
    try {
      formData.append("productId", String(productId));
      formData.append("rating", String(rating));
      await reviewService.createReview(formData, { signal });
      if (!signal.aborted) reloadReviews();
    } catch (error) {
      if (!signal.aborted) setError(error?.message || "Không thể gửi bình luận.");
    } finally {
      if (!signal.aborted) setSubmission(null);
    }
  };

  const handleLike = async (comment) => {
    const signal = reviewSession.current?.signal;
    if (!signal || signal.aborted) return;

    try {
      const payload = await reviewService.likeReview(comment.id, { signal });
      if (signal.aborted) return;
      setComments((previousComments) =>
        previousComments.map((previousComment) =>
          previousComment.id === comment.id
            ? { ...previousComment, likeCount: payload?.data?.likeCount ?? previousComment.likeCount }
            : previousComment,
        ),
      );
    } catch (error) {
      if (!signal.aborted) setError(error?.message || "Không thể thích bình luận.");
    }
  };

  const handleReply = async (comment, replyText) => {
    const signal = reviewSession.current?.signal;
    if (!signal || signal.aborted) return;

    try {
      await reviewService.replyToReview(comment.id, replyText, { signal });
      if (!signal.aborted) reloadReviews();
    } catch (error) {
      if (!signal.aborted) setError(error?.message || "Không thể trả lời bình luận.");
    }
  };

  return {
    comments,
    loading,
    error,
    isSubmitting,
    reloadReviews,
    handleSubmitComment,
    handleLike,
    handleReply,
  };
}

import { httpRequest } from "@/services/api/httpClient";

export const reviewService = {
  getReviews(productId, { signal } = {}) {
    return httpRequest(`/api/reviews?productId=${productId}`, {
      credentials: "same-origin",
      signal,
    });
  },

  createReview(formData, { signal } = {}) {
    return httpRequest("/api/reviews", { method: "POST", body: formData, signal });
  },

  likeReview(reviewId, { signal } = {}) {
    return httpRequest(`/api/reviews/${reviewId}/like`, { method: "POST", signal });
  },

  replyToReview(reviewId, content, { signal } = {}) {
    return httpRequest(`/api/reviews/${reviewId}/replies`, {
      method: "POST",
      body: JSON.stringify({ content }),
      signal,
    });
  },
};

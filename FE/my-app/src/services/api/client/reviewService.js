import { httpRequest } from "@/services/api/httpClient";

export const reviewService = {
  async getReviews(productId, { signal } = {}) {
    const query = new URLSearchParams({ productId });
    const payload = await httpRequest(`/api/reviews?${query}`, {
      credentials: "same-origin",
      signal,
    });
    return payload?.data ?? [];
  },

  createReview(formData) {
    return httpRequest("/api/reviews", { method: "POST", body: formData });
  },

  likeReview(reviewId) {
    return httpRequest(`/api/reviews/${reviewId}/like`, { method: "POST" });
  },

  replyToReview(reviewId, content) {
    return httpRequest(`/api/reviews/${reviewId}/replies`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },
};

import { apiPost, apiPatch, apiDelete } from "./api";

export function createReview(businessId, review, { signal } = {}) {
  return apiPost(`/businesses/${businessId}/reviews`, review, { signal });
}

export function updateReview(reviewId, review, { signal } = {}) {
  return apiPatch(`/reviews/${reviewId}`, review, { signal });
}

export function deleteReview(reviewId, { signal } = {}) {
  return apiDelete(`/reviews/${reviewId}`, { signal });
}
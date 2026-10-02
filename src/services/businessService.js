import { apiGet, toList } from "./api";

// Public list of approved businesses, with optional search and category
export async function getBusinesses({ search, categoryId, signal } = {}) {
  const data = await apiGet("/businesses", {
    params: { search, category_id: categoryId },
    signal,
  });
  return toList(data);
}

// One business
export function getBusiness(businessId, { signal } = {}) {
  return apiGet(`/businesses/${businessId}`, { signal });
}

// Active branches of a business (each has is_open_now)
export async function getBusinessBranches(businessId, { signal } = {}) {
  const data = await apiGet(`/businesses/${businessId}/branches`, { signal });
  return toList(data);
}

// Active announcements. With branchId: business-wide ones plus that branch's.
export async function getBusinessAnnouncements(businessId, { branchId, signal } = {}) {
  const data = await apiGet(`/businesses/${businessId}/announcements`, {
    params: { branch_id: branchId },
    signal,
  });
  return toList(data);
}

// { average_rating, review_count, reviews }
export function getBusinessReviews(businessId, { signal } = {}) {
  return apiGet(`/businesses/${businessId}/reviews`, { signal });
}
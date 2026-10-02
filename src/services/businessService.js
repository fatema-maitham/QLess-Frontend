import { apiGet, toList } from "./api";

// Public list of approved businesses, with optional search and category
export async function getBusinesses({ search, categoryId, signal } = {}) {
  const data = await apiGet("/businesses", {
    params: { search, category_id: categoryId },
    signal,
  });
  return toList(data);
}
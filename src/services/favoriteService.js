import { apiGet, apiPost, apiDelete, toList } from "./api";

export async function getFavorites({ signal } = {}) {
  const data = await apiGet("/favorites", { signal });
  return toList(data);
}

export function addFavorite(businessId, { signal } = {}) {
  return apiPost(
    "/favorites",
    { business_id: Number(businessId) },
    { signal }
  );
}

export function removeFavorite(businessId, { signal } = {}) {
  return apiDelete(`/favorites/${businessId}`, { signal });
}
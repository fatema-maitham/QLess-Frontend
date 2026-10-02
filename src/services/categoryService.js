import { apiGet, toList } from "./api";

// Public list of categories
export async function getCategories({ signal } = {}) {
  const data = await apiGet("/categories", { signal });
  return toList(data);
}
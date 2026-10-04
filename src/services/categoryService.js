import { apiDelete, apiGet, apiPatch, apiPost, toList } from "./api";

// Public list of categories
export async function getCategories({ signal } = {}) {
  const data = await apiGet("/categories", { signal });
  return toList(data);
}

// Admin: add a category ({ name, description })
export function createCategory(category) {
  return apiPost("/categories", category);
}

// Admin: change a category's name or description
export function updateCategory(categoryId, category) {
  return apiPatch(`/categories/${categoryId}`, category);
}

// Admin: delete a category (its businesses stay, without a category)
export function deleteCategory(categoryId) {
  return apiDelete(`/categories/${categoryId}`);
}
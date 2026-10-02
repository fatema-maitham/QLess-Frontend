import { apiGet } from "./api";

// The signed-in user: { id, name, email, role, ... }
// Throws an error with status 401 when nobody is signed in.
export function getMe({ signal } = {}) {
  return apiGet("/users/me", { signal });
}
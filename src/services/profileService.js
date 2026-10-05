import { apiGet, apiPatch } from "./api";

// The signed-in user's own account (name, email, phone, profile_image, role...)
export function getMe({ signal } = {}) {
  return apiGet("/users/me", { signal });
}

// Change any of: name, email, phone, profile_image.
// To change the password send current_password + new_password.
export function updateMe(changes) {
  return apiPatch("/users/me", changes);
}
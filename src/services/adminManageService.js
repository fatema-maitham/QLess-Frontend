import { apiGet, apiPatch, toList } from "./api";

// ---------- Dashboard ----------

// Platform numbers: users, businesses, branches, queues ...
export function getAdminDashboard({ signal } = {}) {
  return apiGet("/admin/dashboard", { signal });
}

// ---------- Businesses ----------

// approval_status: draft | pending | approved | rejected (empty = all)
export async function getAdminBusinesses({ approval_status, signal } = {}) {
  const data = await apiGet("/admin/businesses", { params: { approval_status }, signal });
  return toList(data);
}

export function approveBusiness(id) {
  return apiPatch(`/admin/businesses/${id}`, { approval_status: "approved" });
}

export function rejectBusiness(id, reason) {
  return apiPatch(`/admin/businesses/${id}`, { approval_status: "rejected", rejection_reason: reason });
}

export function setBusinessActive(id, isActive) {
  return apiPatch(`/admin/businesses/${id}`, { is_active: isActive });
}

// ---------- Users ----------

// role: customer | owner | staff | admin, search: name or email
export async function getAdminUsers({ role, search, signal } = {}) {
  const data = await apiGet("/admin/users", { params: { role, search }, signal });
  return toList(data);
}

export function setUserActive(id, isActive) {
  return apiPatch(`/admin/users/${id}`, { is_active: isActive });
}

export function liftRestriction(id) {
  return apiPatch(`/admin/users/${id}`, { restricted_until: null });
}

// ---------- Branches ----------

export async function getAdminBranches({ signal } = {}) {
  const data = await apiGet("/admin/branches", { signal });
  return toList(data);
}

export function setBranchActive(id, isActive) {
  return apiPatch(`/admin/branches/${id}`, { is_active: isActive });
}

// ---------- Audit logs ----------

// entity_type: business | user | branch (empty = all)
export async function getAuditLogs({ entity_type, signal } = {}) {
  const data = await apiGet("/admin/audit-logs", { params: { entity_type, limit: 200 }, signal });
  return toList(data);
}
import { apiGet, toList } from "./api";

// One branch (has business_id and is_open_now)
export function getBranch(branchId, { signal } = {}) {
  return apiGet(`/branches/${branchId}`, { signal });
}

// Active services in a branch
export async function getBranchServices(branchId, { signal } = {}) {
  const data = await apiGet(`/branches/${branchId}/services`, { signal });
  return toList(data);
}

// Opening hours, Monday first
export async function getBranchHours(branchId, { signal } = {}) {
  const data = await apiGet(`/branches/${branchId}/hours`, { signal });
  return toList(data);
}

// Queues in a branch (each has status and waiting_count)
export async function getBranchQueues(branchId, { signal } = {}) {
  const data = await apiGet(`/branches/${branchId}/queues`, { signal });
  return toList(data);
}
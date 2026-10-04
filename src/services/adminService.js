import { apiGet, apiPatch, toList } from "./api";

// ---------- Suspicious activity ----------

// Flagged records. status: open | reviewed | dismissed, severity: low | medium | high
export async function getSuspiciousActivity({ status, severity, signal } = {}) {
  const data = await apiGet("/admin/suspicious-activity", {
    params: { status, severity },
    signal,
  });
  return toList(data);
}

// Mark one record as reviewed or dismissed. The note is saved in the audit log.
export function updateSuspiciousActivity(activityId, { status, note }) {
  return apiPatch(`/admin/suspicious-activity/${activityId}`, {
    status,
    note: note || undefined,
  });
}

// ---------- Monitoring ----------

// Every queue on the platform with live counts. status: open | paused | closed
export async function getAdminQueues({ status, signal } = {}) {
  const data = await apiGet("/admin/queues", { params: { status }, signal });
  return toList(data);
}

// Every review, newest first. rating: 1 to 5
export async function getAdminReviews({ rating, signal } = {}) {
  const data = await apiGet("/admin/reviews", { params: { rating }, signal });
  return toList(data);
}
import { apiGet, apiPatch, apiPost } from "./api";

// Owner/staff: every ticket in a queue (all statuses), lowest number first
export function getQueueEntries(queueId, { signal } = {}) {
  return apiGet(`/queues/${queueId}/entries`, { signal });
}

// Owner/staff: call the next waiting person. Returns { message, queue, entry }
export function callNext(queueId) {
  return apiPost(`/queues/${queueId}/call-next`);
}

// Owner/staff: "checked_in", "completed" or "no_show"
export function markEntry(entryId, status) {
  return apiPatch(`/queue-entries/${entryId}`, { status });
}

// Staff: my business, branch and its queues
export function getStaffMe({ signal } = {}) {
  return apiGet("/staff/me", { signal });
}
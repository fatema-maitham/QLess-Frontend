import { apiDelete, apiGet, apiPatch, apiPost } from "./api";

// One queue (has status and waiting_count)
export function getQueue(queueId, { signal } = {}) {
  return apiGet(`/queues/${queueId}`, { signal });
}

// Owner: make a new queue in a branch. It starts "closed".
export function createQueue(branchId, data) {
  return apiPost(`/branches/${branchId}/queues`, data);
}

// Owner: change name, service, capacity or timings
export function updateQueue(queueId, data) {
  return apiPatch(`/queues/${queueId}`, data);
}

// Owner or staff: "open", "paused" or "closed"
export function setQueueStatus(queueId, status) {
  return apiPatch(`/queues/${queueId}`, { status });
}

// Owner: only works when nobody is waiting
export function deleteQueue(queueId) {
  return apiDelete(`/queues/${queueId}`);
}
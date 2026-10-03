import { apiDelete, apiGet, apiPatch, apiPost } from "./api";

// Customer: join a queue. Returns the new ticket (has id and queue_number).
export function joinQueue(queueId) {
  return apiPost(`/queues/${queueId}/entries`);
}

// Customer: all my tickets as { active: [...], history: [...] }
export async function getMyTickets({ signal } = {}) {
  const data = await apiGet("/queue-entries/me", { signal });
  return {
    active: data?.active || [],
    history: data?.history || [],
  };
}

// One ticket with position, people ahead, wait and return time
export function getTicket(entryId, { signal } = {}) {
  return apiGet(`/queue-entries/${entryId}`, { signal });
}

// Customer: tell the business "I'm on my way" (true) or undo it (false)
export function setOnTheWay(entryId, onTheWay) {
  return apiPatch(`/queue-entries/${entryId}`, { on_the_way: onTheWay });
}

// Customer: check in after being called
export function checkIn(entryId) {
  return apiPatch(`/queue-entries/${entryId}`, { status: "checked_in" });
}

// Customer: leave the queue (the ticket becomes "cancelled")
export function leaveQueue(entryId) {
  return apiDelete(`/queue-entries/${entryId}`);
}
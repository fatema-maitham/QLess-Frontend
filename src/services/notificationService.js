import { apiDelete, apiGet, apiPatch } from "./api";

// Tells every bell and list on the page to reload (after mark read, delete, ...)
export const NOTIFICATIONS_CHANGED = "qless:notifications-changed";

function announceChange() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
}

// { unread_count, notifications: [...] }, newest first
export async function getNotifications({ unreadOnly = false, signal } = {}) {
  const data = await apiGet("/notifications", {
    params: unreadOnly ? { unread_only: true } : undefined,
    signal,
  });
  return {
    unreadCount: data?.unread_count || 0,
    notifications: data?.notifications || [],
  };
}

// Mark one as read (true) or unread (false)
export async function markRead(notificationId, isRead = true) {
  const saved = await apiPatch(`/notifications/${notificationId}`, { is_read: isRead });
  announceChange();
  return saved;
}

export async function markAllRead() {
  const result = await apiPatch("/notifications/read-all");
  announceChange();
  return result;
}

export async function deleteNotification(notificationId) {
  const result = await apiDelete(`/notifications/${notificationId}`);
  announceChange();
  return result;
}
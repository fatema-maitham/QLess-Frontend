// Same rules as the backend (services/no_shows.py):
// every 3rd no-show blocks joining queues for 7 days,
// and the customer is warned one no-show before that.
export const NO_SHOWS_BEFORE_RESTRICTION = 3;
export const RESTRICTION_DAYS = 7;

/**
 * Works out the customer's no-show state from GET /users/me.
 * Returns { state: "restricted" | "warning" | "ok", count, until }
 */
export function noShowStatus(user) {
  const count = user?.no_show_count || 0;
  const until = user?.restricted_until ? new Date(user.restricted_until) : null;

  if (until && until > new Date()) {
    return { state: "restricted", count, until };
  }

  if (count > 0 && count % NO_SHOWS_BEFORE_RESTRICTION === NO_SHOWS_BEFORE_RESTRICTION - 1) {
    return { state: "warning", count, until: null };
  }

  return { state: "ok", count, until: null };
}

// Date -> "Sat 10 Oct, 2:15 PM"
export function untilText(date) {
  return date.toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Date -> "in 6 days", "in 5 hours", "in 20 minutes"
export function timeLeftText(date) {
  const minutes = Math.max(Math.ceil((date - new Date()) / 60000), 1);
  if (minutes < 60) return `in ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `in ${hours} ${hours === 1 ? "hour" : "hours"}`;
  const days = Math.ceil(hours / 24);
  return `in ${days} ${days === 1 ? "day" : "days"}`;
}
// Label + colour class for every ticket status the backend sends
export const TICKET_STATUS = {
  waiting: { label: "Waiting", className: "tk-chip--wait" },
  called: { label: "Your turn", className: "tk-chip--turn" },
  checked_in: { label: "Checked in", className: "tk-chip--in" },
  completed: { label: "Done", className: "tk-chip--done" },
  cancelled: { label: "Left", className: "tk-chip--off" },
  no_show: { label: "No-show", className: "tk-chip--warn" },
};

// Tickets that are still going (the page keeps refreshing these)
export const LIVE_STATUSES = ["waiting", "called", "checked_in"];

// "2026-10-03T09:40:00" -> "9:40 AM"
export function clockTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// "2026-10-03T09:40:00" -> "3 Oct"
export function shortDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString([], { day: "numeric", month: "short" });
}

// 75 -> "1 h 15 min"
export function minutesText(minutes) {
  if (minutes === null || minutes === undefined) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

// 0 people -> "You're next", 1 -> "1 person ahead", 4 -> "4 people ahead"
export function aheadText(count) {
  if (!count) return "You're next";
  return count === 1 ? "1 person ahead" : `${count} people ahead`;
}
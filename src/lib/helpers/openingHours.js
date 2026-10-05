// Helpers for a branch's opening hours (one row per day from the backend)

// Same order as JavaScript's Date.getDay(): 0 = Sunday
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// "09:00:00" -> "9:00 AM"
export function formatTime(value) {
  if (!value) return "";
  const [h, m] = value.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

// When does the branch open next? -> "today at 8:00 AM", "tomorrow at 8:00 AM", "Sunday at 8:00 AM"
// Returns null when the branch has no opening days set.
export function nextOpening(hours, now = new Date()) {
  if (!hours?.length) return null;

  const byDay = Object.fromEntries(hours.map((h) => [h.day_of_week, h]));
  const timeNow = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  for (let i = 0; i < 8; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    const name = DAYS[day.getDay()];
    const h = byDay[name];

    if (!h || h.is_closed || !h.open_time) continue;
    // Today only counts if it hasn't opened yet
    if (i === 0 && h.open_time.slice(0, 5) <= timeNow) continue;

    const when = i === 0 ? "today" : i === 1 ? "tomorrow" : name.charAt(0).toUpperCase() + name.slice(1);
    return `${when} at ${formatTime(h.open_time)}`;
  }

  return null;
}
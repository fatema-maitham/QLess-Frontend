// Sunday first, like the week in Bahrain
export const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const dayLabel = (day) => day.charAt(0).toUpperCase() + day.slice(1);

// "08:00:00" -> "8:00 AM"
export function formatTime(value) {
  if (!value) return "";
  const [h, m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

// One day's hours as text: "8:00 AM – 2:00 PM", "Closed" or "Not set"
export function hoursText(hour) {
  if (!hour) return "Not set";
  if (hour.is_closed) return "Closed";
  return `${formatTime(hour.open_time)} – ${formatTime(hour.close_time)}`;
}

// Today's day name, e.g. "monday"
export const todayName = () => DAYS[new Date().getDay()];

// The first letter of a name, for avatars
export const initial = (name) => (name || "?").trim().charAt(0).toUpperCase();
// "2026-10-04T12:30:00" -> "4 Oct 2026, 12:30"
export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "frequent_cancellations" -> "Frequent cancellations"
export function label(text) {
  if (!text) return "";
  const words = text.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
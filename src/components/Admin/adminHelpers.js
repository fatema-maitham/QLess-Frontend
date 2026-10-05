// "frequent_cancellations" -> "Frequent cancellations"
export function label(text) {
  if (!text) return "";
  const words = text.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// "12:05"
export const clock = (value) =>
  value ? new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "";

// "1 business" / "3 businesses"
export const plural = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;
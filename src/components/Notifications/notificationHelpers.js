import {
  Bell,
  BellRinging,
  CalendarCheck,
  Clock,
  Prohibit,
  Star,
  UserMinus,
  Warning,
} from "@phosphor-icons/react";

// Icon, colour and where to go for each notification type the backend sends
export const NOTIFICATION_TYPES = {
  called: { Icon: BellRinging, tone: "hot", to: "/my-tickets" },
  turn_approaching: { Icon: Clock, tone: "warm", to: "/my-tickets" },
  no_show: { Icon: UserMinus, tone: "ink", to: "/my-tickets" },
  no_show_warning: { Icon: Warning, tone: "warm", to: "/my-tickets" },
  restricted: { Icon: Prohibit, tone: "ink", to: null },
  booking: { Icon: CalendarCheck, tone: "warm", to: null },
  review: { Icon: Star, tone: "warm", to: null },
  review_removed: { Icon: Star, tone: "ink", to: null },
};

export function typeInfo(type) {
  return NOTIFICATION_TYPES[type] || { Icon: Bell, tone: "plain", to: null };
}

// "just now", "5 min ago", "3 h ago", "yesterday", "12 Oct"
export function timeAgo(value) {
  if (!value) return "";
  const date = new Date(value);
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  if (hours < 48) return "yesterday";
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

// True when the date is today
export function isToday(value) {
  if (!value) return false;
  return new Date(value).toDateString() === new Date().toDateString();
}

// 7 -> "7", 120 -> "99+"
export function badgeText(count) {
  return count > 99 ? "99+" : String(count);
}
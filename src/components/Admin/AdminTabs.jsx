import { NavLink } from "react-router";

const LINKS = [
  { to: "/admin/queues", label: "Queues" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/suspicious-activity", label: "Suspicious activity" },
];

// Tabs to move between the admin monitoring pages
export default function AdminTabs() {
  return (
    <nav className="ad-tabs" aria-label="Admin monitoring">
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `ad-tab ${isActive ? "is-active" : ""}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
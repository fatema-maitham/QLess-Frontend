import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Bell } from "@phosphor-icons/react";
import {
  NOTIFICATIONS_CHANGED,
  getNotifications,
  markAllRead,
  markRead,
} from "../../services/notificationService";
import { badgeText, timeAgo, typeInfo } from "./notificationHelpers";
import "./Notifications.css";

const REFRESH_MS = 30000;
const PREVIEW_COUNT = 5;

// Bell with the unread count. Click it to see the latest notifications.
export default function NotificationBell() {
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ unreadCount: 0, notifications: [] });

  const load = useCallback(() => {
    getNotifications()
      .then(setData)
      .catch(() => {
        // keep the last count if a refresh fails
      });
  }, []);

  // Load now, every 30 seconds, when the tab comes back, and after any change
  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && load();

    window.addEventListener(NOTIFICATIONS_CHANGED, load);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      window.removeEventListener(NOTIFICATIONS_CHANGED, load);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) load();
    setOpen(!open);
  };

  const openItem = async (item) => {
    setOpen(false);
    if (!item.is_read) await markRead(item.id).catch(() => { });
    const { to } = typeInfo(item.type);
    navigate(to || "/notifications");
  };

  const { unreadCount, notifications } = data;
  const preview = notifications.slice(0, PREVIEW_COUNT);
  const label = unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <div className="nb" ref={boxRef}>
      <button
        type="button"
        className="nb__button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={toggle}
      >
        <Bell size={22} weight={unreadCount ? "fill" : "regular"} />
        {unreadCount > 0 && <span className="nb__badge">{badgeText(unreadCount)}</span>}
      </button>

      {open && (
        <div className="nb__panel" role="dialog" aria-label="Latest notifications">
          <div className="nb__head">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" className="nb__link" onClick={() => markAllRead().catch(() => { })}>
                Mark all read
              </button>
            )}
          </div>

          {preview.length === 0 ? (
            <p className="nb__empty">You're all caught up.</p>
          ) : (
            <ul className="nb__list">
              {preview.map((item) => {
                const { Icon, tone } = typeInfo(item.type);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`nb__item ${item.is_read ? "" : "is-unread"}`}
                      onClick={() => openItem(item)}
                    >
                      <span className={`nt-icon nt-icon--${tone}`}>
                        <Icon size={18} weight="duotone" />
                      </span>
                      <span className="nb__text">
                        <strong>{item.title}</strong>
                        {item.message && <span>{item.message}</span>}
                        <small>{timeAgo(item.created_at)}</small>
                      </span>
                      {!item.is_read && <span className="nt-dot" aria-label="Unread" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <Link className="nb__all" to="/notifications" onClick={() => setOpen(false)}>
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
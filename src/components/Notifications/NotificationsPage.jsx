import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { BellSlash, Check, Checks, Trash } from "@phosphor-icons/react";
import {
  NOTIFICATIONS_CHANGED,
  deleteNotification,
  getNotifications,
  markAllRead,
  markRead,
} from "../../services/notificationService";
import { isToday, timeAgo, typeInfo } from "./notificationHelpers";
import "./Notifications.css";

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
];

// One notification row
function NotificationRow({ item, busy, onToggleRead, onDelete }) {
  const { Icon, tone, to } = typeInfo(item.type);

  return (
    <li className={`nt-row ${item.is_read ? "" : "is-unread"}`}>
      <span className={`nt-icon nt-icon--${tone}`}>
        <Icon size={20} weight="duotone" />
      </span>

      <div className="nt-row__body">
        <div className="nt-row__top">
          <strong>{item.title}</strong>
          {!item.is_read && <span className="nt-dot" aria-label="Unread" />}
        </div>
        {item.message && <p>{item.message}</p>}
        <div className="nt-row__meta">
          <time dateTime={item.created_at}>{timeAgo(item.created_at)}</time>
          {to && (
            <Link to={to} onClick={() => !item.is_read && onToggleRead(item)}>
              View ticket
            </Link>
          )}
        </div>
      </div>

      <div className="nt-row__actions">
        <button
          type="button"
          className="nt-icon-btn"
          onClick={() => onToggleRead(item)}
          disabled={busy}
          aria-label={item.is_read ? `Mark "${item.title}" as unread` : `Mark "${item.title}" as read`}
          title={item.is_read ? "Mark as unread" : "Mark as read"}
        >
          <Check size={18} weight={item.is_read ? "regular" : "bold"} />
        </button>
        <button
          type="button"
          className="nt-icon-btn"
          onClick={() => onDelete(item)}
          disabled={busy}
          aria-label={`Delete "${item.title}"`}
          title="Delete"
        >
          <Trash size={18} />
        </button>
      </div>
    </li>
  );
}

export default function NotificationsPage() {
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState({ status: "loading", error: "", unreadCount: 0, notifications: [] });
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const load = useCallback(({ signal } = {}) => {
    return getNotifications({ signal })
      .then((data) => setPage({ status: "ready", error: "", ...data }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setPage((prev) => ({ ...prev, status: prev.status === "ready" ? "ready" : "error", error: err.message }));
      });
  }, []);

  // First load, and reload after changes made from the bell
  useEffect(() => {
    const controller = new AbortController();
    load({ signal: controller.signal });

    const onChange = () => load();
    window.addEventListener(NOTIFICATIONS_CHANGED, onChange);
    return () => {
      controller.abort();
      window.removeEventListener(NOTIFICATIONS_CHANGED, onChange);
    };
  }, [load]);

  const run = async (id, action) => {
    setBusyId(id);
    setActionError("");
    try {
      await action();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleRead = (item) => run(item.id, () => markRead(item.id, !item.is_read));
  const handleDelete = (item) => run(item.id, () => deleteNotification(item.id));
  const handleMarkAll = () => run("all", markAllRead);

  const { unreadCount, notifications } = page;
  const list = tab === "unread" ? notifications.filter((n) => !n.is_read) : notifications;
  const today = list.filter((n) => isToday(n.created_at));
  const earlier = list.filter((n) => !isToday(n.created_at));

  const groups = [
    { key: "today", title: "Today", items: today },
    { key: "earlier", title: "Earlier", items: earlier },
  ].filter((g) => g.items.length > 0);

  return (
    <main className="nt">
      <div className="nt__container">
        <header className="nt-head">
          <div>
            <h1>Notifications</h1>
            <p>{unreadCount ? `${unreadCount} unread` : "You're all caught up."}</p>
          </div>
          {unreadCount > 0 && (
            <button type="button" className="btn btn--outline nt-head__btn" onClick={handleMarkAll} disabled={busyId === "all"}>
              <Checks size={18} weight="bold" />
              Mark all as read
            </button>
          )}
        </header>

        <div className="nt-tabs" role="tablist" aria-label="Filter notifications">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className="nt-tabs__tab"
              onClick={() => setTab(key)}
            >
              {label}
              {key === "unread" && unreadCount > 0 && <span className="nt-tabs__count">{unreadCount}</span>}
            </button>
          ))}
        </div>

        {actionError && (
          <p className="nt-alert" role="alert">
            {actionError}
          </p>
        )}

        {page.status === "loading" && (
          <div aria-busy="true">
            <div className="nt-skeleton" />
            <div className="nt-skeleton" />
            <div className="nt-skeleton" />
          </div>
        )}

        {page.status === "error" && (
          <div className="nt-empty" role="alert">
            <h2>We couldn't load your notifications</h2>
            <p>{page.error}. Please try again.</p>
            <button type="button" className="btn btn--primary" onClick={() => load()}>
              Try again
            </button>
          </div>
        )}

        {page.status === "ready" && list.length === 0 && (
          <div className="nt-empty">
            <span className="nt-empty__icon">
              <BellSlash size={28} weight="duotone" />
            </span>
            <h2>{tab === "unread" ? "No unread notifications" : "No notifications yet"}</h2>
            <p>We'll let you know when your turn is close, when you're called, and more.</p>
          </div>
        )}

        {page.status === "ready" &&
          groups.map((group) => (
            <section key={group.key} className="nt-group" aria-labelledby={`nt-${group.key}`}>
              <h2 id={`nt-${group.key}`} className="nt-group__title">
                {group.title}
              </h2>
              <ul className="nt-list">
                {group.items.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    busy={busyId === item.id}
                    onToggleRead={handleToggleRead}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            </section>
          ))}
      </div>
    </main>
  );
}
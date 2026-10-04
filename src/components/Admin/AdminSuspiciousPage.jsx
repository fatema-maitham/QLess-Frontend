import { useEffect, useState } from "react";
import { ShieldCheck } from "@phosphor-icons/react";
import AdminTabs from "./AdminTabs";
import {
  getSuspiciousActivity,
  updateSuspiciousActivity,
} from "../../services/adminService";
import { formatDate, label } from "./adminHelpers";
import "./Admin.css";

const STATUS_TABS = [
  { key: "open", label: "Open" },
  { key: "reviewed", label: "Reviewed" },
  { key: "dismissed", label: "Dismissed" },
  { key: "", label: "All" },
];

const SEVERITIES = ["", "high", "medium", "low"];

// One flagged record, with buttons to review or dismiss it
function ActivityCard({ item, busy, onDecide }) {
  const [note, setNote] = useState("");
  const isOpen = item.status === "open";

  return (
    <li className="ad-card">
      <div className="ad-card__top">
        <div>
          <h2 className="ad-card__title">{label(item.activity_type)}</h2>
          <p className="ad-card__sub">
            {item.user_name} · {item.user_email}
          </p>
        </div>
        <div className="ad-badges">
          <span className={`ad-badge ad-badge--${item.severity}`}>{item.severity}</span>
          <span className={`ad-badge ad-badge--${item.status}`}>{item.status}</span>
        </div>
      </div>

      {item.description && <p>{item.description}</p>}

      <dl className="ad-meta">
        <div>
          <dt>Flagged</dt>
          <dd>{formatDate(item.created_at)}</dd>
        </div>
        <div>
          <dt>Queue</dt>
          <dd>{item.queue_name || "—"}</dd>
        </div>
        <div>
          <dt>No-shows</dt>
          <dd>{item.user_no_show_count ?? 0}</dd>
        </div>
        <div>
          <dt>Restricted until</dt>
          <dd>{formatDate(item.user_restricted_until)}</dd>
        </div>
        {!isOpen && (
          <div>
            <dt>Handled by</dt>
            <dd>
              {item.reviewer_name || "—"} · {formatDate(item.reviewed_at)}
            </dd>
          </div>
        )}
      </dl>

      {isOpen && (
        <div className="ad-actions">
          <label className="ad-field">
            <span>Note (optional)</span>
            <input
              className="ad-input"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Why you made this decision"
              maxLength={300}
            />
          </label>
          <div className="ad-actions__buttons">
            <button
              type="button"
              className="ad-btn ad-btn--primary"
              disabled={busy}
              onClick={() => onDecide(item, "reviewed", note)}
            >
              Mark reviewed
            </button>
            <button
              type="button"
              className="ad-btn"
              disabled={busy}
              onClick={() => onDecide(item, "dismissed", note)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function AdminSuspiciousPage() {
  const [status, setStatus] = useState("open");
  const [severity, setSeverity] = useState("");
  const [page, setPage] = useState({ status: "loading", list: [], error: "" });
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  // Load again whenever a filter changes
  useEffect(() => {
    const controller = new AbortController();

    getSuspiciousActivity({ status, severity, signal: controller.signal })
      .then((list) => setPage({ status: "ready", list, error: "" }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setPage({ status: "error", list: [], error: err.message });
      });

    return () => controller.abort();
  }, [status, severity]);

  async function decide(item, newStatus, note) {
    setBusyId(item.id);
    setActionError("");

    try {
      const saved = await updateSuspiciousActivity(item.id, {
        status: newStatus,
        note: note.trim(),
      });

      // Drop it from the list if it no longer matches the status tab
      setPage((prev) => ({
        ...prev,
        list:
          status && saved.status !== status
            ? prev.list.filter((row) => row.id !== saved.id)
            : prev.list.map((row) => (row.id === saved.id ? saved : row)),
      }));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="ad-page">
      <header className="ad-head">
        <p className="ad-eyebrow">Admin</p>
        <h1 className="ad-title">Suspicious activity</h1>
        <p className="ad-sub">
          Accounts flagged automatically for repeated no-shows or for leaving many queues in a short time.
        </p>
      </header>

      <AdminTabs />

      <div className="ad-filters">
        <div className="ad-chips" role="group" aria-label="Filter by status">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key || "all"}
              type="button"
              className={`ad-chip ${status === tab.key ? "is-active" : ""}`}
              aria-pressed={status === tab.key}
              onClick={() => setStatus(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="ad-field ad-field--inline">
          <span>Severity</span>
          <select
            className="ad-select"
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          >
            {SEVERITIES.map((value) => (
              <option key={value || "any"} value={value}>
                {value ? label(value) : "Any"}
              </option>
            ))}
          </select>
        </label>
      </div>

      {actionError && (
        <p className="ad-error" role="alert">
          {actionError}
        </p>
      )}

      {page.status === "loading" && <p className="ad-empty">Loading flagged activity…</p>}

      {page.status === "error" && (
        <div className="ad-empty" role="alert">
          <b>Could not load flagged activity</b>
          <p>{page.error}</p>
        </div>
      )}

      {page.status === "ready" && page.list.length === 0 && (
        <div className="ad-empty">
          <ShieldCheck size={32} weight="duotone" />
          <b>Nothing here</b>
          <p>No flagged activity matches these filters.</p>
        </div>
      )}

      {page.status === "ready" && page.list.length > 0 && (
        <ul className="ad-list">
          {page.list.map((item) => (
            <ActivityCard
              key={item.id}
              item={item}
              busy={busyId === item.id}
              onDecide={decide}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
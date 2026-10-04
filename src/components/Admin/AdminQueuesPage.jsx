import { useEffect, useState } from "react";
import { ArrowClockwise, UsersThree } from "@phosphor-icons/react";
import AdminTabs from "./AdminTabs";
import { getAdminQueues } from "../../services/adminService";
import "./Admin.css";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "open", label: "Open" },
  { key: "paused", label: "Paused" },
  { key: "closed", label: "Closed" },
];

const REFRESH_MS = 30000; // reload every 30 seconds

export default function AdminQueuesPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState({ status: "loading", list: [], error: "", updatedAt: null });
  const [reloadKey, setReloadKey] = useState(0);

  // Load the queues when the filter changes or a refresh happens
  useEffect(() => {
    const controller = new AbortController();

    getAdminQueues({ status, signal: controller.signal })
      .then((list) => setPage({ status: "ready", list, error: "", updatedAt: new Date() }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setPage((prev) => ({ ...prev, status: "error", error: err.message }));
      });

    return () => controller.abort();
  }, [status, reloadKey]);

  // Keep the numbers live
  useEffect(() => {
    const id = setInterval(() => setReloadKey((key) => key + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const { list } = page;
  const openCount = list.filter((queue) => queue.status === "open").length;
  const waitingTotal = list.reduce((sum, queue) => sum + (queue.waiting_count || 0), 0);
  const calledTotal = list.reduce((sum, queue) => sum + (queue.called_count || 0), 0);

  return (
    <main className="ad-page">
      <header className="ad-head">
        <p className="ad-eyebrow">Admin</p>
        <h1 className="ad-title">Queues</h1>
        <p className="ad-sub">Every queue on QLess with live counts. Refreshes every 30 seconds.</p>
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

        <div className="ad-actions__buttons">
          {page.updatedAt && (
            <span className="ad-updated">
              Updated {page.updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button type="button" className="ad-btn" onClick={() => setReloadKey((key) => key + 1)}>
            <ArrowClockwise size={16} weight="bold" /> Refresh
          </button>
        </div>
      </div>

      {page.status === "error" && (
        <p className="ad-error" role="alert">
          Could not load queues: {page.error}
        </p>
      )}

      {page.status === "loading" && <p className="ad-empty">Loading queues…</p>}

      {page.status !== "loading" && list.length > 0 && (
        <>
          <div className="ad-summary">
            <div className="ad-tile">
              <b>{openCount}</b>
              <span>open {openCount === 1 ? "queue" : "queues"}</span>
            </div>
            <div className="ad-tile">
              <b>{waitingTotal}</b>
              <span>people waiting</span>
            </div>
            <div className="ad-tile">
              <b>{calledTotal}</b>
              <span>called, not yet served</span>
            </div>
          </div>

          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th scope="col">Queue</th>
                  <th scope="col">Business / branch</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="ad-num">Waiting</th>
                  <th scope="col" className="ad-num">Called</th>
                  <th scope="col" className="ad-num">Now serving</th>
                  <th scope="col" className="ad-num">Capacity</th>
                </tr>
              </thead>
              <tbody>
                {list.map((queue) => (
                  <tr key={queue.id}>
                    <td>
                      <b>{queue.name}</b>
                      <small>{queue.service_name || "Any service"}</small>
                    </td>
                    <td>
                      {queue.business_name}
                      <small>{queue.branch_name}</small>
                    </td>
                    <td>
                      <span className={`ad-badge ad-badge--${queue.status}`}>{queue.status}</span>
                    </td>
                    <td className="ad-num">{queue.waiting_count}</td>
                    <td className="ad-num">{queue.called_count}</td>
                    <td className="ad-num">{queue.current_number ? `#${queue.current_number}` : "—"}</td>
                    <td className="ad-num">{queue.max_capacity ?? "No limit"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {page.status === "ready" && list.length === 0 && (
        <div className="ad-empty">
          <UsersThree size={32} weight="duotone" />
          <b>No queues</b>
          <p>No queues match this filter.</p>
        </div>
      )}
    </main>
  );
}
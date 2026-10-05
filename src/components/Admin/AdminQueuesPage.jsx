import { useCallback, useEffect, useState } from "react";
import { getAdminQueues } from "../../services/adminService";
import { initial } from "../Owner/ownerSetup";
import { SearchBox, Tabs, matches } from "../AdminPanel/AdminParts";
import { Kpi } from "./AdminBits";
import { clock } from "./adminHelpers";
import "./Admin.css";

const REFRESH_MS = 30000; // reload every 30 seconds

const STATUS = {
  open: { text: "Open", cls: "open" },
  paused: { text: "Paused", cls: "warn" },
  closed: { text: "Closed", cls: "off" },
};

export default function AdminQueuesPage() {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [tab, setTab] = useState("open");
  const [q, setQ] = useState("");

  const load = useCallback(async (signal) => {
    try {
      setList(await getAdminQueues({ signal }));
      setUpdatedAt(new Date());
      setError("");
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    }
  }, []);

  // Load now, then every 30 seconds so the numbers stay live
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    const id = setInterval(() => load(), REFRESH_MS);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [load]);

  if (error && !list) return <div className="empty"><b>Couldn't load the queues</b><p>{error}</p></div>;
  if (!list) return null;

  const byStatus = (status) => list.filter((queue) => queue.status === status);
  const open = byStatus("open");
  const waiting = list.reduce((sum, queue) => sum + (queue.waiting_count || 0), 0);
  const called = list.reduce((sum, queue) => sum + (queue.called_count || 0), 0);
  const longest = Math.max(0, ...list.map((queue) => queue.waiting_count || 0));

  const tabs = [
    { key: "open", label: "Open", count: open.length },
    { key: "paused", label: "Paused", count: byStatus("paused").length },
    { key: "closed", label: "Closed", count: byStatus("closed").length },
    { key: "all", label: "All", count: list.length },
  ];

  // Busiest queues first
  const shown = list
    .filter((queue) => tab === "all" || queue.status === tab)
    .filter((queue) => matches(`${queue.name} ${queue.business_name} ${queue.branch_name} ${queue.service_name}`, q))
    .sort((a, b) => (b.waiting_count || 0) - (a.waiting_count || 0));

  const details = (queue) =>
    [queue.business_name, queue.branch_name, queue.service_name || "Any service"].filter(Boolean).join(" · ");

  return (
    <section className="am-page">
      <div className="page-h">
        <h1>Live queues</h1>
        <span className="sp" />
        {updatedAt && <span className="am-updated">Updated {clock(updatedAt)}</span>}
        <SearchBox value={q} onChange={setQ} placeholder="Search queues" />
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => load()}>
          Refresh
        </button>
      </div>

      <div className="am-kpis">
        <Kpi icon="queues" value={open.length} label="Open queues" note={`of ${list.length} in total`} />
        <Kpi icon="users" value={waiting} label="People waiting" note="across every branch" />
        <Kpi icon="overview" value={called} label="Called, not served yet" note="at the counter now" />
        <Kpi icon="branches" value={longest} label="Longest line" note={longest ? "people in one queue" : "no one waiting"} />
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {shown.length ? (
        <div className="list">
          {shown.map((queue) => {
            const st = STATUS[queue.status] || STATUS.closed;
            const full = queue.max_capacity && queue.waiting_count >= queue.max_capacity;
            return (
              <div className={`li am-li am-li--nums${queue.status === "closed" ? " off" : ""}`} key={queue.id}>
                <span className="ic">{initial(queue.business_name)}</span>
                <div>
                  <b>{queue.name}</b>
                  <small>{details(queue)}</small>
                </div>
                <span className={`st ${full ? "bad" : st.cls}`}>{full ? "Full" : st.text}</span>
                <span className="am-nums">
                  <span><b>{queue.waiting_count}</b>waiting</span>
                  <span><b>{queue.called_count}</b>called</span>
                  <span><b>{queue.current_number ? `#${queue.current_number}` : "—"}</b>serving</span>
                  <span><b>{queue.max_capacity ?? "∞"}</b>limit</span>
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <b>{q ? "Nothing matches your search" : `No ${tab === "all" ? "" : `${tab} `}queues`}</b>
          <p>{q ? "Try another queue or business name." : "Queues show up here when owners create them."}</p>
        </div>
      )}

      {error && <p className="am-note">Couldn't refresh ({error}). These are the last numbers we got.</p>}
    </section>
  );
}